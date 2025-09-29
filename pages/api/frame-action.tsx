// pages/api/frame-action.tsx
import React from "react"
import { createFrames, Button } from "frames.js/next"
import { writeContract } from "@wagmi/core"
import abi from "../../abi/FitnessDiary.json"
import { config } from "../../lib/wagmi"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

const frames = createFrames({
  basePath: "/api/frame-action",
})

export default frames(async (ctx) => {
  const action = ctx.searchParams?.action ?? ""

  if (action === "entries") {
    // 🔹 тут можно подгружать реальные записи, сейчас — заглушка
    return {
      image: (
        <div style={{ fontSize: 28, color: "black", padding: 40 }}>
          Последние записи:
          <br />• 80.0 кг — 2500/3000 кал, 12000 шагов
          <br />• 79.5 кг — 2400/3100 кал, 11000 шагов
        </div>
      ),
      buttons: [
        <Button key="back" action="post" target="/api/frame-action">
          🔙 Назад
        </Button>,
      ],
    }
  }

  if (action === "log") {
    return {
      image: (
        <div style={{ fontSize: 28, color: "blue", padding: 40 }}>
          Введите данные через запятую:
          <br />
          📅 YYYYMMDD, ⚖️ Вес (кг), 🔥 Калории In, 💪 Калории Out, 🚶 Шаги
        </div>
      ),
      textInput: "20250929,79.3,2500,3000,12000",
      buttons: [
        <Button key="save" action="post" target="/api/frame-action?action=save">
          ✅ Сохранить
        </Button>,
      ],
    }
  }

  if (action === "save") {
    try {
      const input = ctx.message?.inputText || "" // строка от пользователя
      const parts = input.split(",").map((p: string) => p.trim()) // <-- ✅ фикс

      if (parts.length < 5) {
        throw new Error("Недостаточно данных")
      }

      const [dateStr, weightStr, calInStr, calOutStr, stepsStr] = parts

      const ymd = Number(dateStr)
      const weight = Math.round(Number(weightStr) * 1000) // кг → граммы
      const caloriesIn = Number(calInStr)
      const caloriesOut = Number(calOutStr)
      const steps = Number(stepsStr)

      // Запись в контракт
      await writeContract(config, {
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "logEntry",
        args: [ymd, weight, caloriesIn, caloriesOut, steps],
      })

      return {
        image: (
          <div style={{ fontSize: 28, color: "green", padding: 40 }}>
            ✅ Запись сохранена!
            <br />
            Вес: {weightStr} кг
            <br />
            Калории: {calInStr}/{calOutStr}
            <br />
            Шаги: {stepsStr}
          </div>
        ),
        buttons: [
          <Button key="back2" action="post" target="/api/frame-action">
            🔙 Назад
          </Button>,
        ],
      }
    } catch (err: any) {
      console.error("Ошибка сохранения:", err)
      return {
        image: (
          <div style={{ fontSize: 28, color: "red", padding: 40 }}>
            ❌ Ошибка: {err.message}
          </div>
        ),
        buttons: [
          <Button key="back3" action="post" target="/api/frame-action">
            🔙 Назад
          </Button>,
        ],
      }
    }
  }

  // fallback
  return {
    image: (
      <div style={{ fontSize: 28, color: "black", padding: 40 }}>
        👋 Добро пожаловать в Fitness Diary
      </div>
    ),
    buttons: [
      <Button key="entries" action="post" target="/api/frame-action?action=entries">
        📖 Мои записи
      </Button>,
      <Button key="log" action="post" target="/api/frame-action?action=log">
        ➕ Добавить
      </Button>,
    ],
  }
})
