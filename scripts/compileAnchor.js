const fs = require("fs");
const path = require("path");
const solc = require("solc");

function compile() {
  console.log("Compiling AuditAnchor.sol with evmVersion: 'paris'...");

  const contractPath = path.join(__dirname, "..", "contracts", "AuditAnchor.sol");
  const sourceCode = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "AuditAnchor.sol": {
        content: sourceCode,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris", // Enforce paris to avoid PUSH0 on Arc
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const fatal = output.errors.filter((e) => e.severity === "error");
    if (fatal.length > 0) {
      console.error("Compilation errors:", output.errors);
      process.exit(1);
    }
  }

  const contractOutput = output.contracts["AuditAnchor.sol"]["AuditAnchor"];
  const artifact = {
    contractName: "AuditAnchor",
    abi: contractOutput.abi,
    bytecode: contractOutput.evm.bytecode.object,
    evmVersion: "paris",
    compiledAt: new Date().toISOString(),
  };

  const artifactPath = path.join(__dirname, "..", "contracts", "AuditAnchor.json");
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

  console.log(`Successfully compiled AuditAnchor.sol!`);
  console.log(`Bytecode size: ${artifact.bytecode.length / 2} bytes`);
  console.log(`Saved artifact to: ${artifactPath}`);
}

compile();
