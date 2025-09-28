import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { createConfig, http } from "wagmi"
import { mainnet, base, polygon, arbitrum, optimism } from "wagmi/chains"

// ⚡️ можно указать только base, если он один нужен
export const config = createConfig(
  getDefaultConfig({
    appName: "Fitness Diary",
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo", // WalletConnect Project ID
    chains: [base, mainnet, polygon, arbitrum, optimism],
    transports: {
      [base.id]: http(),
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [arbitrum.id]: http(),
      [optimism.id]: http(),
    },
    ssr: true, // важно для Next.js
  })
)
