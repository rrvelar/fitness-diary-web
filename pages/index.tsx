import { useEffect, useState } from "react"
import Link from "next/link"
import { readContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) return
    fetchEntries()
  }, [isConnected, address])

  async function safeGetDates(addr: `0x${string}`) {
    let count = 10n
    while (count > 0n) {
      try {
        const result = await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [addr, 0n, count],
        }) as bigint[]
        return result
      } catch (err: any) {
        if (err.message.includes("Out of bounds")) {
          count -= 1n
        } else {
          throw err
        }
      }
    }
    return []
  }

  async function fetchEntries() {
    try {
      setLoading(true)
      const datesBigInt = await safeGetDates(address as `0x${string}`)
      const dates = datesBigInt.map(d => Number(d))

      const fetched: Entry[] = []
      for (let d of dates.slice(-3)) {
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
      setEntries(fetched.reverse())
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
      <h1 className="text-3xl font-bold text-emerald-700">Мой дневник фитнеса</h1>

      {!isConnected ? (
        <Card className="w-full max-w-md text-center p-6 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Подключите кошелёк, чтобы начать
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ConnectButton showBalance={false} accountStatus="address" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Link href="/log">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg shadow">
              ➕ Добавить запись
            </Button>
          </Link>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-700">Динамика веса</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-700">Последние записи</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p className="text-gray-500">Загрузка...</p>}
              {!loading && entries.length === 0 && <p className="text-gray-600">Записей пока нет</p>}
              <div className="space-y-4">
                {entries.map((entry, i) => (
                  <div key={i} className="border rounded-lg p-3 shadow-sm bg-white">
                    <p className="text-sm text-gray-800 font-medium">{formatDate(entry.date)}</p>
                    <p className="font-semibold text-emerald-700">
                      Вес: {(entry.weightGrams / 1000).toFixed(1)} кг
                    </p>
                    <p className="text-sm text-gray-800">Калории: {entry.caloriesIn} / {entry.caloriesOut}</p>
                    <p className="text-sm text-gray-800">Шаги: {entry.steps}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
