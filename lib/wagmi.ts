import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"

// 🌈 RainbowKit
import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"

// =========================
// 1. Конфиг для клиента (RainbowKit)
// =========================
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "Fitness Diary",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  }
)

export const wagmiClientConfig = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(),
  },
})

// =========================
// 2. Конфиг для API (без RainbowKit)
// =========================
export const wagmiServerConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})
