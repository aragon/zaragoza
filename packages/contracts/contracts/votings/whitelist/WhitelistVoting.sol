/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "./../../core/component/Component.sol";
import "./../../core/IDAO.sol";
import "./../../utils/TimeHelpers.sol";

contract WhitelistVoting is Component, TimeHelpers {
    bytes32 public constant MODIFY_CONFIG = keccak256("MODIFY_VOTE_CONFIG");
    bytes32 public constant MODIFY_WHITELIST = keccak256("MODIFY_WHITELIST");

    uint64 public constant PCT_BASE = 10 ** 18; // 0% = 0; 1% = 10^16; 100% = 10^18

    enum VoterState { Absent, Yea, Nay }

    struct Vote {
        bool executed;
        uint64 startDate;
        uint64 supportRequiredPct;
        uint64 votingPower;
        uint256 yea;
        uint256 nay;
        mapping (address => VoterState) voters;
        IDAO.Action[] actions;
    }

    mapping (uint256 => Vote) internal votes;

    uint64 public supportRequiredPct;
    uint64 public voteTime;
    uint64 private whitelistedLength;
    uint256 public votesLength;

    mapping(address => bool) public whitelisted;
    
    string private constant ERROR_NO_VOTE = "VOTING_NO_VOTE";
    string private constant ERROR_INIT_PCTS = "VOTING_INIT_PCTS";
    string private constant ERROR_CHANGE_SUPPORT_PCTS = "VOTING_CHANGE_SUPPORT_PCTS";
    string private constant ERROR_INIT_SUPPORT_TOO_BIG = "VOTING_INIT_SUPPORT_TOO_BIG";
    string private constant ERROR_CHANGE_SUPPORT_TOO_BIG = "VOTING_CHANGE_SUPP_TOO_BIG";
    string private constant ERROR_CAN_NOT_VOTE = "VOTING_CAN_NOT_VOTE";
    string private constant ERROR_CAN_NOT_EXECUTE = "VOTING_CAN_NOT_EXECUTE";
    string private constant ERROR_CAN_NOT_CREATE_VOTE = "VOTING_CAN_NOT_CREATE_VOTE";

    event StartVote(uint256 indexed voteId, address indexed creator, bytes description);
    event CastVote(uint256 indexed voteId, address indexed voter, bool voterSupports);
    event ExecuteVote(uint256 indexed voteId);
    event UpdateConfig(uint64 supportRequiredPct);

    /// @dev describes the version and contract for GSN compatibility.
    function versionRecipient() external virtual override view returns (string memory) {
        return "0.0.1+opengsn.recipient.WhitelistVoting";
    }

    /// @dev Used for UUPS upgradability pattern
    /// @param _dao The DAO contract of the current DAO
    function initialize(
        IDAO _dao, 
        address[] calldata _whitelisted,
        uint64 _supportRequiredPct,
        uint64 _voteTime
    ) public initializer { 
        require(_supportRequiredPct < PCT_BASE, ERROR_INIT_SUPPORT_TOO_BIG);

        supportRequiredPct = _supportRequiredPct; 
        voteTime = _voteTime;
        
        // add whitelisted users.
        for(uint256 i = 0; i < _whitelisted.length; i++) {
            whitelisted[_whitelisted[i]] = true;
        }

        whitelistedLength = uint64(_whitelisted.length);

        Component.initialize(_dao, address(0));
        
        emit UpdateConfig(_supportRequiredPct);
    }

    /**
    * @notice add new users to the whitelist.
    * @param _users addresses of users to add
    */
    function addWhitelistedUsers(address[] calldata _users) external auth(MODIFY_WHITELIST) {
        for(uint256 i = 0; i < _users.length; i++) {
            whitelisted[_users[i]] = true;
        }

        whitelistedLength += uint64(_users.length);
    }

    /**
    * @notice remove new users to the whitelist.
    * @param _users addresses of users to remove
    */
    function removeWhitelistedUsers(address[] calldata _users) external auth(MODIFY_WHITELIST) {
        for(uint256 i = 0; i < _users.length; i++) {
            whitelisted[_users[i]] = false;
        }

        whitelistedLength -= uint64(_users.length);
    }

    /**
    * @notice Change required support and minQuorum
    * @param _supportRequiredPct New required support
    */
    function changeVoteConfig(uint64 _supportRequiredPct) external auth(MODIFY_CONFIG) {
        require(_supportRequiredPct < PCT_BASE, ERROR_CHANGE_SUPPORT_TOO_BIG);

        supportRequiredPct = _supportRequiredPct;

        emit UpdateConfig(supportRequiredPct);
    }

    /**
    * @notice Create a new vote on this concrete implementation
    * @param proposalMetadata The IPFS hash pointing to the proposal metadata
    * @param executeIfDecided Configuration to enable automatic execution on the last required vote
    * @param castVote Configuration to cast vote as "YES" on creation of it
    */
    function newVote(
        bytes calldata proposalMetadata,
        IDAO.Action[] calldata _actions,
        bool executeIfDecided, 
        bool castVote
    ) external returns (uint256 voteId) {
        require(whitelisted[msg.sender], ERROR_CAN_NOT_CREATE_VOTE);
        
        voteId = votesLength++;

        Vote storage vote_ = votes[voteId];
        vote_.startDate = getTimestamp64();
        vote_.supportRequiredPct = supportRequiredPct;
        vote_.votingPower = whitelistedLength;

        for (uint256 i; i < _actions.length; i++) {
            vote_.actions.push(_actions[i]);
        }

        emit StartVote(voteId, msg.sender, proposalMetadata);
    
        if (castVote && canVote(voteId, msg.sender)) {
            _vote(voteId, true, msg.sender, executeIfDecided);
        }
    }

    /**
    * @notice Vote `_supports ? 'yes' : 'no'` in vote #`_voteId`
    * @param _voteId Id for vote
    * @param _supports Whether voter supports the vote
    * @param _executesIfDecided Whether the vote should execute its action if it becomes decided
    */
    function vote(uint256 _voteId, bool _supports, bool _executesIfDecided) external {
        require(_canVote(_voteId, msg.sender), ERROR_CAN_NOT_VOTE);
        _vote(_voteId, _supports, msg.sender, _executesIfDecided);
    }

    /**
    * @dev Internal function to cast a vote. It assumes the queried vote exists. 
    * @param _voteId voteId
    * @param _supports whether user supports the decision or not
    * @param _executesIfDecided if true, and it's the last vote required, immediatelly executes a vote.
    */
    function _vote(uint256 _voteId, bool _supports, address _voter, bool _executesIfDecided) internal {
        Vote storage vote_ = votes[_voteId];

        VoterState state = vote_.voters[_voter];

        // If voter had previously voted, decrease count
        if (state == VoterState.Yea) {
            vote_.yea = vote_.yea - 1;
        } else if (state == VoterState.Nay) {
            vote_.nay = vote_.nay - 1;
        }

        if (_supports) {
            vote_.yea = vote_.yea + 1;
        } else {
            vote_.nay = vote_.nay + 1;
        }

        vote_.voters[_voter] = _supports ? VoterState.Yea : VoterState.Nay;

        emit CastVote(_voteId, _voter, _supports);

        if (_executesIfDecided && _canExecute(_voteId)) {
           _execute(_voteId);
        }
    }

    /**
    * @dev Method to execute a vote if allowed to
    * @param _voteId The ID of the vote to execute
    */
    function execute(uint256 _voteId) public {
        require(_canExecute(_voteId), ERROR_CAN_NOT_EXECUTE);
        _execute(_voteId);
    }

    /**
    * @dev Internal function to execute a vote. It assumes the queried vote exists.
    * @param _voteId the vote Id
    */
    function _execute(uint256 _voteId) internal {
        dao.execute(votes[_voteId].actions);

        votes[_voteId].executed = true;

        emit ExecuteVote(_voteId);
    }
    
    /**
    * @dev Return the state of a voter for a given vote by its ID
    * @param _voteId Vote identifier
    * @return VoterState of the requested voter for a certain vote
    */
    function getVoterState(uint256 _voteId, address _voter) public view returns (VoterState) {
        return votes[_voteId].voters[_voter];
    }

    /**
    * @dev Internal function to check if a voter can participate on a vote. It assumes the queried vote exists.
    * @param _voteId the vote Id
    * @param _voter the address of the voter to check
    * @return bool true if user is allowed to vote
    */
    function canVote(uint256 _voteId, address _voter) public view returns (bool) {
        return _canVote(_voteId, _voter);
    }

    /**
    * @notice Tells whether a vote #`_voteId` can be executed or not
    * @dev Initialization check is implicitly provided by `voteExists()` as new votes can only be
    *      created via `newVote(),` which requires initialization
    * @return True if the given vote can be executed, false otherwise
    */
    function canExecute(uint256 _voteId) public view returns (bool) {
        return _canExecute(_voteId);
    }

    /**
    * @dev Return all information for a vote by its ID
    * @param _voteId Vote id
    * @return open Vote open status
    * @return executed Vote executed status
    * @return startDate start date
    * @return supportRequired support required
    * @return votingPower power
    * @return yea yeas amount
    * @return nay nays amount
    * @return actions Actions
    */
    function getVote(uint256 _voteId)
        public
        view
        returns (
            bool open,
            bool executed,
            uint64 startDate,
            uint64 supportRequired,
            uint64 votingPower,
            uint256 yea,
            uint256 nay,
            IDAO.Action[] memory actions
        )
    {
        Vote storage vote_ = votes[_voteId];
        
        open = _isVoteOpen(vote_);
        executed = vote_.executed;
        startDate = vote_.startDate;
        supportRequired = vote_.supportRequiredPct;
        votingPower = vote_.votingPower;
        yea = vote_.yea;
        nay = vote_.nay;
        actions = vote_.actions;
    }

    /**
    * @dev Internal function to check if a voter can participate on a vote. It assumes the queried vote exists.
    * @param _voteId The voteId
    * @param _voter the address of the voter to check
    * @return True if the given voter can participate a certain vote, false otherwise
    */
    function _canVote(uint256 _voteId, address _voter) internal view returns (bool) {
        Vote storage vote_ = votes[_voteId];
        return _isVoteOpen(vote_) && whitelisted[_voter];
    }

    /**
    * @dev Internal function to check if a vote is still open
    * @param vote_ the vote struct
    * @return True if the given vote is open, false otherwise
    */
    function _isVoteOpen(Vote storage vote_) internal view returns (bool) {
        return getTimestamp64() < vote_.startDate + voteTime && !vote_.executed;
    }

    /**
    * @dev Internal function to check if a vote can be executed. It assumes the queried vote exists.
    * @param _voteId vote id
    * @return True if the given vote can be executed, false otherwise
    */
    function _canExecute(uint256 _voteId) internal view returns (bool) {
        Vote storage vote_ = votes[_voteId];

        if (vote_.executed) {
            return false;
        }

        // Voting is already decided
        if (_isValuePct(vote_.yea, vote_.votingPower, vote_.supportRequiredPct)) {
            return true;
        }

        // Vote ended?
        if (_isVoteOpen(vote_)) {
            return false;
        }
        
        // Has enough support?
        uint256 totalVotes = vote_.yea + vote_.nay;
        if (_isValuePct(vote_.yea, totalVotes, vote_.supportRequiredPct)) {
            return true;
        }

        return false;
    }

    /**
    * @dev Calculates whether `_value` is more than a percentage `_pct` of `_total`
    * @param _value the current value 
    * @param _total the total value
    * @param _pct the required support percentage
    * @return returns if the _value is _pct or more percentage of _total. 
    */
    function _isValuePct(uint256 _value, uint256 _total, uint256 _pct) internal pure returns (bool) {
       if (_total == 0) {
           return false;
       }
    
       uint256 computedPct = _value * PCT_BASE / _total;
       return computedPct > _pct;
    }
}
