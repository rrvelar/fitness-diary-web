// pages/api/frame-action.tsx
import { createFrames, Button } from "frames.js/next"

const frames = createFrames({
  basePath: "/api/frame-action",
})

const handler = async (ctx: any) => {
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
        Button({ text: "🔙 Назад", action: "post", target: "/api/frame-action" }),
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
        Button({
          text: "✅ Сохранить",
          action: "post",
          target: "/api/frame-action?action=save",
        }),
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
          Button({ text: "🔙 Назад", action: "post", target: "/api/frame-action" }),
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
        Button({
          text: "🔗 Подписать во встроенном кошельке",
          action: "link",
          target: url,
        }),
      ],
    }
  }

  // fallback — ОБЯЗАТЕЛЕН
  return {
    image: (
      <div style={{ fontSize: 28, color: "black", padding: 40 }}>
        👋 Добро пожаловать в Fitness Diary
      </div>
    ),
    buttons: [
      Button({
        text: "📖 Мои записи",
        action: "post",
        target: "/api/frame-action?action=entries",
      }),
      Button({
        text: "➕ Добавить",
        action: "post",
        target: "/api/frame-action?action=log",
      }),
    ],
  }
}

export default frames(handler)
