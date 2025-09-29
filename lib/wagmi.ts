import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { getDefaultWallets } from "@rainbow-me/rainbowkit"

const { connectors } = getDefaultWallets({
  appName: "Fitness Diary",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
})

export const config = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL!), // ✅ теперь Alchemy
  },
})
