// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/MonadToken.sol";
import "../contracts/OrderBookDEX.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MonadToken
        MonadToken token = new MonadToken();
        console.log("MonadToken deployed at:", address(token));
        
        // Deploy OrderBookDEX
        OrderBookDEX dex = new OrderBookDEX();
        console.log("OrderBookDEX deployed at:", address(dex));
        
        vm.stopBroadcast();
        
        // Save deployment addresses
        string memory deploymentInfo = string(abi.encodePacked(
            "MonadToken: ", vm.toString(address(token)), "\n",
            "OrderBookDEX: ", vm.toString(address(dex)), "\n"
        ));
        
        vm.writeFile("deployment.txt", deploymentInfo);
        console.log("Deployment addresses saved to deployment.txt");
    }
} 