import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddressJson from "../abi/FitnessDiary.address.json" assert { type: "json" }

const CONTRACT_ADDRESS = contractAddressJson.address as `0x${string}`

type Entry = {
  date: string
  weight: number
  in: number
  out: number
  steps: number
}

export default function EntriesPage() {
  const { address, isConnected } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) return

    async function loadEntries() {
      try {
        setLoading(true)

        let dates: bigint[] = []
        try {
          // пробуем взять до 50 записей
          dates = (await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getDates",
            args: [address, BigInt(0), BigInt(50)],
          })) as bigint[]
        } catch (err: any) {
          console.warn("⚠ getDates(50) не сработал, пробуем меньше:", err)
          try {
            dates = (await readContract(config, {
              address: CONTRACT_ADDRESS,
              abi,
              functionName: "getDates",
              args: [address, BigInt(0), BigInt(10)],
            })) as bigint[]
          } catch {
            dates = []
          }
        }

        const items: Entry[] = []
        for (const d of dates) {
          const entry: any = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEntry",
            args: [address, Number(d)],
          })
          if (entry.exists) {
            items.push({
              date: new Date(Number(entry.date) * 1000)
                .toISOString()
                .split("T")[0],
              weight: Number(entry.weightGrams) / 1000,
              in: Number(entry.caloriesIn),
              out: Number(entry.caloriesOut),
              steps: Number(entry.steps),
            })
          }
        }

        setEntries(items.reverse())
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
        {entries.map((e, idx) => (
          <li key={idx}>
            {e.date} → вес: {e.weight} кг, калории: +{e.in} / -{e.out}, шаги:{" "}
            {e.steps}
          </li>
        ))}
      </ul>
    </div>
  )
}
