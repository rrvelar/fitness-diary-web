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

// 🚧 пока жёстко: список дат для теста
const HARDCODED_DATES = [BigInt(20250911)]

export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = async () => {
    if (!address) return
    setLoading(true)
    setError(null)

    try {
      const newEntries: Entry[] = []
      for (const d of HARDCODED_DATES) {
        const entry = (await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi: abi,
          functionName: "getEntry",
          args: [address, d]
        })) as any

        // если пустая запись — пропускаем
        if (
          Number(entry[1]) === 0 &&
          Number(entry[2]) === 0 &&
          Number(entry[3]) === 0 &&
          Number(entry[4]) === 0
        ) {
          continue
        }

        newEntries.push({
          date: Number(entry[0]), // YYYYMMDD
          weight: Number(entry[1]) / 1000, // граммы → кг
          caloriesIn: Number(entry[2]),
          caloriesOut: Number(entry[3]),
          steps: Number(entry[4])
        })
      }

      setEntries(newEntries)
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

  const formatDate = (yyyymmdd: number) => {
    const str = String(yyyymmdd)
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

      {!loading && entries.length > 0 && (
        <Button onClick={loadEntries}>Обновить</Button>
      )}
    </div>
  )
}
