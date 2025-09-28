import { useEffect, useState } from "react"
import { useAccount, useConfig } from "wagmi"
import { readContract } from "wagmi/actions"
import abi from "../abi/FitnessDiary.json"
import CONTRACT_ADDRESS from "../abi/FitnessDiary.address.json"

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
  const config = useConfig()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return

    const load = async () => {
      setLoading(true)
      try {
        // 1. получаем список дат (берём первые 50 для примера)
        const dates = (await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi,
          functionName: "getDates",
          args: [address, BigInt(0), BigInt(50)],
        })) as bigint[]

        // 2. получаем каждую запись
        const items: Entry[] = []
        for (const d of dates) {
          const e = (await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi,
            functionName: "getEntry",
            args: [address, d],
          })) as Entry
          if (e.exists) items.push(e)
        }

        setEntries(items)
      } catch (err) {
        console.error("Ошибка загрузки записей:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [address, config])

  return (
    <div style={{ padding: 20 }}>
      <h1>Мои записи</h1>
      {loading && <p>Загрузка...</p>}
      {!loading && entries.length === 0 && <p>Нет записей</p>}
      <ul>
        {entries.map((e) => (
          <li key={e.date.toString()}>
            <b>{e.date.toString()}</b> — Вес: {e.weightGrams.toString()} г,
            Калории: {e.caloriesIn.toString()} / {e.caloriesOut.toString()},
            Шаги: {e.steps.toString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
