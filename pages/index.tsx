import { useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import abi from "../abi/FitnessDiary.json"

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [calIn, setCalIn] = useState("")
  const [calOut, setCalOut] = useState("")
  const [steps, setSteps] = useState("")

  const addEntry = async () => {
    if (!isConnected) {
      alert("Подключи кошелёк")
      return
    }

    try {
      await writeContractAsync({
        address: process.env.NEXT_PUBLIC_DIARY_ADDRESS as `0x${string}`,
        abi,
        functionName: "logEntry",
        args: [
          BigInt(date || "0"),
          BigInt(weight || "0"),
          BigInt(calIn || "0"),
          BigInt(calOut || "0"),
          BigInt(steps || "0"),
        ],
      })
      alert("Запись добавлена!")
    } catch (err) {
      console.error("Ошибка при добавлении записи:", err)
      alert("Ошибка при добавлении записи: " + (err as any).message)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Fitness Diary</h1>

      <input
        placeholder="Дата (YYYYMMDD)"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        placeholder="Вес (г)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <input
        placeholder="Калории потреблено"
        value={calIn}
        onChange={(e) => setCalIn(e.target.value)}
      />
      <input
        placeholder="Калории сожжено"
        value={calOut}
        onChange={(e) => setCalOut(e.target.value)}
      />
      <input
        placeholder="Шаги"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />

      <button onClick={addEntry}>Добавить запись</button>
    </div>
  )
}
