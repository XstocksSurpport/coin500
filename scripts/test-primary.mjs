const SEARCH = ["pump", "meme solana"];

async function main() {
  const pairs = [];
  for (const q of SEARCH) {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json", "User-Agent": "Coin500/1.0" } },
    );
    console.log(q, res.status);
    const json = await res.json();
    const sol = (json.pairs ?? []).filter((p) => p.chainId === "solana");
    pairs.push(...sol);
  }
  console.log("total solana pairs", pairs.length);
  console.log("sample", pairs[0]?.baseToken?.symbol, pairs[0]?.priceUsd);
}

main().catch(console.error);
