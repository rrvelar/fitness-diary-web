import { useState } from "react"
import { useWriteContract } from "wagmi"
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"

// ✅ Универсальный фикс адреса: поддерживает и строку, и { address: "0x..." }
const CONTRACT_ADDRESS = (
  (contractAddress as any)?.address || (contractAddress as any)
) as `0x${string}`

export default function LogEntry() {
  const { writeContractAsync } = useWriteContract()

  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [caloriesIn, setCaloriesIn] = useState("")
  const [caloriesOut, setCaloriesOut] = useState("")
  const [steps, setSteps] = useState("")
  const [busy, setBusy] = useState(false)

  const handle = async (fn: "logEntry" | "updateEntry") => {
    if (!date) return
    setBusy(true)
    try {
      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,             // ✅ используем универсальный адрес
        functionName: fn,
        args: [
          Number(date),
          Number(weight),
          Number(caloriesIn),
          Number(caloriesOut),
          Number(steps),
        ],
      })
      // простая очистка (по желанию)
      // setWeight(""); setCaloriesIn(""); setCaloriesOut(""); setSteps("");
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
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
              inputMode="numeric"
              placeholder="20250101"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Вес (в граммах)
            </label>
            <input
              type="number"
              placeholder="80000"
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
              placeholder="2500"
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
              placeholder="3000"
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
              placeholder="12000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => handle("logEntry")}
              disabled={busy}
              className="bg-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:bg-emerald-700 disabled:bg-gray-400 transition"
            >
              {busy ? "Подтвердите в кошельке…" : "Добавить запись"}
            </button>
            <button
              onClick={() => handle("updateEntry")}
              disabled={busy}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-300 transition"
            >
              Обновить запись
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
