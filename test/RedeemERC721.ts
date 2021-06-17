import { JsonRpcProvider } from '@ethersproject/providers'
import chai, { expect } from 'chai'
import asPromised from 'chai-as-promised'
import { Signer } from 'crypto'

import { BigNumber, Bytes, ethers } from 'ethers'
import {
    arrayify,
    formatBytes32String,
    formatUnits,
    sha256,
} from 'ethers/lib/utils'
import {
    Media,
    RedeemErc721,
    Market,
    MediaFactory,
    MarketFactory,
    RedeemErc721Factory,
    TestForwarder,
    TestForwarderFactory,
} from '../typechain'
import { Blockchain } from '../utils/Blockchain'
import Decimal from '../utils/Decimal'
import { generatedWallets } from '../utils/generatedWallets'

chai.use(asPromised)

type BidShares = {
    owner: DecimalValue
    prevOwner: DecimalValue
    creator: DecimalValue
}

let defaultBidShares = {
    prevOwner: Decimal.new(10),
    owner: Decimal.new(80),
    creator: Decimal.new(10),
}

let defaultTokenId = 1

type MediaData = {
    tokenURI: string
    metadataURI: string
    contentHash: Bytes
    metadataHash: Bytes
}

type DecimalValue = { value: BigNumber }

type ERC712Domain = {
    name: string
    version: string
    salt: number
    verifyingContract: string
}

type RedeemRequest = {
    owner: DecimalValue
    creator: DecimalValue
    ownerSigned: boolean
    creatorSigned: boolean
}

let provider = new JsonRpcProvider()
let blockchain = new Blockchain(provider)

describe('RedeemERC721', () => {
    let [
        deployerWallet,
        bidderWallet,
        creatorWallet,
        ownerWallet,
        prevOwnerWallet,
        otherWallet,
        nonBidderWallet,
    ] = generatedWallets(provider)

    let redeemERC721: RedeemErc721
    let media: Media
    let market: Market
    let forwarder: TestForwarder
    let domain: ERC712Domain
    let domainSeparator: any


    let contentHex: string;
    let contentHash: string;
    let contentHashBytes: Bytes;
    let otherContentHex: string;
    let otherContentHash: string;
    let otherContentHashBytes: Bytes;
    let zeroContentHashBytes: Bytes;
    let metadataHex: string;
    let metadataHash: string;
    let metadataHashBytes: Bytes;

    let tokenURI = 'www.example.com';
    let metadataURI = 'www.example2.com';


    const setUpHashes = async () => {
        await blockchain.resetAsync();

        metadataHex = ethers.utils.formatBytes32String('{}');
        metadataHash = await sha256(metadataHex);
        metadataHashBytes = ethers.utils.arrayify(metadataHash);

        contentHex = ethers.utils.formatBytes32String('invert');
        contentHash = await sha256(contentHex);
        contentHashBytes = ethers.utils.arrayify(contentHash);

        otherContentHex = ethers.utils.formatBytes32String('otherthing');
        otherContentHash = await sha256(otherContentHex);
        otherContentHashBytes = ethers.utils.arrayify(otherContentHash);

        zeroContentHashBytes = ethers.utils.arrayify(ethers.constants.HashZero);
    }


    const deployContracts = async () => {
        forwarder = await (
            await new TestForwarderFactory(deployerWallet).deploy(
                deployerWallet.address
            )
        ).deployed()
        market = await (await new MarketFactory(deployerWallet).deploy()).deployed()
        media = await (
            await new MediaFactory(deployerWallet).deploy(market.address)
        ).deployed()
        redeemERC721 = await (
            await new RedeemErc721Factory(deployerWallet).deploy(
                market.address,
                media.address
            )
        ).deployed()
    }

    const setUpForwarder = async () => {
        await forwarder.registerDomainSeparator('testForwarder', '1')
        domain = {
            name: 'testForwarder',
            version: '1',
            salt: 1,
            verifyingContract: forwarder.address,
        }

        domainSeparator = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
                [
                    ethers.utils.id(
                        'EIP712Domain(string name,string version,uint256 salt,address verifyingContract)'
                    ),
                    ethers.utils.id('testForwarder'),
                    ethers.utils.id('1'),
                    1,
                    forwarder.address,
                ]
            )
        )
    }

    const mint = async (
        metadataURI: string,
        tokenURI: string,
        contentHash: Bytes,
        metadataHash: Bytes,
        shares: BidShares
    ) => {
        const data: MediaData = {
            tokenURI,
            metadataURI,
            contentHash,
            metadataHash,
        }
        return media.connect(creatorWallet).mint(data, shares)
    }

    beforeEach(async () => {
        await deployContracts()
        await setUpForwarder()
        await setUpHashes()
        await mint(metadataURI, tokenURI, contentHashBytes, metadataHashBytes, defaultBidShares)
    })
})
