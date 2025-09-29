// pages/_app.tsx
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiClientConfig } from "../lib/wagmi";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
// ⚠️ проверь путь: если у тебя Layout в components/ui/Layout.tsx — измени импорт
import Layout from "../components/ui/Layout";

declare global {
  interface Window {
    farcaster?: {
      actions?: { ready: () => void };
      wallet?: {
        getAccounts: () => Promise<string[]>;
        sendTransaction: (tx: {
          to: `0x${string}`;
          data?: `0x${string}`;
          value?: `0x${string}`;
        }) => Promise<`0x${string}`>;
        signTypedData: (typedData: unknown) => Promise<`0x${string}`>;
      };
    };
  }
}

function WarpcastReady() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const callReady = () => {
      try {
        window.farcaster?.actions?.ready?.();
        console.log("✅ Farcaster SDK ready");
      } catch {}
    };

    if (!window.farcaster) {
      const s = document.createElement("script");
      s.src = "https://warpcast.com/sdk/v2";
      s.async = true;
      s.onload = callReady;
      document.body.appendChild(s);
    } else {
      callReady();
    }
  }, []);
  return null;
}

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isMiniApp = router.pathname.startsWith("/frame"); // все страницы мини-аппа начинаются с /frame

  if (isMiniApp) {
    // 🚫 НИКАКОГО WalletConnect/RainbowKit внутри Warpcast
    return (
      <>
        <WarpcastReady />
        <Component {...pageProps} />
      </>
    );
  }

  // 🌍 Полноценная веб-версия — как было
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
  );
}
