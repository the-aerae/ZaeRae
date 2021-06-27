import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-typechain';
import 'hardhat-deploy';
import { privateKeys } from './utils/generatedWallets';
import { makeKeyList } from './utils/walletUtils';

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
const config: HardhatUserConfig = {
  networks:{
    matic:{
      url:"https://rpc-mainnet.matic.network",
      accounts: makeKeyList()
    },
    hardhat:{
      chainId:137,
      gas:9500000,
      accounts:[
        {privateKey:privateKeys[0],balance:"1000000000000000000000"},
        {privateKey:privateKeys[1],balance:"1000000000000000000000"},
        {privateKey:privateKeys[2],balance:"1000000000000000000000"},
        {privateKey:privateKeys[3],balance:"1000000000000000000000"},
        {privateKey:privateKeys[4],balance:"1000000000000000000000"},
        {privateKey:privateKeys[5],balance:"1000000000000000000000"},
        {privateKey:privateKeys[6],balance:"1000000000000000000000"},
        {privateKey:privateKeys[7],balance:"1000000000000000000000"},
        {privateKey:privateKeys[8],balance:"1000000000000000000000"}
      ]
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.6.9',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: '0.6.8',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
};

export default config;
