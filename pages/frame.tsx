// pages/frame.tsx
import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { encodeFunctionData } from "viem"
import abi from "../abi/FitnessDiary.json"

declare global {
  interface Window {
    farcaster?: {
      actions?: { ready: () => void }
      wallet?: {
        getAccounts?: () => Promise<string[]>
        sendTransaction?: (tx: {
          to: `0x${string}`
          data?: `0x${string}`
          value?: `0x${string}`
        }) => Promise<`0x${string}`>
        signTypedData?: (typedData: unknown) => Promise<`0x${string}`>
      }
    }
  }
}

export default function Frame() {
  const router = useRouter()
  const [status, setStatus] = useState<string>("")
  const sentRef = useRef(false)

  // 1) SDK
  useEffect(() => {
    if (typeof window === "undefined") return
    const callReady = () => {
      window.farcaster?.actions?.ready?.()
      console.log("✅ Farcaster SDK ready")
    }
    if (!window.farcaster) {
      const s = document.createElement("script")
      s.src = "https://warpcast.com/sdk/v2"
      s.async = true
      s.onload = callReady
      document.body.appendChild(s)
    } else {
      callReady()
    }
  }, [])

  // 2) Tx
  useEffect(() => {
    if (!router.isReady) return
    if (sentRef.current) return

    const { date, weight, calIn, calOut, steps } = router.query
    const haveAll =
      typeof date !== "undefined" &&
      typeof weight !== "undefined" &&
      typeof calIn !== "undefined" &&
      typeof calOut !== "undefined" &&
      typeof steps !== "undefined"

    if (!haveAll) return

    const wallet = window.farcaster?.wallet
    if (!wallet?.sendTransaction) {
      setStatus("⚠️ Встроенный кошелёк Warpcast недоступен")
      return
    }

    sentRef.current = true
    ;(async () => {
      try {
        setStatus("⏳ Подписание транзакции...")

        const ymd = Number(date as string)
        const w = Math.round(Number(weight as string) * 1000)
        const ci = Number(calIn as string)
        const co = Number(calOut as string)
        const st = Number(steps as string)

        const data = encodeFunctionData({
          abi: abi as any,
          functionName: "logEntry",
          args: [ymd, w, ci, co, st],
        })

        const txHash = await wallet.sendTransaction({
          to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
          data,
          value: "0x0",
        })

        setStatus(`✅ Успешно! tx: ${txHash}`)
      } catch (e: any) {
        sentRef.current = false
        setStatus(`❌ Ошибка: ${e?.message || String(e)}`)
      }
    })()
  }, [router.isReady, router.query])

  return (
    <>
      <Head>
        <title>Fitness Diary Frame</title>
        <meta property="og:title" content="Fitness Diary Frame" />
        <meta property="og:description" content="Добавь запись прямо из Warpcast" />
        <meta property="og:image" content="https://fitness-diary-web.vercel.app/preview.png" />

        <meta
          name="fc:frame"
          content='{
            "version": "next",
            "imageUrl": "https://fitness-diary-web.vercel.app/preview.png",
            "buttons": [
              {
                "title": "📖 Мои записи",
                "action": { "type": "post", "target": "https://fitness-diary-web.vercel.app/api/frame-action?action=entries" }
              },
              {
                "title": "➕ Добавить",
                "action": { "type": "post", "target": "https://fitness-diary-web.vercel.app/api/frame-action?action=log" }
              }
            ]
          }'
        />
      </Head>

      <main style={{ padding: 16 }}>
        <h1>Fitness Diary — Mini</h1>
        <p>{status || "Готово"}</p>
      </main>
    </>
  )
}
