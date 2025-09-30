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

  // Сообщаем Warpcast, что страница готова — убирает сплэш
  useEffect(() => {
    (async () => {
      try {
        await sdk.actions.ready()
        console.log("✅ sdk.actions.ready() called")
      } catch (e) {
        console.warn("⚠️ sdk.actions.ready() failed", e)
      }
    })()
  }, [])

  // Если пришли query-параметры — отправляем транзакцию через EIP-1193
  useEffect(() => {
    if (!router.isReady || sentRef.current) return

    const { date, weight, calIn, calOut, steps } = router.query
    const haveAll = [date, weight, calIn, calOut, steps].every(v => v !== undefined)
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
        {/* OG для внутреннего превью */}
        <meta property="og:title" content="Fitness Diary — Mini" />
        <meta property="og:description" content="Добавь запись прямо из Warpcast" />
        <meta property="og:image" content="https://fitness-diary-web.vercel.app/og.png" />
        {/* ❌ никакие fc:frame/fc:miniapp здесь не нужны */}
      </Head>

      <main style={{ padding: 16 }}>
        <h1>Fitness Diary — Mini</h1>
        <p>{status || "Готово"}</p>
      </main>
    </>
  )
}
