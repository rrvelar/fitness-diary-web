import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { base } from "wagmi/chains"

// Если хочешь оставить только Base, убери остальные сети
export const config = getDefaultConfig({
  appName: "Fitness Diary",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo", // WalletConnect Project ID
  chains: [base],
  ssr: true, // важно для Next.js
})
