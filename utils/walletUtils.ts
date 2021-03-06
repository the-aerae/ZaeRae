const ethers = require("ethers");

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

export const makeKeyList = (num=1,mn=mnemonic,index=0,path="m/44'/60'/0'/0/") => {
  let accounts = [];
  for(let i=0; i<num; i++){
    accounts.push(ethers.Wallet.fromMnemonic(mn,path+i).privateKey);
  }
  return accounts;
}

export const makeSignerList = (num=1,mn=mnemonic,index=0,path="m/44'/60'/0'/0/") => {
  let accounts = [];
  for(let i=0; i<num; i++){
    accounts.push(ethers.Wallet.fromMnemonic(mn,path+i));
  }
  return accounts;
}

export const localWallet = (b,num=1,mn=mnemonic,index=0,path="m/44'/60'/0'/0/") =>{
  let hdW = makeKeyList(num,mn,index,path);
  let lW = [];
  for(let i=0; i<hdW.length; i++){
    lW.push({privateKey:hdW[i],balance:b});
  }
  return lW;
}

export const ganacheWallet = (b,num=1,mn=mnemonic,index=0,path="m/44'/60'/0'/0/") =>{
  let hdW = makeKeyList(num,mn,index,path);
  let lW = [];
  for(let i=0; i<hdW.length; i++){
    lW.push({secretKey:hdW[i],balance:b});
  }
  return lW;
};