/*
 * SPDX-License-Identifier:    MIT
 */


pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../DAO.sol";
import "../../lib/acl/ACL.sol";


/**
*  Aragon's contracts extend from this for upgradability.
*  This includes ACL as well for each contract.
 */

abstract contract Component {
    DAO internal dao;

    function initialize(DAO _dao) public virtual  {
        dao = DAO(_dao);
    }

    modifier authP(bytes32 role)  {
        require(dao.hasPermission(address(this), msg.sender, role), "auth: check");
        _;
    }
}

abstract contract UpgradableComponent is Component, UUPSUpgradeable, Initializable {

    bytes32 public constant UPGRADE_ROLE = keccak256("UPGRADE_ROLE");

    function _authorizeUpgrade(address /*_newImplementation*/) internal override authP(UPGRADE_ROLE) {
        // require(willPerform(UPGRADE_ROLE, msg.sender, ""), "Not able to update");
    }

}
