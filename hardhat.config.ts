import "dotenv/config";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",

	solidity: {
		version: "0.8.16",
		settings: {
			viaIR: true,
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},

	networks: {
		matic: {
			url:
				"https://polygon-mainnet.g.alchemy.com/v2/" +
				process.env.POLYGON_API,
			accounts: [process.env.PRIVATE_KEY as string],
		},

		goerli: {
			url:
				"https://eth-goerli.g.alchemy.com/v2/" +
				process.env.GOERLI_RPC_URL,
			accounts: [process.env.GOERLI_PRIVATE_KEY as string],
			chainId: 5,
			timeout: 100000,
		},
	},

	etherscan: {
		apiKey: {
			goerli: process.env.ETHERSCAN_API_KEY as string,
		},
	},

	gasReporter: {
		enabled: false,
		currency: "USD",
		outputFile: "gasReport.txt",
		noColors: true,
	},

	namedAccounts: {
		deployer: { default: 0 },
		player: { default: 1 },
	},

	mocha: {
		timeout: 10000000,
	},
};

export default config;
