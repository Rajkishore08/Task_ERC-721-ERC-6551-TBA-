# IoTeX ERC-721 + Token-Bound Account (TBA) Demo

End-to-end demo on IoTeX:
- Mint an ERC-721 NFT per crop batch.
- Create a Token-Bound Account (TBA) clone per NFT via a registry using OpenZeppelin Clones.
- Push two daily IoT readings (moisture, temperature) from a trusted oracle into each TBA.
- Read and verify stored readings.

## Setup

1) Install dependencies

```powershell
npm install
```

2) Configure an account

- Copy `.env.example` to `.env` and set `IOTEX_PRIVATE_KEY` to the admin/deployer account.
- For local testing, Hardhat will provide accounts automatically.

## Build and Test

```powershell
npm run build
npm run test
```

## Local Demo (Hardhat Network)

```powershell
# One-shot full flow (recommended for first run)
npm run demo

# Or run step-by-step:
# 1) Deploy contracts (CropNFT, TBA implementation, Registry)
npm run deploy
# 2) Mint NFTs to two users and create TBAs (must run before read-verify)
npm run mint-and-create-tba
# 3) Push daily readings via oracle (must run before read-verify)
npm run push-readings
# 4) Read and verify (requires TBAs exist and readings pushed)
npm run read-verify
```

Note: The scripts in this demo redeploy on each run for simplicity. In production, persist deployed addresses and reuse.

## IoTeX Networks

In `hardhat.config.js`:
- `iotex` (mainnet): `https://babel-api.mainnet.iotex.io`, chainId `4689`
- `iotex_testnet`: `https://babel-api.testnet.iotex.io`, chainId `4690`

Deploy to testnet:

```powershell
npx hardhat run scripts/deploy.js --network iotex_testnet
```

Then update the other scripts with the deployed addresses or adapt them to read from a saved JSON.

## Contracts

- `CropNFT.sol`: ERC-721 with owner/minter role. Admin mints one NFT per crop batch.
- `TokenBoundAccount.sol`: cloneable account bound to NFT. Stores static intake metadata (IPFS CID) and daily readings (2/day) from a trusted oracle.
- `TBARegistry.sol`: clones `TokenBoundAccount` deterministically per `(nft, tokenId)` and can predict the address.

## Data Model

- Static intake & warehouse metadata stored off-chain on IPFS (CID saved in TBA at initialization).
- Daily readings stored on-chain in TBA as two entries per day keyed by `yyyymmdd` (UTC).

## Roles

- Admin (deployer) can add additional minters to `CropNFT`.
- Oracle is a trusted IoT gateway address authorized to push readings into each TBA.

## Sample Metadata

`data/sample-metadata.json` shows the type of data to store on IPFS and reference in the TBA.

## Next Steps

- Persist deployed addresses to a JSON file; parameterize scripts to avoid re-deploying.
- Add signature-based oracle ingestion and on-chain verification of signed payloads.
- Add a UI to browse NFTs and TBA readings.