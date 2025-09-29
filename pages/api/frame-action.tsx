// pages/api/frame-action.tsx
import React from "react"
import { createFrames, Button } from "frames.js/next"

const frames = createFrames({
  // ставим реальный путь этого API-роута
  basePath: "/api/frame-action",
})

export default frames((ctx) => {
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
          Введите вес (кг), калории и шаги
        </div>
      ),
      textInput: "Например: 79.3, 2500, 3000, 12000",
      buttons: [
        <Button action="post" target="/api/frame-action?action=save">✅ Сохранить</Button>,
      ],
    }
  }

  if (action === "save") {
    // здесь позже подключим реальную запись в контракт
    return {
      image: (
        <div style={{ fontSize: 28, color: "green", padding: 40 }}>
          Запись сохранена ✅
        </div>
      ),
      buttons: [
        <Button action="post" target="/api/frame-action">🔙 Назад</Button>,
      ],
    }
  }

  // fallback — всегда возвращаем объект
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
