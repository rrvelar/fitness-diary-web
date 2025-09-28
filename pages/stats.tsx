import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import rawAddress from "../abi/FitnessDiary.address.json" assert { type: "json" }
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Адрес контракта
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

export default function StatsPage() {
  const { address, isConnected } = useAccount()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!isConnected || !address) return
      setLoading(true)
      try {
        const result = await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getEntries",
          args: [address, BigInt(0), BigInt(50)],
        })

        const entries = result as Entry[]

        // Преобразуем в формат для recharts
        const chartData = entries.map((e) => ({
          date: e.date.toString(),
          weight: Number(e.weightGrams) / 1000, // кг
          calIn: Number(e.caloriesIn),
          calOut: Number(e.caloriesOut),
          steps: Number(e.steps),
          net: Number(e.netCalories),
        }))

        setData(chartData)
      } catch (err) {
        console.error("Ошибка загрузки данных:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isConnected, address])

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Графики</h1>

      {!isConnected && <p>Подключите кошелёк</p>}
      {loading && <p>Загрузка...</p>}
      {data.length === 0 && !loading && <p>Нет данных для графиков</p>}

      {data.length > 0 && (
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Вес (кг)" />
              <Line type="monotone" dataKey="calIn" stroke="#82ca9d" name="Калории потреблено" />
              <Line type="monotone" dataKey="calOut" stroke="#ff7300" name="Калории сожжено" />
              <Line type="monotone" dataKey="steps" stroke="#387908" name="Шаги" />
              <Line type="monotone" dataKey="net" stroke="#ff0000" name="Баланс калорий" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  )
}
