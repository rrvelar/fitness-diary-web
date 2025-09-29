// lib/wagmi.ts
import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"

// =========================
// 1. Конфиг для клиента (RainbowKit)
// =========================
import { getDefaultWallets } from "@rainbow-me/rainbowkit"

const { connectors } = getDefaultWallets({
  appName: "Fitness Diary",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
})

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
