use clap::{Parser, Subcommand};
use ethers::{
    core::k256::ecdsa::SigningKey,
    middleware::SignerMiddleware,
    providers::{Http, Provider},
    signers::{LocalWallet, Signer},
    types::{Address, U256},
    contract::{Contract, ContractInstance},
    abi::Abi,
};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use anyhow::{Result, Context};
use tracing::{info, error, warn};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Get token information
    Info {
        /// Contract address
        #[arg(short, long)]
        address: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Get account balance
    Balance {
        /// Contract address
        #[arg(short, long)]
        address: String,
        
        /// Account address
        #[arg(short, long)]
        account: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Mint tokens (owner only)
    Mint {
        /// Contract address
        #[arg(short, long)]
        address: String,
        
        /// Recipient address
        #[arg(short, long)]
        to: String,
        
        /// Amount to mint
        #[arg(short, long)]
        amount: u64,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Public mint tokens
    PublicMint {
        /// Contract address
        #[arg(short, long)]
        address: String,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Burn tokens
    Burn {
        /// Contract address
        #[arg(short, long)]
        address: String,
        
        /// Amount to burn
        #[arg(short, long)]
        amount: u64,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Transfer tokens
    Transfer {
        /// Contract address
        #[arg(short, long)]
        address: String,
        
        /// Recipient address
        #[arg(short, long)]
        to: String,
        
        /// Amount to transfer
        #[arg(short, long)]
        amount: u64,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    let cli = Cli::parse();
    
    match cli.command {
        Commands::Info { address, rpc_url } => {
            get_token_info(address, rpc_url).await?;
        }
        Commands::Balance { address, account, rpc_url } => {
            get_balance(address, account, rpc_url).await?;
        }
        Commands::Mint { address, to, amount, private_key, rpc_url } => {
            mint_tokens(address, to, amount, private_key, rpc_url).await?;
        }
        Commands::PublicMint { address, private_key, rpc_url } => {
            public_mint(address, private_key, rpc_url).await?;
        }
        Commands::Burn { address, amount, private_key, rpc_url } => {
            burn_tokens(address, amount, private_key, rpc_url).await?;
        }
        Commands::Transfer { address, to, amount, private_key, rpc_url } => {
            transfer_tokens(address, to, amount, private_key, rpc_url).await?;
        }
    }
    
    Ok(())
}

async fn get_token_info(contract_address: String, rpc_url: String) -> Result<()> {
    info!("Getting token information for contract: {}", contract_address);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let contract_address = contract_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_contract_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, provider);
    
    // Call getTokenInfo function
    let result: (String, String, U256, u8) = contract
        .method("getTokenInfo", ())?
        .call()
        .await?;
    
    println!("Token Information:");
    println!("Name: {}", result.0);
    println!("Symbol: {}", result.1);
    println!("Total Supply: {}", result.2);
    println!("Decimals: {}", result.3);
    
    Ok(())
}

async fn get_balance(contract_address: String, account_address: String, rpc_url: String) -> Result<()> {
    info!("Getting balance for account: {} on contract: {}", account_address, contract_address);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let contract_address = contract_address.parse::<Address>()?;
    let account_address = account_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_contract_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, provider);
    
    // Call getBalance function
    let balance: U256 = contract
        .method("getBalance", account_address)?
        .call()
        .await?;
    
    println!("Account Balance: {} tokens", balance);
    
    Ok(())
}

async fn mint_tokens(
    contract_address: String,
    to_address: String,
    amount: u64,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Minting {} tokens to {}", amount, to_address);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    let to_address = to_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_contract_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call mint function
    let tx = contract
        .method("mint", (to_address, U256::from(amount)))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Mint transaction successful!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

async fn public_mint(contract_address: String, private_key: String, rpc_url: String) -> Result<()> {
    info!("Performing public mint on contract: {}", contract_address);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_contract_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call publicMint function
    let tx = contract
        .method("publicMint", ())?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Public mint transaction successful!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

async fn burn_tokens(
    contract_address: String,
    amount: u64,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Burning {} tokens", amount);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_contract_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call burn function
    let tx = contract
        .method("burn", U256::from(amount))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Burn transaction successful!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

async fn transfer_tokens(
    contract_address: String,
    to_address: String,
    amount: u64,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Transferring {} tokens to {}", amount, to_address);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    let to_address = to_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_contract_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call transfer function
    let tx = contract
        .method("transfer", (to_address, U256::from(amount)))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Transfer transaction successful!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

fn load_contract_abi() -> Result<Abi> {
    // In a real implementation, you would load the compiled ABI
    // For now, we'll return a placeholder
    info!("Loading contract ABI...");
    
    // This should be replaced with actual ABI loading
    // For now, we'll use a minimal ABI
    let abi_json = r#"[]"#;
    let abi: Abi = serde_json::from_str(abi_json)?;
    Ok(abi)
} 