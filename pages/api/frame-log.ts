import type { NextApiRequest, NextApiResponse } from "next"
import { writeContract } from "@wagmi/core"
import { config } from "../../lib/wagmi"
import abi from "../../abi/FitnessDiary.json"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { untrustedData } = req.body
    const input = untrustedData?.inputText as string

    if (!input) {
      return res.status(400).json({ error: "Нет данных" })
    }

    // формат: 20250929,75.5,2000,1800,8000
    const [dateStr, weightStr, caloriesIn, caloriesOut, steps] = input.split(",")
    const date = Number(dateStr)
    const weightGrams = Math.round(Number(weightStr) * 1000)

    await writeContract(config, {
      abi,
      address: CONTRACT_ADDRESS,
      functionName: "logEntry",
      args: [
        date,
        weightGrams,
        Number(caloriesIn),
        Number(caloriesOut),
        Number(steps),
      ],
    })

    // ответ Frame
    res.setHeader("Content-Type", "text/html")
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="Запись добавлена!" />
          <meta property="og:description" content="✅ Успешно сохранено в Fitness Diary" />
          <meta property="og:image" content="https://your-app.vercel.app/success.png" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:button:1" content="📖 Открыть дневник" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="https://your-app.vercel.app/entries" />
        </head>
        <body>✅ Запись добавлена</body>
      </html>
    `)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Ошибка при записи" })
  }
}
