import { AbiItem } from 'web3-utils';

export const CONTRACT_ADDRESS = '0x9f61C3a810707FA7bda4D659ddB844AC5547d4F7';
export const ABI: AbiItem[] = [
  {
    inputs: [
      {
        internalType: 'contract ILendingPoolAddressesProvider',
        name: '_addressProvider',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IERC20',
        name: 'orgToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'flashLoanAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'contract IERC20',
        name: 'viaToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'initialOrgTokenAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'initialViaTokenAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'finalOrgTokenAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'finalViaTokenAmount',
        type: 'uint256',
      },
    ],
    name: 'Arbitrage',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ADDRESSES_PROVIDER',
    outputs: [
      {
        internalType: 'contract ILendingPoolAddressesProvider',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LENDING_POOL',
    outputs: [
      {
        internalType: 'contract ILendingPool',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: '_orgToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_flashLoanAmount',
        type: 'uint256',
      },
      {
        internalType: 'contract IERC20',
        name: '_viaToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_forwardSpender',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: '_forwardSwapTarget',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_forwardSwapCallData',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_inverseSpender',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: '_inverseSwapTarget',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_inverseSwapCallData',
        type: 'bytes',
      },
    ],
    name: 'arbitrage',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'assets',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'premiums',
        type: 'uint256[]',
      },
      {
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'params',
        type: 'bytes',
      },
    ],
    name: 'executeOperation',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
];
