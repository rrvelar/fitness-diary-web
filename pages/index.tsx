import { useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import abi from "../abi/FitnessDiary.json"
import Link from "next/link"

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
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Fitness Diary</h1>
      <ul>
        <li><Link href="/log">Добавить / обновить запись</Link></li>
        <li><Link href="/entries">Мои записи</Link></li>
        <li><Link href="/stats">Графики</Link></li>
        <li><Link href="/test">Тестовая страница</Link></li>
      </ul>

      <div style={{ marginTop: 40 }}>
        <h2>Быстрое добавление записи</h2>

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
    </main>
  )
}
