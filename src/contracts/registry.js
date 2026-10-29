// To support a new contract, add one entry here. No other code changes needed.
module.exports = {
  weth: {
    network: 'sepolia',
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // check it on sepolia.etherscan.io
    abi: [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function deposit() payable',
      'function withdraw(uint256 wad)',
      'event Transfer(address indexed src, address indexed dst, uint256 wad)',
      'event Deposit(address indexed dst, uint256 wad)',
    ],
  },
};