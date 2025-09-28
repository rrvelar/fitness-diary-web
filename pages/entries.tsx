import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddressJson from "../abi/FitnessDiary.address.json" assert { type: "json" }

const CONTRACT_ADDRESS = contractAddressJson.address as `0x${string}`

export default function EntriesPage() {
  const { address, isConnected } = useAccount()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) return

    async function loadEntries() {
      try {
        setLoading(true)

        // 1. Получаем даты (берём первые 50 для примера)
        const dates = (await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getDates",
          args: [address, BigInt(0), BigInt(50)],
        })) as bigint[]

        // 2. Получаем по каждой дате полную запись
        const fetched: any[] = []
        for (const d of dates) {
          const entry = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEntry",
            args: [address, Number(d)],
          })
          fetched.push(entry)
        }

        setEntries(fetched)
      } catch (err) {
        console.error("Ошибка при загрузке записей:", err)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [isConnected, address])

  return (
    <div>
      <h1>Мои записи</h1>
      {loading && <p>Загрузка...</p>}
      {!loading && entries.length === 0 && <p>Нет записей</p>}
      <ul>
        {entries.map((e, i) => (
          <li key={i}>
            📅 {e.date.toString()} — Вес: {Number(e.weightGrams) / 1000} кг, 
            Калории: {e.caloriesIn} / {e.caloriesOut}, 
            Шаги: {e.steps}
          </li>
        ))}
      </ul>
    </div>
  )
}
