import { useEffect, useState } from "react"
import { useAccount } from "../lib/wagmi"
import { readContract } from "../lib/wagmi/actions"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import CONTRACT from "../abi/FitnessDiary.address.json" assert { type: "json" }

// если JSON в формате { "address": "0x..." }
const CONTRACT_ADDRESS = (CONTRACT as { address: string }).address as `0x${string}`

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    const load = async () => {
      setLoading(true)
      try {
        // 1. получаем даты
        const dates: bigint[] = await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getDates",
          args: [address],
        }) as bigint[]

        // ограничим 50, если много
        const sliced = dates.slice(0, 50)

        // 2. получаем каждую запись
        const items: Entry[] = []
        for (const d of sliced) {
          const entry = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEntry",
            args: [address, d],
          }) as Entry
          if (entry.exists) items.push(entry)
        }
        setEntries(items)
      } catch (err) {
        console.error("Ошибка загрузки:", err)
      }
      setLoading(false)
    }
    load()
  }, [address])

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Мои записи</h1>
      {loading && <p>Загрузка...</p>}
      {!loading && entries.length === 0 && <p>Нет записей</p>}
      <ul>
        {entries.map((e) => (
          <li key={e.date.toString()}>
            <b>{e.date.toString()}</b> — вес {Number(e.weightGrams) / 1000} кг,  
            калории: +{e.caloriesIn.toString()} / -{e.caloriesOut.toString()},  
            шаги: {e.steps.toString()}
          </li>
        ))}
      </ul>
    </main>
  )
}
