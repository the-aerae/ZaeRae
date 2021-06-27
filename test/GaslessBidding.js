const { expect } = require('chai');
const { ethers: ethersMain } = require('ethers');
const { privateKeys } = require('../utils/generatedWallets');

let forwarder;
let market;
let media;
let accounts;
let token;
let domain;
let domainSeparator;

const types = {
  ERC20ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'txGas', type: 'uint256' },
    { name: 'tokenGasPrice', type: 'uint256' },
    { name: 'batchId', type: 'uint256' },
    { name: 'batchNonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
};

describe('Gasless Bidding', function () {
  beforeEach(async function () {
    //setup accounts
    accounts = await ethers.getSigners();
    let chainId = 137;

    //initialise contracts

    // - test erc20 deployment
    Token = await ethers.getContractFactory('BaseERC20');
    token = await Token.deploy('TEST', 'TEST', 18);
    await token.deployed();

    // - Forwarder deployment
    const Forwarder = await ethers.getContractFactory('TestForwarder');
    forwarder = await Forwarder.deploy(await accounts[0].getAddress());
    await forwarder.deployed();
    await forwarder.registerDomainSeparator('testForwarder', '1');
    domain = {
      name: 'testForwarder',
      version: '1',
      chainId: chainId,
      verifyingContract: forwarder.address,
    };
    domainSeparator = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [
          ethers.utils.id(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
          ),
          ethers.utils.id('testForwarder'),
          ethers.utils.id('1'),
          chainId,
          forwarder.address,
        ]
      )
    );

    // - Market deployment
    const Market = await ethers.getContractFactory('Market');
    market = await Market.deploy();
    await market.deployed();

    // - Media deployment
    const Media = await ethers.getContractFactory('Media');
    media = await Media.deploy(market.address);

    // - setForwarder on Media
    await media.setForwarder(forwarder.address);

    // - configure market
    await market.configure(media.address);

    //mint NFT

    // - media data
    const content = 'https://www.test123.xyz/baebay/0';
    const metadata = 'https://www.test123.xyz/baebay/metadata/0';
    const contentHash = ethers.utils.id(content);
    const metadataHash = ethers.utils.id(metadata);

    await media.connect(accounts[1]).mint(
      {
        tokenURI: content,
        metadataURI: metadata,
        contentHash: contentHash,
        metadataHash: metadataHash,
      },
      {
        owner: { value: ethers.utils.parseEther('95') },
        creator: { value: ethers.utils.parseEther('5') },
        prevOwner: { value: ethers.utils.parseEther('0') },
      }
    );
  });

  it('Meta tx bidding works', async function () {
    //give account 2 enough tokens to bid
    await token.mint(await accounts[2].getAddress(), 1000);
    await token.connect(accounts[2]).approve(market.address, 1000);
    // build bid Tx data
    const popTx = await media
      .connect(accounts[2])
      .populateTransaction.setBid(0, [
        100,
        token.address,
        await accounts[2].getAddress(),
        await accounts[2].getAddress(),
        { value: ethers.utils.parseEther('0') },
      ]);

    const req = {
      from: await accounts[2].getAddress(),
      to: media.address,
      token: token.address,
      txGas: 1000000,
      tokenGasPrice: 0,
      batchId: 0,
      batchNonce: 0,
      deadline: Math.floor(Date.now() / 1000) + 120,
      data: popTx.data,
    };

    // sign
    const dataToSign = {
      types: types,
      domain: domain,
      primaryType: 'ERC20ForwardRequest',
      message: req,
    };
    const signature = await ethers.provider.send('eth_signTypedData', [
      req.from,
      dataToSign,
    ]);

    // execute bid
    await forwarder.executeEIP712(req, domainSeparator, signature);

    // verify bid happened
  });
});

//bid without paying gas
// - construct data
// - sign MetaTx
// - send
// - verify bid exists

//function for building meta tx
