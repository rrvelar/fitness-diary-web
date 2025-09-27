// pages/diary.tsx (DEBUG edition)
import { useAccount, useWriteContract, useReadContract, useBlockNumber } from 'wagmi'
import { useEffect, useState } from 'react'
import { encodeFunctionData, isAddress } from 'viem'

/** ВСТРОЕННЫЙ ABI — чтобы исключить любые старые/кешированные импорты */
const diaryAbi = [
  {
    "inputs":[
      {"internalType":"uint256","name":"_weight","type":"uint256"},
      {"internalType":"uint256","name":"_caloriesIn","type":"uint256"},
      {"internalType":"uint256","name":"_caloriesOut","type":"uint256"},
      {"internalType":"uint256","name":"_steps","type":"uint256"}
    ],
    "name":"addEntry","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[
      {"internalType":"uint256","name":"index","type":"uint256"},
      {"internalType":"uint256","name":"_weight","type":"uint256"},
      {"internalType":"uint256","name":"_caloriesIn","type":"uint256"},
      {"internalType":"uint256","name":"_caloriesOut","type":"uint256"},
      {"internalType":"uint256","name":"_steps","type":"uint256"}
    ],
    "name":"updateEntry","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"user","type":"address"}],
    "name":"getEntries",
    "outputs":[{"components":[
      {"internalType":"uint256","name":"date","type":"uint256"},
      {"internalType":"uint256","name":"weight","type":"uint256"},
      {"internalType":"uint256","name":"caloriesIn","type":"uint256"},
      {"internalType":"uint256","name":"caloriesOut","type":"uint256"},
      {"internalType":"uint256","name":"steps","type":"uint256"}
    ],"internalType":"struct FitnessDiary.Entry[]","name":"","type":"tuple[]"}],
    "stateMutability":"view","type":"function"
  }
] as const

export default function DiaryPage() {
  const { address, isConnected } = useAccount()
  const [weight, setWeight] = useState('')
  const [calIn, setCalIn] = useState('')
  const [calOut, setCalOut] = useState('')
  const [steps, setSteps] = useState('')

  const contractAddress = process.env.NEXT_PUBLIC_DIARY_ADDRESS as `0x${string}`

  const { writeContractAsync } = useWriteContract()
  const { data, refetch } = useReadContract({
  address: contractAddress,
  abi: diaryAbi,
  functionName: 'getEntries',
  args: address ? [address] : undefined,
  query: {
    enabled: Boolean(address),
  }
})

  const entries = (data as any[]) || []
  const { data: block } = useBlockNumber({ watch: true })

  useEffect(() => { refetch() }, [block, refetch])

  const addEntry = async () => {
    try {
      console.log('[DEBUG] CLICK addEntry')
      if (!isConnected) return alert('Подключи кошелёк')

      if (!contractAddress || !isAddress(contractAddress)) {
        alert('NEXT_PUBLIC_DIARY_ADDRESS пустой или неверный')
        console.error('[DEBUG] Bad address:', contractAddress)
        return
      }

      const w = Number(weight)
      const ci = Number(calIn)
      const co = Number(calOut)
      const st = Number(steps)

      console.log('[DEBUG] Args:', { w, ci, co, st })

      // Критично: попытка закодировать данные локально.
      // Если здесь вылетит "AbiFunctionNotFoundError('logEntry')",
      // значит где-то тянется не тот ABI/бандл.
      const calldata = encodeFunctionData({
        abi: diaryAbi,
        functionName: 'addEntry',
        args: [w, ci, co, st],
      })
      console.log('[DEBUG] Encoded calldata length:', calldata.length)

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: diaryAbi,
        functionName: 'addEntry',
        args: [w, ci, co, st],
      })
      console.log('[DEBUG] Sent tx:', txHash)
      alert('Транзакция отправлена: ' + txHash)
    } catch (e: any) {
      console.error('[DEBUG] addEntry error:', e)
      alert('Ошибка: ' + (e?.message || e))
    }
  }

  return (
    <div className="p-10 font-sans max-w-3xl mx-auto">
      <div className="text-xs opacity-60 mb-2">build: diary-debug-v1</div>
      <h1 className="text-3xl font-bold mb-6">📓 Fitness Diary</h1>

      <div className="text-sm mb-4">
        <div><b>isConnected:</b> {String(isConnected)}</div>
        <div><b>account:</b> {address || '—'}</div>
        <div><b>contract:</b> {contractAddress || '—'}</div>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <input className="border p-2 w-full rounded" placeholder="Вес (кг)" value={weight} onChange={e => setWeight(e.target.value)} />
          <input className="border p-2 w-full rounded" placeholder="Калории потреблено" value={calIn} onChange={e => setCalIn(e.target.value)} />
          <input className="border p-2 w-full rounded" placeholder="Калории сожжено" value={calOut} onChange={e => setCalOut(e.target.value)} />
          <input className="border p-2 w-full rounded" placeholder="Шаги" value={steps} onChange={e => setSteps(e.target.value)} />

          <button type="button" onClick={addEntry} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
            Добавить запись
          </button>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Мои записи</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Дата</th>
                <th className="border p-2">Вес (кг)</th>
                <th className="border p-2">Калории (in/out)</th>
                <th className="border p-2">Шаги</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e: any, i: number) => (
                <tr key={i}>
                  <td className="border p-2">{new Date(Number(e.date) * 1000).toLocaleDateString()}</td>
                  <td className="border p-2">{e.weight}</td>
                  <td className="border p-2">{e.caloriesIn}/{e.caloriesOut}</td>
                  <td className="border p-2">{e.steps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Подключи кошелёк</p>
      )}
    </div>
  )
}
