// pages/frame.tsx
import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import { encodeFunctionData } from "viem"
import { sdk } from "@farcaster/miniapp-sdk"
import abi from "../abi/FitnessDiary.json"
import { publicClient } from "../lib/viem"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

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
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"log" | "entries" | "chart">("log")

  // форма
  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [calIn, setCalIn] = useState("")
  const [calOut, setCalOut] = useState("")
  const [steps, setSteps] = useState("")

  const pollRef = useRef<number | null>(null)

  // убираем splash
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

  // безопасный вызов getDates
  async function safeGetDates(user: `0x${string}`): Promise<bigint[]> {
    let count = 20n
    while (count > 0n) {
      try {
        const dates = (await publicClient.readContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [user, 0n, count],
        })) as bigint[]
        return dates
      } catch (err: any) {
        if (err.message?.includes("Out of bounds")) {
          count -= 1n
        } else {
          console.error("safeGetDates error:", err)
          throw err
        }
      }
    }
    return []
  }

  async function fetchEntries() {
    try {
      if (!provider?.request) return
      const [user] = await provider.request({ method: "eth_accounts" })
      if (!user) return

      setLoading(true)

      const datesBigInt = await safeGetDates(user as `0x${string}`)
      const dates = datesBigInt.map(Number)

      const fetched: Entry[] = []
      for (let d of dates) {
        try {
          const entry = (await publicClient.readContract({
            abi,
            address: CONTRACT_ADDRESS,
            functionName: "getEntry",
            args: [user as `0x${string}`, BigInt(d)],
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
        } catch (err) {
          console.error(`fetchEntry(${d}) error:`, err)
        }
      }

      // сортировка новые → старые
      setEntries(fetched.sort((a, b) => b.date - a.date))
    } catch (err) {
      console.error("fetchEntries error", err)
    } finally {
      setLoading(false)
    }
  }

  async function logEntry() {
    try {
      if (!date || !weight || !calIn || !calOut || !steps) {
        alert("⚠️ Заполни все поля")
        return
      }
      if (!provider?.request) throw new Error("Warpcast кошелёк недоступен")

      setStatus("⏳ Отправка транзакции...")

      const ymd = Number(date.replace(/-/g, "")) // yyyy-mm-dd → yyyymmdd
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
      console.error("logEntry error:", err)
      setStatus(`❌ Ошибка: ${err.message || String(err)}`)
    }
  }

  // автообновление раз в 30 секунд
  useEffect(() => {
    fetchEntries()
    if (pollRef.current !== null) window.clearInterval(pollRef.current)
    pollRef.current = window.setInterval(fetchEntries, 30000)
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current)
    }
  }, [])

  function formatDate(num: number) {
    const str = num.toString()
    return `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}`
  }

  const chartData = entries.map((e) => ({
    date: formatDate(e.date),
    weight: e.weightGrams / 1000,
  }))

  return (
    <>
      <Head>
        <title>Fitness Diary — Mini</title>
        <meta property="og:title" content="Fitness Diary — Mini" />
        <meta
          property="og:description"
          content="Добавь запись прямо из Warpcast"
        />
        <meta
          property="og:image"
          content="https://fitness-diary-web.vercel.app/og.png"
        />
      </Head>

      <main className="min-h-screen p-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <h1 className="text-3xl font-extrabold text-emerald-700 text-center">
          Fitness Diary — Mini
        </h1>
        <p className="text-center text-gray-600">{status || "Готово"}</p>

        {/* меню */}
        <nav className="flex justify-center gap-4">
          <button
            className={`px-4 py-2 rounded-lg transition ${
              view === "entries"
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-700 border border-emerald-600 hover:bg-emerald-50"
            }`}
            onClick={() => setView("entries")}
          >
            📖 Записи
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition ${
              view === "log"
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-700 border border-emerald-600 hover:bg-emerald-50"
            }`}
            onClick={() => setView("log")}
          >
            ➕ Добавить
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition ${
              view === "chart"
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-700 border border-emerald-600 hover:bg-emerald-50"
            }`}
            onClick={() => setView("chart")}
          >
            📊 График
          </button>
        </nav>

        {/* Добавить запись */}
        {view === "log" && (
          <div className="space-y-2 border p-4 rounded-lg shadow bg-white">
            <input
              type="date"
              className="w-full border p-2 rounded text-gray-900"
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
              className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 w-full transition"
            >
              ➕ Добавить запись
            </button>
          </div>
        )}

        {/* Последние записи */}
        {view === "entries" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg text-emerald-700">
                Последние записи
              </h2>
              <button
                onClick={fetchEntries}
                className="flex items-center gap-1 text-sm text-emerald-600 border border-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition"
              >
                🔄 Обновить
              </button>
            </div>
            {loading && <p className="text-gray-500">Загрузка...</p>}
            {!loading && entries.length === 0 && (
              <p className="text-gray-500">Записей пока нет</p>
            )}
            {entries.map((e, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 shadow-md bg-white hover:shadow-lg transition"
              >
                <p className="text-sm text-gray-500">{formatDate(e.date)}</p>
                <p className="font-semibold text-emerald-700 text-lg">
                  Вес: {(e.weightGrams / 1000).toFixed(1)} кг
                </p>
                <p className="text-sm text-gray-700">
                  Калории:{" "}
                  <span className="font-medium">{e.caloriesIn}</span> /{" "}
                  <span className="font-medium">{e.caloriesOut}</span>
                </p>
                <p className="text-sm text-gray-700">Шаги: {e.steps}</p>
              </div>
            ))}
          </div>
        )}

        {/* График */}
        {view === "chart" && (
          <div className="w-full h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">Нет данных для графика</p>
            )}
          </div>
        )}
      </main>
    </>
  )
}
