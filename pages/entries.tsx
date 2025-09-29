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

      // пробуем count = 10, если не сработает — уменьшаем
      while (count > 0 && dates.length === 0) {
        try {
          dates = (await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi: abi,
            functionName: "getDates",
            args: [address, BigInt(startIndex), BigInt(count)]
          })) as bigint[]
        } catch (err: any) {
          console.warn(`getDates failed (count=${count}):`, err.shortMessage || err.message)
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

      setEntries((prev) => [...prev, ...newEntries])
      setStartIndex((prev) => prev + dates.length)
    } catch (err: any) {
      console.error("Ошибка при загрузке:", err)
      setError("Ошибка при загрузке данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      // сбрасываем состояние при смене пользователя
      setEntries([])
      setStartIndex(0)
      setHasMore(true)
      loadEntries()
    }
  }, [address])

  const formatDate = (yyyymmdd: number) => {
    const str = String(yyyymmdd)
    if (str.length !== 8) return str
    return str.replace(/(\d{4})(\d{2})(\d{2})/, (_, y, m, d) => `${d}/${m}/${y}`)
  }

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
              <CardTitle>{formatDate(entry.date)}</CardTitle>
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
          Array.from({ length: 1 }).map((_, i) => (
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

      {!loading && hasMore && (
        <Button onClick={loadEntries}>Показать ещё</Button>
      )}
    </div>
  )
}
