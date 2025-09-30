// pages/frame.tsx
import Head from "next/head"
import { useEffect, useState, useRef } from "react"
import { encodeFunctionData } from "viem"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { sdk } from "@farcaster/miniapp-sdk"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import abi from "../abi/FitnessDiary.json"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!

const publicClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
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
  const [userAddress, setUserAddress] = useState<`0x${string}` | null>(null)

  // форма
  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [calIn, setCalIn] = useState("")
  const [calOut, setCalOut] = useState("")
  const [steps, setSteps] = useState("")

  const recordsRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      try {
        await sdk.actions.ready()
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
      setUserAddress(from)

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
      fetchEntries(from)
    } catch (err: any) {
      setStatus(`❌ Ошибка: ${err.message || String(err)}`)
    }
  }

  async function fetchEntries(addr?: `0x${string}`) {
    try {
      const from = addr || userAddress
      if (!from) return

      const dates = (await publicClient.readContract({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getDates",
        args: [from, 0n, 10n],
      })) as bigint[]

      const recent = dates.slice(-5).map(Number)

      const fetched: Entry[] = []
      for (let d of recent) {
        const entry = (await publicClient.readContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [from, BigInt(d)],
        })) as unknown as Entry

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
      console.error("fetchEntries error:", err)
    }
  }

  useEffect(() => {
    const i = setInterval(() => fetchEntries(), 5000)
    return () => clearInterval(i)
  }, [userAddress])

  function formatDate(num: number) {
    const str = num.toString()
    return `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}`
  }

  const chartData = entries.map(e => ({
    date: formatDate(e.date),
    weight: e.weightGrams / 1000,
  }))

  return (
    <>
      <Head>
        <title>Fitness Diary Frame</title>
      </Head>

      <main className="p-6 space-y-6">
        {/* меню */}
        <nav className="flex space-x-4 text-emerald-600 font-semibold">
          <button onClick={() => recordsRef.current?.scrollIntoView({ behavior: "smooth" })}>
            📖 Записи
          </button>
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
            ➕ Добавить
          </button>
          <button onClick={() => chartRef.current?.scrollIntoView({ behavior: "smooth" })}>
            📊 График
          </button>
        </nav>

        <h1 className="text-2xl font-bold text-emerald-700">Fitness Diary — Mini</h1>
        <p className="text-gray-600">{status || "Готово"}</p>

        {/* форма */}
        <div ref={formRef} className="space-y-2 border p-4 rounded-lg shadow bg-white">
          <input
            type="date"
            className="w-full border p-2 rounded text-black"
            value={date ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}` : ""}
            onChange={e => {
              const val = e.target.value.replace(/-/g, "")
              setDate(val)
            }}
          />
          <input
            className="w-full border p-2 rounded text-black"
            placeholder="Вес (кг)"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded text-black"
            placeholder="Калории In"
            value={calIn}
            onChange={e => setCalIn(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded text-black"
            placeholder="Калории Out"
            value={calOut}
            onChange={e => setCalOut(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded text-black"
            placeholder="Шаги"
            value={steps}
            onChange={e => setSteps(e.target.value)}
          />
          <button
            onClick={logEntry}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 w-full"
          >
            ➕ Добавить запись
          </button>
        </div>

        {/* последние записи */}
        <div ref={recordsRef} className="space-y-3">
          <h2 className="font-semibold text-lg text-emerald-700">Последние записи</h2>
          {entries.length === 0 && <p className="text-gray-500">Записей пока нет</p>}
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

        {/* график */}
        <div ref={chartRef} className="space-y-3">
          <h2 className="font-semibold text-lg text-emerald-700">📊 Динамика веса</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Нет данных для графика</p>
          )}
        </div>
      </main>
    </>
  )
}
