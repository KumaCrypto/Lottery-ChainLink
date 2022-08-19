import "dotenv/config";
import "hardhat-gas-reporter";
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
	},

	gasReporter: {
		enabled: false,
		currency: "USD",
		outputFile: "gasReport.txt",
		noColors: true,
	},
};

export default config;
