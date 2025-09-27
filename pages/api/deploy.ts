// pages/api/deploy.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createWalletClient, http, publicActions, Hex } from 'viem'
import { baseSepolia, base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

import abi from "../../abi/FitnessDiary.json"
import bytecodeJson from "../../abi/FitnessDiary.bytecode.json"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const pk = process.env.DEPLOYER_PRIVATE_KEY as Hex | undefined
    if (!pk) {
      return res.status(400).json({ error: 'DEPLOYER_PRIVATE_KEY не задан' })
    }

    const account = privateKeyToAccount(pk as `0x${string}`)
    const chain = req.query.chain === 'base' ? base : baseSepolia

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    }).extend(publicActions)

    // ✅ Правильно: берём именно bytecodeJson.bytecode
    const hash = await walletClient.deployContract({
      abi,
      bytecode: bytecodeJson.bytecode as `0x${string}`,
      args: [],
    })

    const receipt = await walletClient.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
    })

    return res.status(200).json({
      address: receipt.contractAddress,
      txHash: hash,
    })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Ошибка при деплое' })
  }
}
