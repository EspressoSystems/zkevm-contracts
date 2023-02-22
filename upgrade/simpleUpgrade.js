/* eslint-disable no-console, no-unused-vars */
const hre = require('hardhat');
const { ethers, upgrades } = require('hardhat');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const upgradeParameters = require('./upgrade_parameters.json');

async function main() {
    // Set multiplier Gas
    let currentProvider = ethers.provider;
    if (upgradeParameters.multiplierGas) {
        if (process.env.HARDHAT_NETWORK !== 'hardhat') {
            const multiplierGas = upgradeParameters.multiplierGas;
            currentProvider = new ethers.providers.JsonRpcProvider(`https://${process.env.HARDHAT_NETWORK}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
            async function overrideFeeData() {
                const feedata = await ethers.provider.getFeeData();
                return {
                    maxFeePerGas: feedata.maxFeePerGas.mul(multiplierGas),
                    maxPriorityFeePerGas: feedata.maxPriorityFeePerGas.mul(multiplierGas),
                };
            }
            currentProvider.getFeeData = overrideFeeData;
        }
    }
    let deployer;
    if (upgradeParameters.deployerPvtKey) {
        deployer = new ethers.Wallet(upgradeParameters.deployerPvtKey, currentProvider);
    } else if (process.env.MNEMONIC) {
        deployer = ethers.Wallet.fromMnemonic(process.env.MNEMONIC, 'm/44\'/60\'/0\'/0/0').connect(currentProvider);
    } else {
        [deployer] = (await ethers.getSigners());
    }

    // compìle contracts
    await hre.run('compile');

    for (const upgrade of upgradeParameters.upgrades) {
        const proxyPolygonAddress = upgrade.address;
        const polygonZkEVMFactory = await ethers.getContractFactory(upgrade.contractName, deployer);

        const txZKEVM = await upgrades.upgradeProxy(proxyPolygonAddress, polygonZkEVMFactory);

        console.log(txZKEVM.deployTransaction);
        console.log(await txZKEVM.deployTransaction.wait());
        console.log('upgrade succesfull', upgrade.contractName);
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
