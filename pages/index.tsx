import { useEffect, useState } from "react"
import Link from "next/link"
import { readContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ConnectButton } from "@rainbow-me/rainbowkit"   // 🔹 добавили

const CONTRACT_ADDRESS = contractAddress.address as unknown as `0x${string}`

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

export default function HomePage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    fetchEntries()
  }, [address])

  async function fetchEntries() {
    try {
      setLoading(true)

      const datesBigInt = await readContract(config, {
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getDates",
        args: [address, BigInt(0), BigInt(10)],
      }) as bigint[]

      const dates = datesBigInt.map(d => Number(d))

      const fetched: Entry[] = []
      for (let d of dates.slice(-3)) { // последние 3 даты
        const entry = await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [address, BigInt(d)],
        }) as unknown as Entry

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

      setEntries(fetched.reverse()) // новые сверху
    } finally {
      setLoading(false)
    }
  }

  function formatDate(num: number) {
    const str = num.toString()
    return `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}`
  }

  const chartData = entries.map(e => ({
    date: formatDate(e.date),
    weight: e.weightGrams / 1000,
  }))

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      {/* 🔹 Кнопка подключения кошелька */}
      <div className="self-end">
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>

      <h1 className="text-3xl font-bold text-blue-600">Мой дневник фитнеса</h1>

      <Link href="/log">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow">
          ➕ Добавить запись
        </Button>
      </Link>

      <Card className="w-full max-w-2xl p-4">
        <CardHeader>
          <CardTitle className="text-lg">Динамика веса</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Нет данных для графика</p>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl p-4">
        <CardHeader>
          <CardTitle className="text-lg">Последние записи</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Загрузка...</p>}
          {!loading && entries.length === 0 && <p className="text-gray-500">Записей пока нет</p>}
          <div className="space-y-4">
            {entries.map((entry, i) => (
              <div key={i} className="border rounded-lg p-3 shadow-sm bg-white">
                <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                <p className="font-medium">Вес: {(entry.weightGrams / 1000).toFixed(1)} кг</p>
                <p className="text-sm">Калории: {entry.caloriesIn} / {entry.caloriesOut}</p>
                <p className="text-sm">Шаги: {entry.steps}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
