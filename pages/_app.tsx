import "@rainbow-me/rainbowkit/styles.css"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { wagmiClientConfig } from "../lib/wagmi"
import "../styles/globals.css"
import type { AppProps } from "next/app"
import Layout from "../components/Layout"
import { useEffect } from "react"

// === 🛠️ Объявляем глобальный объект для TypeScript ===
declare global {
  interface Window {
    farcaster?: {
      actions?: {
        ready: () => void
      }
    }
  }
}

// === 1. Компонент, вызывающий ready() ===
function WarpcastReady() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Если SDK ещё не загружен — добавляем <script>
      if (!window.farcaster) {
        const script = document.createElement("script")
        script.src = "https://www.unpkg.com/@farcaster/mini/dist/sdk.min.js"
        script.async = true
        script.onload = () => {
          if (window.farcaster?.actions?.ready) {
            window.farcaster.actions.ready()
            console.log("✅ Farcaster SDK ready (script loaded)")
          }
        }
        document.body.appendChild(script)
      } else {
        // Если SDK уже есть
        if (window.farcaster?.actions?.ready) {
          window.farcaster.actions.ready()
          console.log("✅ Farcaster SDK ready (already available)")
        }
      }
    }
  }, [])

  return null
}

const queryClient = new QueryClient()

// === 2. Основной App ===
export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiClientConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Layout>
            <WarpcastReady />
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
