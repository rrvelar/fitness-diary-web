import "@rainbow-me/rainbowkit/styles.css"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { wagmiClientConfig } from "../lib/wagmi"
import "../styles/globals.css"
import type { AppProps } from "next/app"
import Layout from "../components/Layout"
import { useEffect } from "react"

// === 1. Frame component ===
function WarpcastReady() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "https://www.unpkg.com/@farcaster/mini/dist/sdk.min.js"
      script.async = true
      script.onload = () => {
        // @ts-ignore
        if (window.farcaster) {
          // @ts-ignore
          window.farcaster.actions.ready()
        }
      }
      document.body.appendChild(script)
    }
  }, [])

  return null
}

const queryClient = new QueryClient()

// === 2. Main App ===
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
