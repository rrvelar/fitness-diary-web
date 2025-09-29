import { useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { config } from "../lib/wagmi"

const CONTRACT_ADDRESS = contractAddress.address as unknown as `0x${string}`

export default function LogPage() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract({ config })

  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [caloriesIn, setCaloriesIn] = useState("")
  const [caloriesOut, setCaloriesOut] = useState("")
  const [steps, setSteps] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      alert("Сначала подключите кошелёк")
      return
    }

    setLoading(true)
    try {
      const ymd = date.replaceAll("-", "")
      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "logEntry",
        args: [
          Number(ymd),
          Math.round(Number(weight) * 1000),
          Number(caloriesIn),
          Number(caloriesOut),
          Number(steps),
        ],
      })

      alert("Запись успешно добавлена!")
      setDate("")
      setWeight("")
      setCaloriesIn("")
      setCaloriesOut("")
      setSteps("")
    } catch (err) {
      console.error("Ошибка при добавлении записи:", err)
      alert("Не удалось добавить запись")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-lg shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-emerald-700 text-center">Новая запись</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Дата", type: "date", value: date, set: setDate },
              { label: "Вес (кг)", type: "number", value: weight, set: setWeight },
              { label: "Калории (вход)", type: "number", value: caloriesIn, set: setCaloriesIn },
              { label: "Калории (расход)", type: "number", value: caloriesOut, set: setCaloriesOut },
              { label: "Шаги", type: "number", value: steps, set: setSteps },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            ))}

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
              {loading ? "Сохраняю..." : "Добавить запись"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
