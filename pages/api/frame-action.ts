import { createFrames } from "frames.js/next"
import type { FrameHandler } from "frames.js"

const frames = createFrames({
  basePath: "/api/frame",
})

// ✅ Явно указываем тип handler'а
const handler: FrameHandler = async (ctx) => {
  const action = ctx.searchParams.action

  if (action === "entries") {
    return {
      image: (
        <div style={{ fontSize: 28, color: "black", padding: 40 }}>
          Последние записи:
          <br />• 80.0 кг — 2500/3000 кал, 12000 шагов
          <br />• 79.5 кг — 2400/3100 кал, 11000 шагов
        </div>
      ),
      buttons: [{ label: "🔙 Назад", action: "post", target: "/api/frame" }],
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
      buttons: [{ label: "✅ Сохранить", action: "post", target: "/api/frame?action=save" }],
    }
  }

  if (action === "save") {
    return {
      image: (
        <div style={{ fontSize: 28, color: "green", padding: 40 }}>
          Запись сохранена ✅
        </div>
      ),
      buttons: [{ label: "🔙 Назад", action: "post", target: "/api/frame" }],
    }
  }

  // 🔹 Всегда есть fallback (главное меню)
  return {
    image: (
      <div style={{ fontSize: 28, color: "black", padding: 40 }}>
        👋 Добро пожаловать в Fitness Diary
      </div>
    ),
    buttons: [
      { label: "📖 Мои записи", action: "post", target: "/api/frame?action=entries" },
      { label: "➕ Добавить", action: "post", target: "/api/frame?action=log" },
    ],
  }
}

export default frames(handler)
