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
import type { AppProps } from "next/app"

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    actions.ready()
  }, [])

  return <Component {...pageProps} />
}


const qc = new QueryClient()
const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiClientConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
