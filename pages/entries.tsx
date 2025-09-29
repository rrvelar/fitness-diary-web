import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "@wagmi/core"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { config } from "../lib/wagmi"
import { Dumbbell, Flame, Footprints, Scale } from "lucide-react"

// ✅ универсальный фикс адреса
const CONTRACT_ADDRESS = (
  (contractAddress as any)?.address || (contractAddress as any)
) as `0x${string}`

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

  useEffect(() => {
    if (!address) return
    const fetchEntries = async () => {
      setLoading(true)
      try {
        const dates = (await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [address, 0, 10],
        })) as number[]

        const result: Entry[] = []
        for (const d of dates) {
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
        }

        setEntries(result.filter((e) => e.exists))
      } catch (e) {
        console.error("fetchEntries error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [address])

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-green-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-700 mb-8 text-center">
          Мои записи
        </h1>

        {loading && (
          <p className="text-center text-gray-500">Загрузка...</p>
        )}

        <div className="space-y-6">
          {entries.map((e) => {
            const dateStr = String(e.date)
            const formatted = `${dateStr.slice(6, 8)}/${dateStr.slice(
              4,
              6
            )}/${dateStr.slice(0, 4)}`
            return (
              <div
                key={e.date}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {formatted}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Вес: {(e.weightGrams / 1000).toFixed(1)} кг</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Калории In: {e.caloriesIn}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-blue-500" />
                    <span>Калории Out: {e.caloriesOut}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-purple-500" />
                    <span>Шаги: {e.steps}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
