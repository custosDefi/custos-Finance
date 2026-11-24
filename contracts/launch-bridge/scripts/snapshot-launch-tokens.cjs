// Read-only inventory of contracts created by either GIWA launchpad.
// Usage: node scripts/snapshot-launch-tokens.cjs --output snapshot.json [--legacy] [--limit N]
const fs = require('node:fs');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const {utils} = require('ethers');

const run = promisify(execFile);
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}
const legacy = args.includes('--legacy');
const output = option('--output');
const limitText = option('--limit');
if (args.includes('--output') && !output) throw Error('--output requires a path');
if (args.includes('--limit') && (!limitText || !/^[1-9]\d*$/.test(limitText))) throw Error('--limit requires a positive integer');
const limit = limitText ? Number(limitText) : Infinity;
if (limitText && !Number.isSafeInteger(limit)) throw Error('--limit is too large');

const target = legacy ? '0x37BC45c02dbc2f390E7404aFB688FA64e3b17E64' : '0x61Ce8427cFC9947dAe0eBc84E367d6e666f90285';
const multicallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11';
const rpcUrl = process.env.GIWA_RPC_URL || 'https://sepolia-rpc.giwa.io';
const launchpad = new utils.Interface([
  'function launchCount() view returns (uint256)',
  'function getLaunch(uint256) view returns (tuple(address creator,address token,string name,string symbol,string metadataURI,uint256 totalSupply,uint256 tokenReserve,uint256 quoteReserve,uint256 raised,uint64 startAt,uint64 endAt,bool curated,bool finalized))',
]);
const multicall = new utils.Interface([
  'function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) payable returns (tuple(bool success,bytes returnData)[])',
]);

async function rpc(method, params) {
  const payload = {jsonrpc: '2.0', id: 1, method, params};
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const {stdout} = await run('curl', ['-fsS', '-m', '30', '-H', 'Content-Type: application/json', '-d', JSON.stringify(payload), rpcUrl], {maxBuffer: 20e6});
      const response = JSON.parse(stdout);
      if (!response.result) throw Error(JSON.stringify(response.error || response));
      return response.result;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

async function main() {
  const chain = parseInt(await rpc('eth_chainId', []), 16);
  if (chain !== 91342) throw Error('RPC must be GIWA Sepolia (chain 91342)');
  const head = parseInt(await rpc('eth_blockNumber', []), 16);
  const blockNumber = head - 2;
  const block = '0x' + blockNumber.toString(16);
  const countResponse = await rpc('eth_call', [{to: target, data: launchpad.encodeFunctionData('launchCount')}, block]);
  const total = launchpad.decodeFunctionResult('launchCount', countResponse)[0].toNumber();
  const count = Math.min(total, limit);
  const ranges = [];
  for (let start = 1; start <= count; start += 100) ranges.push([start, Math.min(count, start + 99)]);
  const items = [];
  let next = 0;
  async function worker() {
    while (next < ranges.length) {
      const [start, end] = ranges[next++];
      const calls = Array.from({length: end - start + 1}, (_, j) => ({
        target, allowFailure: true, callData: launchpad.encodeFunctionData('getLaunch', [start + j]),
      }));
      const data = multicall.encodeFunctionData('aggregate3', [calls]);
      const response = await rpc('eth_call', [{to: multicallAddress, data}, block]);
      const results = multicall.decodeFunctionResult('aggregate3', response)[0];
      for (let j = 0; j < results.length; j++) {
        if (!results[j].success) throw Error('getLaunch failed: ' + (start + j));
        const launch = launchpad.decodeFunctionResult('getLaunch', results[j].returnData)[0];
        items.push({id: start + j, address: launch.token, supply: launch.totalSupply.toString()});
      }
      if (items.length % 1000 === 0 || items.length === count) console.error(`Indexed ${items.length}/${count}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  await Promise.all([worker(), worker()]);
  items.sort((a, b) => a.id - b.id);
  if (items.length !== count) throw Error('Incomplete launch inventory');
  const groups = {};
  for (const item of items) {
    const group = groups[item.supply] ||= {count: 0, example: item.address};
    group.count++;
  }
  const result = {chainId: chain, launchpad: target, blockNumber, recordedAt: new Date().toISOString(), total, count, groups, items};
  const json = JSON.stringify(result, null, 2) + '\n';
  if (output) fs.writeFileSync(output, json);
  else process.stdout.write(json);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
