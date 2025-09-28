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

export default function Entries() {
  const { address, isConnected } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadEntries = async () => {
      if (!isConnected || !address) return
      setLoading(true)
      try {
        // 1. получаем даты (первые 50)
        const dates: bigint[] = await readContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getDates",
          args: [address, BigInt(0), BigInt(50)], // startIndex=0, count=50
        }) as bigint[]

        // 2. грузим записи для каждой даты
        const results: Entry[] = []
        for (const d of dates) {
          const e = await readContract({
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEntry",
            args: [address, d],
          }) as Entry
          if (e.exists) results.push(e)
        }

        setEntries(results)
      } catch (err) {
        console.error("Ошибка загрузки записей:", err)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [address, isConnected])

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Мои записи</h1>
      <p>Адрес: {address}</p>

      {loading && <p>Загрузка...</p>}
      {!loading && entries.length === 0 && <p>Нет записей</p>}

      <ul>
        {entries.map((e, i) => (
          <li key={i} style={{ marginBottom: 12, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            📅 {e.date.toString()} — ⚖️ {Number(e.weightGrams) / 1000} кг  
            <br />🔥 In: {e.caloriesIn.toString()} / Out: {e.caloriesOut.toString()}  
            <br />👣 {e.steps.toString()} шагов
          </li>
        ))}
      </ul>
    </main>
  )
}
