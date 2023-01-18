#!/usr/bin/env bash
set -e
set -x
sudo rm -rf docker/gethData/geth_data
DEV_PERIOD=1 docker-compose -f docker/docker-compose.geth.yml up -d geth
sleep 5
node docker/scripts/fund-accounts.js
cp docker/scripts/deploy_parameters_docker.json deployment/deploy_parameters.json
cp docker/scripts/genesis_docker.json deployment/genesis.json
npx hardhat run deployment/deployContracts.js --network localhost
mkdir docker/deploymentOutput
mv deployment/deploy_output.json docker/deploymentOutput
docker-compose -f docker/docker-compose.geth.yml down
sudo docker build -t hermeznetwork/geth-zkevm-contracts -f docker/Dockerfile.geth .
# Let it readable for the multiplatform build coming later!
sudo chmod -R go+rxw docker/gethData
