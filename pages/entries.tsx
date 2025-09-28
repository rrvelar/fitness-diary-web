import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import rawAddress from "../abi/FitnessDiary.address.json" assert { type: "json" }

// Универсальная обёртка: строка или { address }
const CONTRACT_ADDRESS = (
  typeof rawAddress === "string" ? rawAddress : rawAddress.address
) as `0x${string}`

type Entry = {
  date: bigint
  weightGrams: bigint
  caloriesIn: bigint
  caloriesOut: bigint
  steps: bigint
  netCalories: bigint
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
        // ⚡️ читаем getEntries(user, offset, limit)
        const result = await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getEntries",
          args: [address, BigInt(0), BigInt(50)], // offset=0, limit=50
        })

        setEntries(result as Entry[])
      } catch (err) {
        console.error("Ошибка при загрузке записей:", err)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [isConnected, address])

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Мои записи</h1>

      {!isConnected && <p>Подключите кошелёк</p>}
      {loading && <p>Загрузка...</p>}

      {entries.length === 0 && !loading && <p>Нет записей</p>}

      <ul style={{ marginTop: 20 }}>
        {entries.map((e, idx) => (
          <li key={idx} style={{ marginBottom: 10 }}>
            <b>{e.date.toString()}</b> — вес: {(Number(e.weightGrams) / 1000).toFixed(1)} кг,  
            калории: {e.caloriesIn.toString()} in / {e.caloriesOut.toString()} out,  
            шаги: {e.steps.toString()},  
            баланс: {e.netCalories.toString()}
          </li>
        ))}
      </ul>
    </main>
  )
}
