import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import abi from "../abi/FitnessDiary.json"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DIARY_ADDRESS as `0x${string}`

type Entry = {
  date: bigint
  weightGrams: bigint
  caloriesIn: bigint
  caloriesOut: bigint
  steps: bigint
  exists: boolean
}

export default function EntriesPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    loadEntries()
  }, [address])

  const loadEntries = async () => {
    if (!address) return
    setLoading(true)

    try {
      // 1. получаем даты (берём первые 50 для примера)
      const { result: dates } = await readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getDates",
        args: [address, BigInt(0), BigInt(50)],
      }) as { result: bigint[] }

      const results: Entry[] = []

      for (const d of dates) {
        const { result: e } = await readContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getEntry",
          args: [address, d],
        }) as { result: Entry }

        if (e.exists) results.push(e)
      }

      setEntries(results)
    } catch (err) {
      console.error("Ошибка загрузки:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Мои записи</h1>
      <p>Адрес: {address}</p>

      {loading ? (
        <p>Загрузка...</p>
      ) : entries.length === 0 ? (
        <p>Нет записей</p>
      ) : (
        <ul>
          {entries.map((e, i) => (
            <li key={i} style={{ marginBottom: 12 }}>
              📅 {e.date.toString()} — ⚖️ {Number(e.weightGrams) / 1000} кг,  
              🔥 {e.caloriesIn.toString()} / {e.caloriesOut.toString()},  
              👟 {e.steps.toString()} шагов
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
