import { useEffect, useState } from "react"
import { readContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { config } from "../lib/wagmi"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowUpCircle, ArrowDownCircle, Flame, Footprints } from "lucide-react"


type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
}

const CONTRACT_ADDRESS = contractAddress.address as unknown as `0x${string}`

export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchEntries() {
    if (!address) return

    setLoading(true)
    try {
      let count = 10
      let dates: number[] = []

      try {
        dates = (await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [address, 0, count],
        })) as number[]
      } catch (err) {
        console.warn("Первый вызов getDates дал ошибку, пробуем меньше count", err)
        count = 5
        dates = (await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [address, 0, count],
        })) as number[]
      }

      const entriesData: Entry[] = []
      for (const d of dates) {
        const rawEntry = await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [address, d],
        })

        if (rawEntry && (rawEntry as any).exists) {
          entriesData.push({
            date: Number((rawEntry as any).date),
            weightGrams: Number((rawEntry as any).weightGrams),
            caloriesIn: Number((rawEntry as any).caloriesIn),
            caloriesOut: Number((rawEntry as any).caloriesOut),
            steps: Number((rawEntry as any).steps),
          })
        }
      }

      setEntries(entriesData)
    } catch (error) {
      console.error("fetchEntries error", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      fetchEntries()
    }
  }, [address])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Мои записи</h1>

      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-500">Нет записей</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, i) => {
            const dateStr = entry.date
              ? new Date(
                  String(entry.date).slice(0, 4) +
                    "-" +
                    String(entry.date).slice(4, 6) +
                    "-" +
                    String(entry.date).slice(6, 8)
                ).toLocaleDateString("ru-RU")
              : "Invalid Date"

            const prev = i > 0 ? entries[i - 1] : null
            const weightDiff =
              prev && entry.weightGrams
                ? (entry.weightGrams - prev.weightGrams) / 1000
                : 0

            return (
              <Card key={i} className="shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{dateStr}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    Вес: {(entry.weightGrams / 1000).toFixed(1)} кг
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
                  </p>
                  <p className="flex items-center gap-2">
                    <Flame className="text-orange-500 w-4 h-4" />
                    Калории (вход): {entry.caloriesIn}
                  </p>
                  <p className="flex items-center gap-2">
                    <Flame className="text-blue-500 w-4 h-4" />
                    Калории (расход): {entry.caloriesOut}
                  </p>
                  <p className="flex items-center gap-2">
                    <Footprints className="text-green-600 w-4 h-4" />
                    Шаги: {entry.steps}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <Button onClick={fetchEntries} disabled={loading}>
          {loading ? "Обновляю..." : "Обновить"}
        </Button>
      </div>
    </div>
  )
}
