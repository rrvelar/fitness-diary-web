// pages/frame.tsx
import Head from "next/head"
import { useEffect, useState } from "react"
import { encodeFunctionData } from "viem"
import { sdk } from "@farcaster/miniapp-sdk"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import abi from "../abi/FitnessDiary.json"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const ALCHEMY_RPC = process.env.NEXT_PUBLIC_ALCHEMY_RPC as string

// клиент для чтения из блокчейна (через Alchemy)
const publicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_RPC),
})

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
  const [activeTab, setActiveTab] = useState<"entries" | "add" | "chart">("add")

  // форма
  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [calIn, setCalIn] = useState("")
  const [calOut, setCalOut] = useState("")
  const [steps, setSteps] = useState("")

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

      const ymd = Number(date.replace(/-/g, "")) // YYYY-MM-DD → YYYYMMDD
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
      const dates: bigint[] = await publicClient.readContract({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getDates",
        args: [from as `0x${string}`, 0n, 10n],
      })

      const recent = dates.slice(-3).map(Number)
      const fetched: Entry[] = []

      for (let d of recent) {
        const entry = await publicClient.readContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [from as `0x${string}`, BigInt(d)],
        })

        if ((entry as any).exists) {
          fetched.push({
            ...entry,
            date: Number((entry as any).date),
            weightGrams: Number((entry as any).weightGrams),
            caloriesIn: Number((entry as any).caloriesIn),
            caloriesOut: Number((entry as any).caloriesOut),
            steps: Number((entry as any).steps),
          })
        }
      }

      setEntries(fetched.reverse())
    } catch (err) {
      console.error(err)
    }
  }

  // автообновление каждые 5 секунд
  useEffect(() => {
    fetchEntries()
    const interval = setInterval(fetchEntries, 5000)
    return () => clearInterval(interval)
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
        <meta property="og:image" content="https://fitness-diary-web.vercel.app/og.png" />
      </Head>

      <main className="p-6 space-y-6 bg-slate-900 min-h-screen text-white">
        <h1 className="text-2xl font-bold text-emerald-400">Fitness Diary — Mini</h1>
        <p className="text-gray-300">{status || "Готово"}</p>

        {/* меню */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("entries")}
            className={`px-3 py-1 rounded ${activeTab === "entries" ? "bg-emerald-500" : "bg-slate-700"}`}
          >
            Записи
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-3 py-1 rounded ${activeTab === "add" ? "bg-emerald-500" : "bg-slate-700"}`}
          >
            Добавить
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`px-3 py-1 rounded ${activeTab === "chart" ? "bg-emerald-500" : "bg-slate-700"}`}
          >
            График
          </button>
        </div>

        {/* вкладки */}
        {activeTab === "add" && (
          <div className="space-y-2 border p-4 rounded-lg shadow bg-slate-800">
            <input
              type="date"
              className="w-full border p-2 rounded text-black"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <input className="w-full border p-2 rounded text-black" placeholder="Вес (кг)" value={weight} onChange={e => setWeight(e.target.value)} />
            <input className="w-full border p-2 rounded text-black" placeholder="Калории In" value={calIn} onChange={e => setCalIn(e.target.value)} />
            <input className="w-full border p-2 rounded text-black" placeholder="Калории Out" value={calOut} onChange={e => setCalOut(e.target.value)} />
            <input className="w-full border p-2 rounded text-black" placeholder="Шаги" value={steps} onChange={e => setSteps(e.target.value)} />
            <button onClick={logEntry} className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 w-full">
              ➕ Добавить запись
            </button>
          </div>
        )}

        {activeTab === "entries" && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg text-emerald-400">Последние записи</h2>
            {entries.length === 0 && <p className="text-gray-400">Записей пока нет</p>}
            {entries.map((e, i) => (
              <div key={i} className="border rounded-lg p-3 shadow bg-slate-800">
                <p className="text-sm text-gray-400">{formatDate(e.date)}</p>
                <p className="font-semibold text-emerald-400">
                  Вес: {(e.weightGrams / 1000).toFixed(1)} кг
                </p>
                <p className="text-sm text-gray-200">
                  Калории: {e.caloriesIn} / {e.caloriesOut}
                </p>
                <p className="text-sm text-gray-200">Шаги: {e.steps}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "chart" && (
          <div>
            <h2 className="font-semibold text-lg text-emerald-400">График веса</h2>
            <p className="text-gray-400">📊 (сюда можно встроить recharts позже)</p>
          </div>
        )}
      </main>
    </>
  )
}
