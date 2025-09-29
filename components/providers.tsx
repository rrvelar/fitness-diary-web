import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { base } from 'wagmi/chains'
import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'

const config = getDefaultConfig({
  appName: 'Fitness Diary',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [base],
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()

  // Используем useMemo, чтобы "запомнить" флаг и избежать лишних ре-рендеров
  const isMiniApp = useMemo(() => {
    if (typeof window === 'undefined') return false // на сервере — не миниапп
    return router.pathname.startsWith('/frame')
  }, [router.pathname])

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
