// pages/frame.tsx
import Head from "next/head"
import { useEffect, useState, useRef } from "react"
import { encodeFunctionData, decodeFunctionResult } from "viem"
import { sdk } from "@farcaster/miniapp-sdk"
import abi from "../abi/FitnessDiary.json"
import { publicClient } from "../lib/viem" // Alchemy client

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

// тип для auto-refresh setInterval
type IntervalId = ReturnType<typeof setInterval>

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

export default function Frame() {
  const [status, setStatus] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])

  // форма
  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [calIn, setCalIn] = useState("")
  const [calOut, setCalOut] = useState("")
  const [steps, setSteps] = useState("")

  // ref для интервала
  const pollRef = useRef<IntervalId | null>(null)

  // Miniapp ready → убирает splash
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

  const provider = sdk.wallet.ethProvider

  async function logEntry() {
    try {
      if (!date || !weight || !calIn || !calOut || !steps) {
        alert("⚠️ Заполни все поля")
        return
      }
      if (!provider?.request) throw new Error("Warpcast кошелёк недоступен")

      setStatus("⏳ Отправка транзакции...")

      const ymd = Number(date)
      const w = Math.round(Number(weight) * 1000)
      const ci = Number(calIn)
      const co = Number(calOut)
      const st = Number(steps)

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
            to: CONTRACT_ADDRESS,
            data,
            value: "0x0",
          },
        ],
      })

      setStatus(`✅ Успешно! tx: ${txHash}`)
      fetchEntries()
    } catch (err: any) {
      setStatus(`❌ Ошибка: ${err.message || String(err)}`)
    }
  }

  async function fetchEntries() {
    try {
      const [from] = await provider.request({ method: "eth_accounts" })

      // читаем последние 10 дат через Alchemy
      const dates = (await publicClient.readContract({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getDates",
        args: [from as `0x${string}`, 0n, 10n],
      })) as bigint[]

      const recent = dates.slice(-3).map(Number)

      const fetched: Entry[] = []
      for (let d of recent) {
        const entry = (await publicClient.readContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [from as `0x${string}`, BigInt(d)],
        })) as Entry

        if (entry.exists) {
          fetched.push({
            ...entry,
            date: Number(entry.date),
            weightGrams: Number(entry.weightGrams),
            caloriesIn: Number(entry.caloriesIn),
            caloriesOut: Number(entry.caloriesOut),
            steps: Number(entry.steps),
          })
        }
      }

      setEntries(fetched.reverse())
    } catch (err) {
      console.error("fetchEntries error", err)
    }
  }

  // автообновление каждые 5 секунд
  useEffect(() => {
    fetchEntries()
    if (pollRef.current !== null) clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchEntries, 5000)

    return () => {
      if (pollRef.current !== null) clearInterval(pollRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatDate(num: number) {
    const str = num.toString()
    return `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}`
  }

  return (
    <>
      <Head>
        <title>Fitness Diary Frame</title>
        <meta property="og:title" content="Fitness Diary — Mini" />
        <meta property="og:description" content="Добавь запись прямо из Warpcast" />
        <meta
          property="og:image"
          content="https://fitness-diary-web.vercel.app/og.png"
        />
      </Head>

      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-emerald-700">
          Fitness Diary — Mini
        </h1>
        <p className="text-gray-600">{status || "Готово"}</p>

        {/* форма */}
        <div className="space-y-2 border p-4 rounded-lg shadow">
          <input
            className="w-full border p-2 rounded text-gray-900"
            placeholder="Дата (YYYYMMDD)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded text-gray-900"
            placeholder="Вес (кг)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded text-gray-900"
            placeholder="Калории In"
            value={calIn}
            onChange={(e) => setCalIn(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded text-gray-900"
            placeholder="Калории Out"
            value={calOut}
            onChange={(e) => setCalOut(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded text-gray-900"
            placeholder="Шаги"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />
          <button
            onClick={logEntry}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 w-full"
          >
            ➕ Добавить запись
          </button>
        </div>

        {/* последние записи */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg text-emerald-700">
            Последние записи
          </h2>
          {entries.length === 0 && (
            <p className="text-gray-500">Записей пока нет</p>
          )}
          {entries.map((e, i) => (
            <div key={i} className="border rounded-lg p-3 shadow bg-white">
              <p className="text-sm text-gray-600">{formatDate(e.date)}</p>
              <p className="font-semibold text-emerald-700">
                Вес: {(e.weightGrams / 1000).toFixed(1)} кг
              </p>
              <p className="text-sm text-gray-800">
                Калории: {e.caloriesIn} / {e.caloriesOut}
              </p>
              <p className="text-sm text-gray-800">Шаги: {e.steps}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
