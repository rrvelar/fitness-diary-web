import { NextApiRequest, NextApiResponse } from "next"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"
import abi from "../../abi/FitnessDiary.json"
import contractAddress from "../../abi/FitnessDiary.address.json"

const CONTRACT_ADDRESS = contractAddress.address as `0x${string}`

// ⚠️ Секретный ключ сервисного аккаунта (лучше в .env)
const PRIVATE_KEY = process.env.FRAME_PRIVATE_KEY as `0x${string}`

const account = privateKeyToAccount(PRIVATE_KEY)
const client = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_URL), // твой Alchemy endpoint
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed")

  try {
    const { date, weight, caloriesIn, caloriesOut, steps } = req.body

    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "logEntry",
      args: [
        Number(date),               // 20250929
        Math.round(Number(weight) * 1000), 
        Number(caloriesIn),
        Number(caloriesOut),
        Number(steps),
      ],
    })

    return res.status(200).json({ success: true, txHash })
  } catch (err: any) {
    console.error("Frame API error:", err)
    return res.status(500).json({ success: false, error: err.message })
  }
}
