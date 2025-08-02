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
    /// Add a new trading pair (owner only)
    AddTradingPair {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// Base token address
        #[arg(short, long)]
        base_token: String,
        
        /// Quote token address
        #[arg(short, long)]
        quote_token: String,
        
        /// Minimum order size
        #[arg(short, long)]
        min_order_size: u64,
        
        /// Price precision
        #[arg(short, long)]
        price_precision: u64,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Place a limit order
    PlaceLimitOrder {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// Base token address
        #[arg(short, long)]
        base_token: String,
        
        /// Quote token address
        #[arg(short, long)]
        quote_token: String,
        
        /// Order amount
        #[arg(short, long)]
        amount: u64,
        
        /// Order price
        #[arg(short, long)]
        price: u64,
        
        /// Is buy order
        #[arg(short, long)]
        is_buy: bool,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Place a market order
    PlaceMarketOrder {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// Base token address
        #[arg(short, long)]
        base_token: String,
        
        /// Quote token address
        #[arg(short, long)]
        quote_token: String,
        
        /// Order amount
        #[arg(short, long)]
        amount: u64,
        
        /// Is buy order
        #[arg(short, long)]
        is_buy: bool,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Cancel an order
    CancelOrder {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// Order ID
        #[arg(short, long)]
        order_id: u64,
        
        /// Private key
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Get order book for a trading pair
    GetOrderBook {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// Base token address
        #[arg(short, long)]
        base_token: String,
        
        /// Quote token address
        #[arg(short, long)]
        quote_token: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Get user's active orders
    GetUserOrders {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// User address
        #[arg(short, long)]
        user: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Get user balance
    GetBalance {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// User address
        #[arg(short, long)]
        user: String,
        
        /// Token address
        #[arg(short, long)]
        token: String,
        
        /// RPC URL
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
    },
    
    /// Withdraw tokens from DEX
    Withdraw {
        /// DEX contract address
        #[arg(short, long)]
        address: String,
        
        /// Token address
        #[arg(short, long)]
        token: String,
        
        /// Amount to withdraw
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
        Commands::AddTradingPair { address, base_token, quote_token, min_order_size, price_precision, private_key, rpc_url } => {
            add_trading_pair(address, base_token, quote_token, min_order_size, price_precision, private_key, rpc_url).await?;
        }
        Commands::PlaceLimitOrder { address, base_token, quote_token, amount, price, is_buy, private_key, rpc_url } => {
            place_limit_order(address, base_token, quote_token, amount, price, is_buy, private_key, rpc_url).await?;
        }
        Commands::PlaceMarketOrder { address, base_token, quote_token, amount, is_buy, private_key, rpc_url } => {
            place_market_order(address, base_token, quote_token, amount, is_buy, private_key, rpc_url).await?;
        }
        Commands::CancelOrder { address, order_id, private_key, rpc_url } => {
            cancel_order(address, order_id, private_key, rpc_url).await?;
        }
        Commands::GetOrderBook { address, base_token, quote_token, rpc_url } => {
            get_order_book(address, base_token, quote_token, rpc_url).await?;
        }
        Commands::GetUserOrders { address, user, rpc_url } => {
            get_user_orders(address, user, rpc_url).await?;
        }
        Commands::GetBalance { address, user, token, rpc_url } => {
            get_balance(address, user, token, rpc_url).await?;
        }
        Commands::Withdraw { address, token, amount, private_key, rpc_url } => {
            withdraw(address, token, amount, private_key, rpc_url).await?;
        }
    }
    
    Ok(())
}

async fn add_trading_pair(
    contract_address: String,
    base_token: String,
    quote_token: String,
    min_order_size: u64,
    price_precision: u64,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Adding trading pair: {} / {}", base_token, quote_token);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    let base_token = base_token.parse::<Address>()?;
    let quote_token = quote_token.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call addTradingPair function
    let tx = contract
        .method("addTradingPair", (base_token, quote_token, U256::from(min_order_size), U256::from(price_precision)))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Trading pair added successfully!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

async fn place_limit_order(
    contract_address: String,
    base_token: String,
    quote_token: String,
    amount: u64,
    price: u64,
    is_buy: bool,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Placing limit order: {} {} at price {}", if is_buy { "BUY" } else { "SELL" }, amount, price);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    let base_token = base_token.parse::<Address>()?;
    let quote_token = quote_token.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call placeLimitOrder function
    let tx = contract
        .method("placeLimitOrder", (base_token, quote_token, U256::from(amount), U256::from(price), is_buy))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Limit order placed successfully!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

async fn place_market_order(
    contract_address: String,
    base_token: String,
    quote_token: String,
    amount: u64,
    is_buy: bool,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Placing market order: {} {}", if is_buy { "BUY" } else { "SELL" }, amount);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    let base_token = base_token.parse::<Address>()?;
    let quote_token = quote_token.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call placeMarketOrder function
    let tx = contract
        .method("placeMarketOrder", (base_token, quote_token, U256::from(amount), is_buy))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Market order placed successfully!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

async fn cancel_order(
    contract_address: String,
    order_id: u64,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Cancelling order: {}", order_id);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call cancelOrder function
    let tx = contract
        .method("cancelOrder", U256::from(order_id))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Order cancelled successfully!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

async fn get_order_book(
    contract_address: String,
    base_token: String,
    quote_token: String,
    rpc_url: String
) -> Result<()> {
    info!("Getting order book for {} / {}", base_token, quote_token);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let contract_address = contract_address.parse::<Address>()?;
    let base_token = base_token.parse::<Address>()?;
    let quote_token = quote_token.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, provider);
    
    // Call getOrderBook function
    let result: (Vec<U256>, Vec<U256>, Vec<U256>, Vec<U256>) = contract
        .method("getOrderBook", (base_token, quote_token))?
        .call()
        .await?;
    
    println!("Order Book for {} / {}", base_token, quote_token);
    println!("==========================================");
    
    println!("Buy Orders:");
    for (i, (price, amount)) in result.0.iter().zip(result.1.iter()).enumerate() {
        println!("  {}: Price: {}, Amount: {}", i + 1, price, amount);
    }
    
    println!("\nSell Orders:");
    for (i, (price, amount)) in result.2.iter().zip(result.3.iter()).enumerate() {
        println!("  {}: Price: {}, Amount: {}", i + 1, price, amount);
    }
    
    Ok(())
}

async fn get_user_orders(
    contract_address: String,
    user_address: String,
    rpc_url: String
) -> Result<()> {
    info!("Getting orders for user: {}", user_address);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let contract_address = contract_address.parse::<Address>()?;
    let user_address = user_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, provider);
    
    // Call getUserOrders function
    let order_ids: Vec<U256> = contract
        .method("getUserOrders", user_address)?
        .call()
        .await?;
    
    println!("Active Orders for {}", user_address);
    println!("================================");
    
    if order_ids.is_empty() {
        println!("No active orders found.");
    } else {
        for (i, order_id) in order_ids.iter().enumerate() {
            println!("Order {}: ID {}", i + 1, order_id);
        }
    }
    
    Ok(())
}

async fn get_balance(
    contract_address: String,
    user_address: String,
    token_address: String,
    rpc_url: String
) -> Result<()> {
    info!("Getting balance for user: {} token: {}", user_address, token_address);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let contract_address = contract_address.parse::<Address>()?;
    let user_address = user_address.parse::<Address>()?;
    let token_address = token_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, provider);
    
    // Call getUserBalance function
    let balance: U256 = contract
        .method("getUserBalance", (user_address, token_address))?
        .call()
        .await?;
    
    println!("Balance: {} tokens", balance);
    
    Ok(())
}

async fn withdraw(
    contract_address: String,
    token_address: String,
    amount: u64,
    private_key: String,
    rpc_url: String
) -> Result<()> {
    info!("Withdrawing {} tokens", amount);
    
    let provider = Provider::<Http>::try_from(rpc_url)?;
    let wallet = private_key.parse::<LocalWallet>()?;
    let client = SignerMiddleware::new(provider, wallet);
    
    let contract_address = contract_address.parse::<Address>()?;
    let token_address = token_address.parse::<Address>()?;
    
    // Load contract ABI
    let contract_abi = load_dex_abi()?;
    
    // Create contract instance
    let contract = Contract::new(contract_address, contract_abi, client);
    
    // Call withdraw function
    let tx = contract
        .method("withdraw", (token_address, U256::from(amount)))?
        .legacy()
        .send()
        .await?;
    
    let receipt = tx.await?;
    info!("Withdrawal successful!");
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    
    Ok(())
}

fn load_dex_abi() -> Result<Abi> {
    // In a real implementation, you would load the compiled ABI
    // For now, we'll return a placeholder
    info!("Loading DEX contract ABI...");
    
    // This should be replaced with actual ABI loading
    // For now, we'll use a minimal ABI
    let abi_json = r#"[]"#;
    let abi: Abi = serde_json::from_str(abi_json)?;
    Ok(abi)
} 