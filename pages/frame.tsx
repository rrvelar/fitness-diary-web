import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { encodeFunctionData } from "viem"
import { sdk } from "@farcaster/miniapp-sdk"
import abi from "../abi/FitnessDiary.json"

export default function Frame() {
  const router = useRouter()
  const [status, setStatus] = useState<string>("")
  const sentRef = useRef(false)

  // 1) Сообщаем Warpcast, что мини-апп готов
  useEffect(() => {
    ;(async () => {
      try {
        await sdk.actions.ready()
        console.log("✅ sdk.actions.ready() called")
      } catch (e) {
        console.warn("⚠️ sdk.actions.ready() failed", e)
      }
    })()
  }, [])

  // 2) Если есть query-параметры → шлём транзакцию
  useEffect(() => {
    if (!router.isReady) return
    if (sentRef.current) return

    const { date, weight, calIn, calOut, steps } = router.query
    const haveAll =
      date !== undefined &&
      weight !== undefined &&
      calIn !== undefined &&
      calOut !== undefined &&
      steps !== undefined

    if (!haveAll) return

    const provider = sdk.wallet.ethProvider
    if (!provider?.request) {
      setStatus("⚠️ Встроенный кошелёк Warpcast недоступен")
      return
    }

    sentRef.current = true
    ;(async () => {
      try {
        setStatus("⏳ Подписание транзакции во встроенном кошельке...")

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

        const [from] = await provider.request({ method: "eth_accounts" })
        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from,
              to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
              data,
              value: "0x0",
            },
          ],
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

        {/* OG */}
        <meta property="og:url" content="https://fitness-diary-web.vercel.app/frame" />
        <meta property="og:title" content="Fitness Diary Health Onchain" />
        <meta
          property="og:description"
          content="Log your weight, calories, and steps directly in Warpcast and see your progress on Base."
        />
        <meta property="og:image" content="https://fitness-diary-web.vercel.app/og.png" />

        {/* ✅ Единственный корректный fc:frame */}
        <meta
          name="fc:frame"
          content='{"version":"next","imageUrl":"https://fitness-diary-web.vercel.app/preview2.png","buttons":[{"title":"📖 Мои записи","action":{"type":"post","target":"https://fitness-diary-web.vercel.app/api/frame-action?action=entries"}},{"title":"➕ Добавить","action":{"type":"post","target":"https://fitness-diary-web.vercel.app/api/frame-action?action=log"}}]}'
        />
      </Head>

      <main style={{ padding: 16 }}>
        <h1>Fitness Diary — Mini</h1>
        <p>{status || "Готово"}</p>
      </main>
    </>
  )
}
