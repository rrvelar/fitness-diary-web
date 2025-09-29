import { useEffect, useState } from "react"
import { readContract } from "@wagmi/core"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { useAccount } from "wagmi"
import { Flame, Footprints, ArrowUpCircle, ArrowDownCircle } from "lucide-react"

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

// если JSON выглядит как { "address": "0x...." }
const CONTRACT_ADDRESS = (contractAddress as { address: string }).address as `0x${string}`


export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchEntries = async () => {
    if (!address) return
    setLoading(true)
    try {
      // --- фикс: возвращает bigint[], конвертим в number[]
      const datesBigInt = await readContract(config, {
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getDates",
        args: [address, BigInt(startIndex), BigInt(5)],
      }) as bigint[]

      const dates: number[] = datesBigInt.map(d => Number(d))

      const newEntries: Entry[] = []
      for (const d of dates) {
        const entry = await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [address, BigInt(d)],
        })
        newEntries.push(entry as Entry)
      }

      setEntries((prev) => [...prev, ...newEntries])
      setStartIndex(startIndex + 5)
    } catch (err) {
      console.error("fetchEntries error", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [address])

  const formatDate = (raw: number) => {
    const str = raw.toString()
    const year = str.slice(0, 4)
    const month = str.slice(4, 6)
    const day = str.slice(6, 8)
    return `${day}/${month}/${year}`
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-700">
        Мои записи
      </h1>

      <div className="space-y-6">
        {entries.map((e, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold mb-2 text-blue-700">
              {formatDate(e.date)}
            </h2>

            <p className="flex items-center text-gray-700 font-medium">
              {e.weightGrams / 1000} кг
              {idx > 0 && (() => {
                const prev = entries[idx - 1].weightGrams / 1000
                const diff = e.weightGrams / 1000 - prev
                if (diff > 0)
                  return (
                    <span title={`+${diff.toFixed(1)} кг`}>
                      <ArrowUpCircle className="text-red-500 w-5 h-5 ml-2" />
                    </span>
                  )
                if (diff < 0)
                  return (
                    <span title={`${diff.toFixed(1)} кг`}>
                      <ArrowDownCircle className="text-green-500 w-5 h-5 ml-2" />
                    </span>
                  )
                return null
              })()}
            </p>

            <p className="flex items-center text-gray-600 mt-2">
              <Flame className="w-4 h-4 mr-2 text-orange-500" /> Вход:{" "}
              <b>{e.caloriesIn}</b>
            </p>
            <p className="flex items-center text-gray-600 mt-1">
              <Flame className="w-4 h-4 mr-2 text-blue-500" /> Расход:{" "}
              <b>{e.caloriesOut}</b>
            </p>
            <p className="flex items-center text-gray-600 mt-1">
              <Footprints className="w-4 h-4 mr-2 text-green-500" /> Шаги:{" "}
              <b>{e.steps}</b>
            </p>
          </div>
        ))}
      </div>

      {address && (
        <div className="flex justify-center mt-8">
          <button
            onClick={fetchEntries}
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Загрузка..." : "Показать ещё"}
          </button>
        </div>
      )}
    </div>
  )
}
