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

type Entry = {
  date: number
  weight: number
  caloriesIn: number
  caloriesOut: number
  steps: number
}

// ✅ универсальный фикс + поддержка объекта { address: "0x..." }
const CONTRACT_ADDRESS = ((contractAddress as any).address || contractAddress) as `0x${string}`

// 🔒 безопасный вызов getDates (уменьшаем count при Out of bounds)
async function safeGetDates(user: string, startIndex: number, count: number) {
  try {
    return (await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "getDates",
      args: [user, BigInt(startIndex), BigInt(count)]
    })) as any as bigint[]
  } catch (err: any) {
    console.warn("getDates failed with count =", count, err)
    if (count > 1) {
      return safeGetDates(user, startIndex, Math.floor(count / 2))
    }
    return []
  }
}

export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const COUNT = 10

  const loadEntries = async () => {
    if (!address) return
    setLoading(true)
    setError(null)

    try {
      const dates = await safeGetDates(address, startIndex, COUNT)

      if (!dates || dates.length === 0) {
        setLoading(false)
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

        newEntries.push({
          date: Number(d),
          weight: Number(entry[0]) / 1000, // граммы → кг
          caloriesIn: Number(entry[1]),
          caloriesOut: Number(entry[2]),
          steps: Number(entry[3])
        })
      }

      setEntries(prev => [...prev, ...newEntries])
      setStartIndex(prev => prev + dates.length) // учитываем реальное количество
    } catch (err: any) {
      console.error(err)
      setError("Ошибка при загрузке данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [address])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Мои записи</h1>

      {error && <p className="text-red-500">{error}</p>}

      {entries.length === 0 && !loading && (
        <p className="text-gray-500">У вас пока нет записей.</p>
      )}

      <div className="grid gap-4">
        {entries.map((entry, i) => (
          <Card key={`${entry.date}-${i}`}>
            <CardHeader>
              <CardTitle>
                {new Date(entry.date * 1000).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Вес: {entry.weight.toFixed(1)} кг</p>
              <p>Калории (вход): {entry.caloriesIn}</p>
              <p>Калории (расход): {entry.caloriesOut}</p>
              <p>Шаги: {entry.steps}</p>
            </CardContent>
          </Card>
        ))}

        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
      </div>

      {!loading && entries.length > 0 && (
        <Button onClick={loadEntries}>Показать ещё</Button>
      )}
    </div>
  )
}
