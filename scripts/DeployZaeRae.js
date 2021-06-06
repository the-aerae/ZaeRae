async function main() {
  //setup accounts
  accounts = await ethers.getSigners();

  // - Forwarder deployment
  const Forwarder = await ethers.getContractFactory('TestForwarder');
  forwarder = await Forwarder.deploy(await accounts[0].getAddress());
  await forwarder.deployed();
  //creates aerae forwarder for the first time (saving this address is important, we will use it as the forwarder for all work going forward)
  await forwarder.registerDomainSeparator('AeraeForwarder', '1');
  // trustless ftw
  await forwarder.renounceOwnership();

  console.log(' Forwarder Deployed @ ' + forwarder.address);

  // - Market deployment
  const Market = await ethers.getContractFactory('Market');
  market = await Market.deploy();
  await market.deployed();

  console.log(' Market Deployed @ ' + market.address);

  // - Media deployment
  const Media = await ethers.getContractFactory('Media');
  media = await Media.deploy(market.address);

  console.log(' Media Deployed @ ' + media.address);

  // - setForwarder on Media
  await media.setForwarder(forwarder.address);

  console.log('Media contract configured');

  // - configure market
  await market.configure(media.address);

  console.log('Market contract configured');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
