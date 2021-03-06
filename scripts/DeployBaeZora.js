async function main() {
  //setup accounts
  accounts = await ethers.getSigners();

  // - Forwarder deployment
  const Forwarder = await ethers.getContractFactory('TestForwarder');
  forwarder = await Forwarder.deploy(await accounts[0].getAddress());
  await forwarder.deployed();
  await forwarder.registerDomainSeparator('BaeZoraForwarder', '1');
  // trustless nudes ftw
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
