import { useState } from "react"
import { useWriteContract } from "wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"

export default function LogEntry() {
  const { writeContractAsync } = useWriteContract()

  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [caloriesIn, setCaloriesIn] = useState("")
  const [caloriesOut, setCaloriesOut] = useState("")
  const [steps, setSteps] = useState("")

  const handleLog = async () => {
    await writeContractAsync({
      abi,
      address: contractAddress as `0x${string}`,
      functionName: "logEntry",
      args: [Number(date), Number(weight), Number(caloriesIn), Number(caloriesOut), Number(steps)],
    })
  }

  const handleUpdate = async () => {
    await writeContractAsync({
      abi,
      address: contractAddress as `0x${string}`,
      functionName: "updateEntry",
      args: [Number(date), Number(weight), Number(caloriesIn), Number(caloriesOut), Number(steps)],
    })
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Log / Update Entry
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Дата (YYYYMMDD)
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Вес (гр)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Калории In
            </label>
            <input
              type="number"
              value={caloriesIn}
              onChange={(e) => setCaloriesIn(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Калории Out
            </label>
            <input
              type="number"
              value={caloriesOut}
              onChange={(e) => setCaloriesOut(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Шаги
            </label>
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={handleLog}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-600 transition"
            >
              Добавить запись
            </button>
            <button
              onClick={handleUpdate}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition"
            >
              Обновить запись
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
