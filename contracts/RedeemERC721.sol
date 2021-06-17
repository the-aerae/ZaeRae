// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;
import {ERC721} from "./ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IMedia} from "./interfaces/IMedia.sol";

contract RedeemERC721 {
    /* *******
     * Globals
     * *******
     */

    //Contract deployer Address
    address public deployer;
    //Address for the market contract
    address public marketContractAddress;

    //Address for the Media contract
    address public mediaContractAddress;
    //Mapping from token to Redeem Request
    mapping(uint256 => RedeemRequest) public redeemRequests;

    /* *******
     * Structs
     * *******
     */

    struct RedeemRequest {
        address owner;
        address creator;
        bool creatorSigned;
        bool ownerSigned;
    }

    function creatorSignRequest(uint256 tokenId) public {
        redeemRequests[tokenId].creatorSigned = true;
    }

    function ownerSign(uint256 tokenId) public {
        redeemRequests[tokenId].ownerSigned = true;
    }

    function makeRedeemRequest(uint256 tokenId) public {
        /**
         **TODO: change address to actual creators address
         */
        address creator = deployer;

        IERC721(mediaContractAddress).transferFrom(
            msg.sender,
            address(this),
            tokenId
        );
        redeemRequests[tokenId] = RedeemRequest(
            msg.sender,
            creator,
            false,
            false
        );
    }

    function isERC721InContractCustody(uint256 tokenId)
        external
        view
        returns (bool)
    {
        address owner = IERC721(mediaContractAddress).ownerOf(tokenId);
        if (owner != address(this)) {
            return false;
        }
        return true;
    }

    function returnERC721ToOwner(uint256 tokenId) external {
        require(
            !redeemRequests[tokenId].ownerSigned,
            "Redeem: Creator Already Signed"
        );
        IERC721(mediaContractAddress).transferFrom(
            address(this),
            msg.sender,
            tokenId
        );
    }

    constructor(address _marketContractAddress, address _mediaContractAddress)
        public
    {
        marketContractAddress = _marketContractAddress;
        mediaContractAddress = _mediaContractAddress;
        deployer = msg.sender;
    }
}
