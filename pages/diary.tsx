import { useAccount, useWriteContract, useReadContract, useBlockNumber } from 'wagmi'
import { useEffect, useState } from 'react'
import abi from '../abi/FitnessDiary.json'

export default function DiaryPage() {
  const { address, isConnected } = useAccount()
  const [weight, setWeight] = useState('')
  const [calIn, setCalIn] = useState('')
  const [calOut, setCalOut] = useState('')
  const [steps, setSteps] = useState('')

  const { writeContractAsync } = useWriteContract()
  const { data, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_DIARY_ADDRESS as `0x${string}`,
    abi,
    functionName: 'getEntries',
    args: [address],
  })

  const entries = (data as any[]) || []

  const { data: block } = useBlockNumber({ watch: true })

  useEffect(() => {
    refetch()
  }, [block, refetch])

  const addEntry = async () => {
    if (!isConnected) return alert('Подключи кошелёк')

    await writeContractAsync({
      address: process.env.NEXT_PUBLIC_DIARY_ADDRESS as `0x${string}`,
      abi,
      functionName: 'addEntry', // ✅ тут вызываем addEntry
      args: [Number(weight), Number(calIn), Number(calOut), Number(steps)]
    })
  }

  return (
    <div className="p-10 font-sans max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📓 Fitness Diary</h1>

      {isConnected ? (
        <div className="space-y-4">
          <input className="border p-2 w-full rounded" placeholder="Вес (кг)" value={weight} onChange={e => setWeight(e.target.value)} />
          <input className="border p-2 w-full rounded" placeholder="Калории потреблено" value={calIn} onChange={e => setCalIn(e.target.value)} />
          <input className="border p-2 w-full rounded" placeholder="Калории сожжено" value={calOut} onChange={e => setCalOut(e.target.value)} />
          <input className="border p-2 w-full rounded" placeholder="Шаги" value={steps} onChange={e => setSteps(e.target.value)} />

          <button onClick={addEntry} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
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
