use clap::{Parser, Subcommand};
use ethers::{
    core::k256::ecdsa::SigningKey,
    middleware::SignerMiddleware,
    providers::{Http, Provider},
    signers::{LocalWallet, Signer},
    types::{Address, U256},
    contract::{Contract, ContractFactory},
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
    /// Deploy MonadToken contract to testnet
    Deploy {
        /// Private key for deployment
        #[arg(short, long)]
        private_key: String,
        
        /// RPC URL (defaults to Monad testnet)
        #[arg(short, long, default_value = "https://rpc.testnet.monad.xyz")]
        rpc_url: String,
        
        /// Gas price in wei
        #[arg(short, long, default_value = "20000000000")] // 20 gwei
        gas_price: u64,
    },
    
    /// Verify contract on Monad testnet
    Verify {
        /// Contract address
        #[arg(short, long)]
        address: String,
        
        /// Constructor arguments
        #[arg(short, long)]
        constructor_args: Option<String>,
    },
    
    /// Get deployment configuration
    Config,
}

#[derive(Debug, Serialize, Deserialize)]
struct DeploymentConfig {
    contract_address: Option<String>,
    deployer_address: Option<String>,
    network: String,
    deployment_tx: Option<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    let cli = Cli::parse();
    
    match cli.command {
        Commands::Deploy { private_key, rpc_url, gas_price } => {
            deploy_contract(private_key, rpc_url, gas_price).await?;
        }
        Commands::Verify { address, constructor_args } => {
            verify_contract(address, constructor_args).await?;
        }
        Commands::Config => {
            show_config().await?;
        }
    }
    
    Ok(())
}

async fn deploy_contract(private_key: String, rpc_url: String, gas_price: u64) -> Result<()> {
    info!("Starting contract deployment to Monad testnet...");
    
    // Setup provider and wallet
    let provider = Provider::<Http>::try_from(rpc_url.clone())
        .context("Failed to create provider")?;
    
    let wallet = private_key.parse::<LocalWallet>()
        .context("Failed to parse private key")?;
    
    let client = SignerMiddleware::new(provider, wallet);
    let address = client.address();
    
    info!("Deployer address: {:?}", address);
    
    // Check balance
    let balance = client.get_balance(address, None).await?;
    info!("Account balance: {} wei", balance);
    
    if balance == U256::zero() {
        error!("Insufficient balance for deployment");
        return Err(anyhow::anyhow!("Account has no balance"));
    }
    
    // Load contract bytecode and ABI
    let contract_bytecode = load_contract_bytecode()?;
    let contract_abi = load_contract_abi()?;
    
    // Create contract factory
    let factory = ContractFactory::new(contract_abi, contract_bytecode, client);
    
    // Deploy contract
    info!("Deploying MonadToken contract...");
    let deploy_tx = factory.deploy(())?.legacy();
    let deploy_tx = deploy_tx.gas_price(gas_price);
    
    let pending_tx = deploy_tx.send().await?;
    info!("Deployment transaction sent: {:?}", pending_tx.tx_hash());
    
    // Wait for deployment
    let receipt = pending_tx.await?;
    let contract_address = receipt.contract_address
        .context("No contract address in receipt")?;
    
    info!("Contract deployed successfully!");
    info!("Contract address: {:?}", contract_address);
    info!("Transaction hash: {:?}", receipt.transaction_hash);
    info!("Gas used: {:?}", receipt.gas_used);
    
    // Save deployment info
    let config = DeploymentConfig {
        contract_address: Some(format!("{:?}", contract_address)),
        deployer_address: Some(format!("{:?}", address)),
        network: "monad_testnet".to_string(),
        deployment_tx: Some(format!("{:?}", receipt.transaction_hash)),
    };
    
    save_deployment_config(config)?;
    
    info!("Deployment configuration saved to config/deployment.json");
    
    Ok(())
}

async fn verify_contract(address: String, constructor_args: Option<String>) -> Result<()> {
    info!("Verifying contract at address: {}", address);
    
    // This would typically use a block explorer API
    // For now, we'll just log the verification attempt
    warn!("Contract verification not implemented yet");
    warn!("Please verify manually on Monad block explorer");
    warn!("Contract address: {}", address);
    
    if let Some(args) = constructor_args {
        info!("Constructor arguments: {}", args);
    }
    
    Ok(())
}

async fn show_config() -> Result<()> {
    let config_path = Path::new("config/deployment.json");
    
    if config_path.exists() {
        let config_content = fs::read_to_string(config_path)?;
        let config: DeploymentConfig = serde_json::from_str(&config_content)?;
        
        println!("Deployment Configuration:");
        println!("Network: {}", config.network);
        println!("Contract Address: {}", config.contract_address.unwrap_or_else(|| "Not deployed".to_string()));
        println!("Deployer Address: {}", config.deployer_address.unwrap_or_else(|| "Unknown".to_string()));
        println!("Deployment TX: {}", config.deployment_tx.unwrap_or_else(|| "Unknown".to_string()));
    } else {
        println!("No deployment configuration found");
    }
    
    Ok(())
}

fn load_contract_bytecode() -> Result<Vec<u8>> {
    // In a real implementation, you would load the compiled bytecode
    // For now, we'll return a placeholder
    info!("Loading contract bytecode...");
    
    // This should be replaced with actual bytecode loading
    // For now, we'll use a placeholder
    Ok(vec![0x60, 0x80, 0x60, 0x40, 0x52]) // Minimal bytecode
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

fn save_deployment_config(config: DeploymentConfig) -> Result<()> {
    let config_dir = Path::new("config");
    if !config_dir.exists() {
        fs::create_dir_all(config_dir)?;
    }
    
    let config_path = config_dir.join("deployment.json");
    let config_json = serde_json::to_string_pretty(&config)?;
    fs::write(config_path, config_json)?;
    
    Ok(())
} 