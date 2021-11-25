/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../DAO.sol";
import "../vault/Vault.sol";
import "../governance-primitives/voting/SimpleVoting.sol";
import "../tokens/GovernanceERC20.sol";
import "../tokens/GovernanceWrappedERC20.sol";
import "../registry/Registry.sol";
import "../processes/Processes.sol";
import "../permissions/Permissions.sol";
import "../executor/Executor.sol";

contract DAOFactory {

    using Address for address;
    
    address private votingBase;
    address private vaultBase;
    address private daoBase;
    address private governanceERC20Base;
    address private governanceWrappedERC20Base;
    address private processesBase;
    address private permissionsBase;
    address private executorBase;

    Registry private registry;

    struct TokenConfig {
        address addr;
        string name;
        string symbol;
    }

    constructor(Registry _registry) {
        registry = _registry;
        setupBases();
    }

    function newDAO(
        bytes calldata _metadata,
        TokenConfig calldata _tokenConfig,
        uint256[3] calldata _votingSettings,
        uint256[3] calldata _vaultSettings
    ) external {
        // setup Token
        // TODO: Do we wanna leave the option not to use any proxy pattern in such case ? 
        // delegateCall is costly if so many calls are needed for a contract after the deployment.
        address token = _tokenConfig.addr;
        // https://forum.openzeppelin.com/t/what-is-the-best-practice-for-initializing-a-clone-created-with-openzeppelin-contracts-proxy-clones-sol/16681
        if(token == address(0)) {
            token = Clones.clone(governanceERC20Base);
            GovernanceERC20(token).initialize(_tokenConfig.name, _tokenConfig.symbol);
        } else {
            token = Clones.clone(governanceWrappedERC20Base);
            // user already has a token. we need to wrap it in our new token to make it governance token.
            GovernanceWrappedERC20(token).initialize(IERC20Upgradeable(_tokenConfig.addr), _tokenConfig.name, _tokenConfig.symbol);
        }

        // Creates necessary contracts for dao.
        // Don't call initialize yet as DAO's initialize need contracts
        // that haven't been deployed yet.
        DAO dao = DAO(createProxy(daoBase, bytes("")));
        address voting = createProxy(votingBase, abi.encodeWithSelector(SimpleVoting.initialize.selector, dao, token, _votingSettings));
        address vault = createProxy(vaultBase, abi.encodeWithSelector(Vault.initialize.selector, dao, _vaultSettings));
        address processes = createProxy(processesBase, abi.encodeWithSelector(Processes.initialize.selector, dao));
        address permissions = createProxy(permissionsBase, abi.encodeWithSelector(Permissions.initialize.selector, dao));
        address executor = createProxy(executorBase, abi.encodeWithSelector(Executor.initialize.selector, dao));
        
        dao.initialize(
            _metadata,
            Processes(processes),
            Permissions(permissions),
            Executor(executor),
            address(this) // initial ACL root on DAO itself.
        );
        

        // TODO: do we really need to cast it to payable ? 
        dao.grant(vault, voting, Vault(payable(vault)).TRANSFER_ROLE()); // give voting contract the power on vault for transfer role.
        dao.grant(executor, voting, Executor(executor).EXEC_ROLE()); // give voting contract the power on executor for executing actions.
        
        // TODO: come up with a solution that only one grant is enough to accomodate for all contracts.
        dao.grant(vault, voting, Executor(executor).UPGRADE_ROLE());
        dao.grant(executor, voting, Executor(executor).UPGRADE_ROLE());
        dao.grant(permissions, voting, Executor(executor).UPGRADE_ROLE());
        dao.grant(processes, voting, Executor(executor).UPGRADE_ROLE());
        dao.grant(voting, voting, Executor(executor).UPGRADE_ROLE());
        dao.grant(address(dao), voting, Executor(executor).UPGRADE_ROLE());
              

    }

    function createProxy(address _logic, bytes memory _data) private returns(address) {
        return address(new ERC1967Proxy(_logic, _data));
    }

    function setupBases() private {
        votingBase = address(new SimpleVoting());
        vaultBase = address(new Vault());
        daoBase = address(new DAO());
        governanceERC20Base = address(new GovernanceERC20());
        governanceWrappedERC20Base = address(new GovernanceWrappedERC20());
        processesBase = address(new Processes());
        permissionsBase = address(new Permissions());
        executorBase = address(new Executor());
    }
}

