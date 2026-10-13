const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  console.log(`Deploying AuditAnchor to network: ${networkName}...`);

  const AuditAnchor = await hre.ethers.getContractFactory("AuditAnchor");
  const anchorContract = await AuditAnchor.deploy();
  await anchorContract.waitForDeployment();

  const deployedAddress = await anchorContract.getAddress();
  console.log(`AuditAnchor deployed successfully at: ${deployedAddress}`);

  // Write deployment artifact
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    contract: "AuditAnchor",
    address: deployedAddress,
    network: networkName,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
  };

  const filePath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));
  console.log(`Saved deployment info to ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
