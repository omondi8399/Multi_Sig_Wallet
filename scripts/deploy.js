

const hre = require("hardhat");

async function main() {

  const MultiSignatureWallet = await hre.ethers.getContractFactory("MultiSignatureWallet");

  const accounts = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 
                    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
                    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
                    ];

  const required = 3;
  const multiSignatureWallet = await MultiSignatureWallet.deploy(accounts, required);

  await multiSignatureWallet.deployed();

  console.log(
    `Wallet Address: ${multiSignatureWallet.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
