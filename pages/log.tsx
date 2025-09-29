import { useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
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
      const ymd = date.replaceAll("-", "") // "2025-09-29" -> "20250929"
      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "logEntry",
        args: [
          Number(ymd),
          Math.round(Number(weight) * 1000), // кг -> граммы
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-lg shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Новая запись</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Дата</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Вес (кг)</label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Калории (вход)</label>
              <Input
                type="number"
                value={caloriesIn}
                onChange={(e) => setCaloriesIn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Калории (расход)</label>
              <Input
                type="number"
                value={caloriesOut}
                onChange={(e) => setCaloriesOut(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Шаги</label>
              <Input
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Сохраняю..." : "Добавить запись"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
