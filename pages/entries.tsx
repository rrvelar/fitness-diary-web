import { useEffect, useState } from "react"
import { readContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowUpCircle, ArrowDownCircle, Flame, Footprints } from "lucide-react"

const CONTRACT_ADDRESS = contractAddress.address as unknown as `0x${string}`

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (!address) return
    fetchEntries()
  }, [address, count])

  async function safeGetDates(addr: `0x${string}`, count: bigint) {
    while (count > 0n) {
      try {
        return await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [addr, 0n, count],
        }) as bigint[]
      } catch (err: any) {
        if (err.message.includes("Out of bounds")) count -= 1n
        else throw err
      }
    }
    return []
  }

  async function fetchEntries() {
    try {
      setLoading(true)
      const datesBigInt = await safeGetDates(address as `0x${string}`, BigInt(count))
      const dates = datesBigInt.map(d => Number(d))

      const fetched: Entry[] = []
      for (let d of dates) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center p-6 space-y-6">
      <h1 className="text-3xl font-bold text-emerald-700">Мои записи</h1>

      <Card className="w-full max-w-2xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-emerald-700">История</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-gray-500">Загрузка...</p>}
          {!loading && entries.length === 0 && <p className="text-gray-500">Записей пока нет</p>}

          <div className="space-y-4">
            {entries.map((entry, i) => {
              const prev = entries[i + 1]
              const weightDiff = prev ? (entry.weightGrams - prev.weightGrams) / 1000 : 0

              return (
                <div
                  key={i}
                  className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
                >
                  <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">
                      Вес: {(entry.weightGrams / 1000).toFixed(1)} кг
                    </p>
                    {weightDiff !== 0 &&
                      (weightDiff > 0 ? (
                        <ArrowUpCircle
                          className="text-red-500 w-4 h-4"
                          aria-label={`+${weightDiff.toFixed(1)} кг`}
                        />
                      ) : (
                        <ArrowDownCircle
                          className="text-green-500 w-4 h-4"
                          aria-label={`${weightDiff.toFixed(1)} кг`}
                        />
                      ))}
                  </div>
                  <div className="flex gap-4 text-sm mt-1">
                    <span className="flex items-center gap-1 text-gray-700">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {entry.caloriesIn}/{entry.caloriesOut}
                    </span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <Footprints className="w-4 h-4 text-blue-500" />
                      {entry.steps}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {entries.length >= count && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setCount(count + 5)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Показать ещё
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
