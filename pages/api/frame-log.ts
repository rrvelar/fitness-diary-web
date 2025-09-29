import { NextApiRequest, NextApiResponse } from "next"
import { writeContract } from "@wagmi/core"
import { config } from "../../lib/wagmi"
import abi from "../../abi/FitnessDiary.json"
import contractAddress from "../../abi/FitnessDiary.address.json"

const CONTRACT_ADDRESS = contractAddress.address as unknown as `0x${string}`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const { date, weight, caloriesIn, caloriesOut, steps } = req.body

    if (!date || !weight || !caloriesIn || !caloriesOut || !steps) {
      res.status(400).json({ error: "Missing fields" })
      return
    }

    const ymd = date.toString().replaceAll("-", "")

    // запись в контракт
    await writeContract(config, {
      abi,
      address: CONTRACT_ADDRESS,
      functionName: "logEntry",
      args: [
        Number(ymd),
        Math.round(Number(weight) * 1000),
        Number(caloriesIn),
        Number(caloriesOut),
        Number(steps),
      ],
    })

    res.status(200).send(`
      <html>
        <body style="text-align:center; padding:20px; font-family:sans-serif;">
          <h2>✅ Запись успешно добавлена!</h2>
          <a href="/api/frame">Добавить ещё</a>
        </body>
      </html>
    `)
  } catch (err: any) {
    console.error("Ошибка:", err)
    res.status(500).send(`
      <html>
        <body style="text-align:center; padding:20px; font-family:sans-serif; color:red;">
          <h2>❌ Ошибка при добавлении записи</h2>
          <p>${err.message}</p>
          <a href="/api/frame">Назад</a>
        </body>
      </html>
    `)
  }
}
