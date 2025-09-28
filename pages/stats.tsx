import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddressJson from "../abi/FitnessDiary.address.json" assert { type: "json" }
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

const CONTRACT_ADDRESS = contractAddressJson.address as `0x${string}`

type Point = {
  date: string
  weight: number
  in: number
  out: number
  steps: number
}

export default function StatsPage() {
  const { address, isConnected } = useAccount()
  const [data, setData] = useState<Point[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) return

    async function loadStats() {
      try {
        setLoading(true)

        // 1. Получаем даты (например, первые 30)
        const dates = (await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getDates",
          args: [address, BigInt(0), BigInt(30)],
        })) as bigint[]

        // 2. Получаем по каждой дате полную запись
        const points: Point[] = []
        for (const d of dates) {
          const entry: any = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEntry",
            args: [address, Number(d)],
          })
          if (entry.exists) {
            points.push({
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

        setData(points.reverse()) // последние даты внизу → наверх
      } catch (err) {
        console.error("Ошибка при загрузке статистики:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [isConnected, address])

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h1>📊 Статистика</h1>
      {loading && <p>Загрузка...</p>}
      {!loading && data.length === 0 && <p>Нет данных</p>}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" />
            <Line type="monotone" dataKey="in" stroke="#82ca9d" />
            <Line type="monotone" dataKey="out" stroke="#ff7300" />
            <Line type="monotone" dataKey="steps" stroke="#387908" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
