"use client"

import { useEffect, useState } from "react"
import { readContract } from "@wagmi/core"
import { config } from "../lib/wagmi"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { useAccount } from "wagmi"
import { ArrowUpCircle, ArrowDownCircle, Flame, Footprints } from "lucide-react"

type Entry = {
  date: number
  weight: number
  caloriesIn: number
  caloriesOut: number
  steps: number
}

const CONTRACT_ADDRESS = ((contractAddress as any).address || contractAddress) as `0x${string}`

export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadEntries = async () => {
    if (!address) return
    setLoading(true)
    setError(null)

    try {
      let dates: bigint[] = []
      let count = 10

      while (count > 0 && dates.length === 0) {
        try {
          dates = (await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi: abi,
            functionName: "getDates",
            args: [address, BigInt(startIndex), BigInt(count)]
          })) as bigint[]
        } catch {
          count = Math.floor(count / 2)
        }
      }

      if (dates.length === 0) {
        setHasMore(false)
        return
      }

      const newEntries: Entry[] = []

      for (const d of dates) {
        const entry = (await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi: abi,
          functionName: "getEntry",
          args: [address, d]
        })) as any

        if (!entry.exists) continue

        newEntries.push({
          date: Number(entry.date),
          weight: Number(entry.weightGrams) / 1000,
          caloriesIn: Number(entry.caloriesIn),
          caloriesOut: Number(entry.caloriesOut),
          steps: Number(entry.steps)
        })
      }

      setEntries((prev) =>
        [...prev, ...newEntries].sort((a, b) => b.date - a.date)
      )
      setStartIndex((prev) => prev + dates.length)
    } catch {
      setError("Ошибка при загрузке данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      setEntries([])
      setStartIndex(0)
      setHasMore(true)
      loadEntries()
    }
  }, [address])

  const formatDate = (yyyymmdd: number) => {
    const str = String(yyyymmdd)
    if (str.length !== 8) return str
    return str.replace(/(\d{4})(\d{2})(\d{2})/, (_, y, m, d) => `${d}.${m}.${y}`)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center text-emerald-600">
        Мой дневник здоровья
      </h1>

      {error && <p className="text-red-500">{error}</p>}
      {entries.length === 0 && !loading && (
        <p className="text-gray-500 text-center">У вас пока нет записей.</p>
      )}

      <div className="grid gap-6">
        {entries.map((entry, i) => {
          const prev = entries[i + 1]
          const weightDiff = prev ? entry.weight - prev.weight : 0

          return (
            <Card
              key={`${entry.date}-${i}`}
              className="rounded-2xl shadow-md border border-gray-100 bg-white transition hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700">
                  {formatDate(entry.date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                {/* Вес */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Вес:</span>
                  <span className="font-bold text-gray-800">
                    {entry.weight.toFixed(1)} кг
                  </span>
                  {weightDiff !== 0 && (
                    weightDiff > 0 ? (
                      <span title={`+${weightDiff.toFixed(1)} кг`}>
                        <ArrowUpCircle className="text-red-500 w-4 h-4" />
                      </span>
                    ) : (
                      <span title={`${weightDiff.toFixed(1)} кг`}>
                        <ArrowDownCircle className="text-green-500 w-4 h-4" />
                      </span>
                    )
                  )}
                </div>

                {/* Калории вход */}
                <div className="flex items-center gap-2">
                  <Flame className="text-orange-500 w-4 h-4" />
                  <span className="text-gray-600">
                    Вход: <b>{entry.caloriesIn}</b>
                  </span>
                </div>

                {/* Калории расход */}
                <div className="flex items-center gap-2">
                  <Flame className="text-blue-500 w-4 h-4" />
                  <span className="text-gray-600">
                    Расход: <b>{entry.caloriesOut}</b>
                  </span>
                </div>

                {/* Шаги */}
                <div className="flex items-center gap-2">
                  <Footprints className="text-emerald-500 w-4 h-4" />
                  <span className="text-gray-600">
                    Шаги: <b>{entry.steps}</b>
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {loading &&
          Array.from({ length: 1 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="rounded-2xl shadow-md border">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="text-center">
        {!loading && hasMore && (
          <Button
            onClick={loadEntries}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2 text-sm shadow-sm"
          >
            {loading ? "Загрузка..." : "Показать ещё"}
          </Button>
        )}
        {!hasMore && (
          <p className="text-gray-500 mt-3 text-sm">Все записи загружены ✅</p>
        )}
      </div>
    </div>
  )
}
