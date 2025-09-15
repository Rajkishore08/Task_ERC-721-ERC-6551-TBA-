async function main() {
  // Deploy fresh and persist
  await require('./deploy')();
  // Mint NFTs and create TBAs
  await require('./mint-and-create-tba')();
  // Push readings from oracle
  await require('./push-readings')();
  // Read and verify
  await require('./read-verify')();
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
}

module.exports = main;
