const solc = require("solc");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "../contracts/AuditAnchor.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: {
    "AuditAnchor.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "paris",
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
if (output.errors) {
  for (const err of output.errors) {
    console.error(err.formattedMessage);
  }
}

const contract = output.contracts["AuditAnchor.sol"]["AuditAnchor"];
console.log("ABI items:", contract.abi.length);
console.log("Bytecode length:", contract.evm.bytecode.object.length);

// Save compiled artifact
fs.mkdirSync(path.join(__dirname, "../artifacts/contracts"), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, "../artifacts/contracts/AuditAnchor.json"),
  JSON.stringify({
    contractName: "AuditAnchor",
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  }, null, 2)
);
console.log("Saved compiled artifact to artifacts/contracts/AuditAnchor.json");
