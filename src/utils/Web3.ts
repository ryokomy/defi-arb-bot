import Web3 from 'web3';

export enum NetworkType {
  main = 1,
  ropsten = 2,
  rinkeby = 4,
}

const getHttpProvider = (network: NetworkType) => {
  switch (network) {
    case NetworkType.main:
      return new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/cf82ea75d3284fdc83ae6a5f09e77927');
    case NetworkType.ropsten:
      return new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/cf82ea75d3284fdc83ae6a5f09e77927');
    case NetworkType.rinkeby:
      return new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/cf82ea75d3284fdc83ae6a5f09e77927');
  }
};

export const getWeb3Instance = (network: NetworkType): Web3 => {
  const httpProvider = getHttpProvider(network);
  return new Web3(httpProvider);
};

export const setPrivateKey = async (web3: Web3) => {
  const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.SECRET_KEY);
  web3.eth.accounts.wallet.add(account); // web3.eth.accounts.wallet[0] == ownerAccount
};
