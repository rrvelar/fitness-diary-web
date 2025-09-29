import "@rainbow-me/rainbowkit/styles.css"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { wagmiClientConfig } from "../lib/wagmi"
import "../styles/globals.css"
import type { AppProps } from "next/app"
import Layout from "../components/Layout"
import { useEffect } from "react"
import { actions } from "@farcaster/mini"

// === 1. Frame component ===
function FrameComponent() {
  useEffect(() => {
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
  }, [])

  return (
    <main>
      <h1>Fitness Diary Frame</h1>
      <p>Эта страница нужна только для Warpcast (frames).</p>
    </main>
  )
}

// === 2. Wrapper for actions.ready ===
function WarpcastReady({ Component, pageProps }: AppProps) {
  useEffect(() => {
    actions.ready()
  }, [])

  return <Component {...pageProps} />
}

// === 3. Main App (единственный export default) ===
const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiClientConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Layout>
            <WarpcastReady Component={Component} pageProps={pageProps} />
          </Layout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
