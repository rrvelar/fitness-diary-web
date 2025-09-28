import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "../lib/wagmi"

import abi from "../abi/FitnessDiary.json"
import contractAddressJson from "../abi/FitnessDiary.address.json" assert { type: "json" }
const CONTRACT_ADDRESS = contractAddressJson.address as `0x${string}`

type Entry = {
  date: bigint
  weight: bigint
  note: string
}

export default function EntriesPage() {
  const { address, isConnected } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadEntries = async () => {
      if (!isConnected || !address) return
      setLoading(true)

      try {
        // 1. получаем список дат
        const dates: bigint[] = await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getDates",
          args: [address],
        })

        // 2. для каждой даты получаем запись
        const results: Entry[] = []
        for (const date of dates) {
          const entry = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEntry",
            args: [address, date],
          })
          results.push({
            date,
            weight: entry[0],
            note: entry[1],
          })
        }

        setEntries(results)
      } catch (err) {
        console.error("Ошибка при загрузке записей:", err)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [address, isConnected])

  return (
    <div style={{ padding: 20 }}>
      <h1>Мои записи</h1>
      {loading && <p>Загрузка...</p>}
      {!loading && entries.length === 0 && <p>Нет записей</p>}
      <ul>
        {entries.map((e) => (
          <li key={e.date.toString()}>
            <strong>{new Date(Number(e.date) * 1000).toLocaleDateString()}</strong> —{" "}
            {e.weight.toString()} кг, заметка: {e.note}
          </li>
        ))}
      </ul>
    </div>
  )
}
