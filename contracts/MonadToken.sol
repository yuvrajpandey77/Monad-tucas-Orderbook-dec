// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MonadToken
 * @dev A simple ERC-20 token for Monad testnet
 */
contract MonadToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant MINT_AMOUNT = 1000 * 10**18; // 1000 tokens per mint
    
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("MonadToken", "MONAD") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Mint tokens to caller (public mint)
     */
    function publicMint() public {
        require(totalSupply() + MINT_AMOUNT <= INITIAL_SUPPLY * 2, "Max supply reached");
        
        _mint(msg.sender, MINT_AMOUNT);
        emit TokensMinted(msg.sender, MINT_AMOUNT);
    }
    
    /**
     * @dev Burn tokens
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Get token info
     * @return name Token name
     * @return symbol Token symbol
     * @return totalSupply Total supply
     * @return decimals Token decimals
     */
    function getTokenInfo() public view returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals
    ) {
        return (name(), symbol(), totalSupply(), decimals());
    }
    
    /**
     * @dev Get account balance
     * @param account Address to check balance for
     * @return balance Account balance
     */
    function getBalance(address account) public view returns (uint256 balance) {
        return balanceOf(account);
    }
} 