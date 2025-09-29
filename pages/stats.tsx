import { useEffect, useState } from "react"
import { readContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import { config } from "../lib/wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

const CONTRACT_ADDRESS = contractAddress.address as unknown as `0x${string}`

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

export default function StatsPage() {
  const { address } = useAccount()
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    if (!address) return
    fetchEntries()
  }, [address])

  async function safeGetDates(addr: `0x${string}`) {
    let count = 20n
    while (count > 0n) {
      try {
        return await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [addr, 0n, count],
        }) as bigint[]
      } catch (err: any) {
        if (err.message.includes("Out of bounds")) count -= 1n
        else throw err
      }
    }
    return []
  }

  async function fetchEntries() {
    const datesBigInt = await safeGetDates(address as `0x${string}`)
    const dates = datesBigInt.map(d => Number(d))
    const fetched: Entry[] = []
    for (let d of dates) {
      const entry = await readContract(config, {
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getEntry",
        args: [address, BigInt(d)],
      }) as unknown as Entry
      if (entry.exists) {
        fetched.push({
          ...entry,
          date: Number(entry.date),
          weightGrams: Number(entry.weightGrams),
          caloriesIn: Number(entry.caloriesIn),
          caloriesOut: Number(entry.caloriesOut),
          steps: Number(entry.steps),
        })
      }
    }
    setEntries(fetched.reverse())
  }

  function formatDate(num: number) {
    const str = num.toString()
    return `${str.slice(6,8)}/${str.slice(4,6)}`
  }

  const data = entries.map(e => ({
    date: formatDate(e.date),
    weight: e.weightGrams/1000,
    in: e.caloriesIn,
    out: e.caloriesOut,
    steps: e.steps,
  }))

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-emerald-700">Статистика</h1>

      <Card>
        <CardHeader><CardTitle>Вес</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="weight" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Калории</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="in" stroke="#f97316" />
              <Line dataKey="out" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Шаги</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="steps" stroke="#9333ea" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
