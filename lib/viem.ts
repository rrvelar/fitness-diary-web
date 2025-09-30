// lib/viem.ts
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

export const publicClient = createPublicClient({
  chain: base,
  transport: http(
    `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  ),
})
