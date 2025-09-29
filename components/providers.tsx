import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { base } from 'wagmi/chains'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

const config = getDefaultConfig({
  appName: 'Fitness Diary',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [base],
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isMiniApp = router.pathname.startsWith('/frame')

  // 🚫 В мини-дапе никаких Wagmi/RainbowKit
  if (isMiniApp) {
    return <>{children}</>
  }

  // 🌍 В обычной версии сайта оставляем всё как было
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
