import { useState } from "react"
import { ethers } from "ethers"

// ABI и адрес контракта
import abi from "../abi/FitnessDiary.json"
import contractAddress from "../abi/FitnessDiary.address.json"

export default function TestPage() {
  const [status, setStatus] = useState("")

  async function handleLogEntry() {
    try {
      if (!window.ethereum) {
        setStatus("❌ Установи MetaMask")
        return
      }

      // Подключаемся к Metamask
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Создаём объект контракта
      const contract = new ethers.Contract(contractAddress.address, abi, signer)

      setStatus("📤 Отправляем транзакцию...")

      // Вызов функции logEntry с тестовыми данными
      const tx = await contract.logEntry(
        20250928, // date (YYYYMMDD)
        88000,    // weightGrams
        2500,     // caloriesIn
        3000,     // caloriesOut
        20000     // steps
      )

      setStatus("⏳ Ждём подтверждения...")

      await tx.wait()

      setStatus("✅ Запись успешно добавлена в контракт!")
    } catch (err: any) {
      console.error(err)
      setStatus("❌ Ошибка: " + (err.message || "см. консоль"))
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Тест взаимодействия с контрактом</h1>
      <button
        onClick={handleLogEntry}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          cursor: "pointer"
        }}
      >
        Добавить тестовую запись
      </button>
      <p>{status}</p>
    </div>
  )
}
