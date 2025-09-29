import { useEffect, useState } from "react"
import { readContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Flame, Footprints } from "lucide-react"
import { config } from "../lib/wagmi"

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

const CONTRACT_ADDRESS = contractAddress.address as unknown as `0x${string}`

export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)

  const fetchEntries = async (startIndex: number, count: number) => {
    try {
      const dates = (await readContract(config, {
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getDates",
        args: [address, startIndex, count],
      })) as number[]
      return dates
    } catch (err) {
      console.warn(`getDates failed (count=${count}):`, err)
      return null
    }
  }

  const loadMore = async () => {
    if (!address) return
    setLoading(true)

    // пробуем сначала по 10
    let dates = await fetchEntries(loadedCount, 10)

    // если не получилось — пробуем меньше
    if (!dates) {
      dates = await fetchEntries(loadedCount, 5)
    }
    if (!dates) {
      dates = await fetchEntries(loadedCount, 1)
    }

    if (!dates) {
      setLoading(false)
      return
    }

    const result: Entry[] = []
    for (const d of dates) {
      try {
        const raw = (await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [address, d],
        })) as any

        result.push({
          date: Number(raw.date),
          weightGrams: Number(raw.weightGrams),
          caloriesIn: Number(raw.caloriesIn),
          caloriesOut: Number(raw.caloriesOut),
          steps: Number(raw.steps),
          exists: raw.exists,
        })
      } catch (err) {
        console.warn("getEntry error:", err)
      }
    }

    setEntries((prev) => [...prev, ...result.filter((e) => e.exists)])
    setLoadedCount((prev) => prev + (dates?.length || 0))
    setLoading(false)
  }

  useEffect(() => {
    setEntries([])
    setLoadedCount(0)
    if (address) {
      loadMore()
    }
  }, [address])

  const formatDate = (dateNum: number) => {
    const str = dateNum.toString()
    const y = str.slice(0, 4)
    const m = str.slice(4, 6)
    const d = str.slice(6, 8)
    return `${d}/${m}/${y}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Мои записи</h1>

        {entries.length === 0 && !loading && (
          <p className="text-center text-gray-500">Записей пока нет</p>
        )}

        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <Card key={idx} className="shadow-md border border-gray-200">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{formatDate(entry.date)}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>Вес: {(entry.weightGrams / 1000).toFixed(1)} кг</div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Вход: {entry.caloriesIn}
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-blue-500" />
                  Расход: {entry.caloriesOut}
                </div>
                <div className="flex items-center gap-1">
                  <Footprints className="w-4 h-4 text-green-600" />
                  Шаги: {entry.steps}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && <p className="text-center text-gray-500 mt-4">Загрузка…</p>}

        {entries.length > 0 && !loading && (
          <div className="flex justify-center mt-6">
            <Button onClick={loadMore}>Показать ещё</Button>
          </div>
        )}
      </div>
    </div>
  )
}
