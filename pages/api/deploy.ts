import type { NextApiRequest, NextApiResponse } from 'next'
import { createWalletClient, createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import fs from 'fs'
import path from 'path'
// @ts-ignore - solc has no types here
import solc from 'solc'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const network = (req.query.network as string) || 'base-sepolia'
  const pk = process.env.DEPLOYER_PRIVATE_KEY
  if (!pk) return res.status(400).json({ error: 'DEPLOYER_PRIVATE_KEY not set' })

  const sourcePath = path.join(process.cwd(), 'contracts', 'FitnessDiary.sol')
  const source = fs.readFileSync(sourcePath, 'utf8')

  const input = {
    language: 'Solidity',
    sources: { 'FitnessDiary.sol': { content: source } },
    settings: { outputSelection: { '*': { '*': ['abi','evm.bytecode'] } } },
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input)))
  const contract = output.contracts['FitnessDiary.sol']['FitnessDiary']
  const abi = contract.abi
  const bytecode = '0x' + contract.evm.bytecode.object

  const chain = network === 'base' ? base : baseSepolia
  const rpcUrl = network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org'

  const account = privateKeyToAccount(pk as `0x${string}`)
  const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) })
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) })

  try {
    const hash = await walletClient.deployContract({
  abi,
  bytecode: bytecode as `0x${string}`,
  args: [], // обязательно добавляем пустой массив, если у конструктора нет аргументов
})
    const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` })
    return res.status(200).json({
      address: receipt.contractAddress,
      hash,
      chainId: chain.id,
    })
  } catch (e:any) {
    console.error(e)
    return res.status(500).json({ error: e?.message || 'Deploy failed' })
  }
}
