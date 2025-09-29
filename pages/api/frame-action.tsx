// pages/api/frame-action.tsx
/* eslint-disable react/jsx-key */
import React from "react"
import { createFrames, Button } from "frames.js/next/pages-router/server"

const frames = createFrames({
  basePath: "/api/frame-action",
})

const handleRequest = frames(async (ctx: any) => {
  const action = ctx.searchParams?.action ?? ""

  if (action === "entries") {
    return {
      image: (
        <div style={{ fontSize: 28, color: "black", padding: 40 }}>
          Последние записи:
          <br />• 80.0 кг — 2500/3000 кал, 12000 шагов
          <br />• 79.5 кг — 2400/3100 кал, 11000 шагов
        </div>
      ),
      buttons: [
        <Button action="post" target="/api/frame-action">🔙 Назад</Button>,
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
        <Button action="post" target="/api/frame-action?action=save">✅ Сохранить</Button>,
      ],
    }
  }

  if (action === "save") {
    const input = ctx.message?.inputText || ""
    const parts = input.split(",").map((p: string) => p.trim())

    if (parts.length < 5) {
      return {
        image: (
          <div style={{ fontSize: 28, color: "red", padding: 40 }}>
            ❌ Недостаточно данных
          </div>
        ),
        buttons: [
          <Button action="post" target="/api/frame-action">🔙 Назад</Button>,
        ],
      }
    }

    const [dateStr, weightStr, calInStr, calOutStr, stepsStr] = parts
    const url = `https://fitness-diary-web.vercel.app/frame?date=${dateStr}&weight=${weightStr}&calIn=${calInStr}&calOut=${calOutStr}&steps=${stepsStr}`

    return {
      image: (
        <div style={{ fontSize: 28, color: "green", padding: 40 }}>
          ✅ Данные получены!
          <br />
          Вес: {weightStr} кг
          <br />
          Калории: {calInStr}/{calOutStr}
          <br />
          Шаги: {stepsStr}
          <br />
          Теперь подпишите транзакцию
        </div>
      ),
      buttons: [
        <Button action="link" target={url}>🔗 Подписать во встроенном кошельке</Button>,
      ],
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
      <Button action="post" target="/api/frame-action?action=entries">📖 Мои записи</Button>,
      <Button action="post" target="/api/frame-action?action=log">➕ Добавить</Button>,
    ],
  }
})

export default handleRequest
