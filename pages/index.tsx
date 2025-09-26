import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import diaryAbi from '../abi/FitnessDiary.json'

const DIARY = process.env.NEXT_PUBLIC_DIARY_ADDRESS as `0x${string}` | undefined

function yyyymmdd(date: Date) {
  const y = date.getUTCFullYear()
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const d = date.getUTCDate().toString().padStart(2, '0')
  return Number(`${y}${m}${d}`)
}

export default function Home() {
  const { address } = useAccount()
  const [date, setDate] = useState(new Date())
  const [weightKg, setWeightKg] = useState('')
  const [calIn, setCalIn] = useState('')
  const [calOut, setCalOut] = useState('')
  const [steps, setSteps] = useState('')
  const { writeContractAsync } = useWriteContract()

  const { data: dates } = useReadContract({
    address: DIARY,
    abi: diaryAbi as any,
    functionName: 'getDates',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address && !!DIARY },
  }) as { data: number[] | undefined }

  const onLog = async () => {
    if (!DIARY) return alert('Сначала разверните контракт на странице /deploy и укажите адрес в Vercel ENV')
    if (!weightKg || !calIn || !calOut || !steps) return alert('Заполните все поля')
    const d = yyyymmdd(date)
    const weightGrams = Math.round(parseFloat(weightKg) * 1000)
    await writeContractAsync({
      address: DIARY,
      abi: diaryAbi as any,
      functionName: 'logEntry',
      args: [d, weightGrams, parseInt(calIn), parseInt(calOut), parseInt(steps)],
    })
    alert('Запись добавлена! Обновите страницу, чтобы увидеть её в таблице.')
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Fitness Diary (Base)</h1>
        <ConnectButton />
      </header>

      {!DIARY && (
        <div style={{padding:12, border:'1px solid #ccc', borderRadius:8, marginTop:12}}>
          <b>Шаг 1:</b> Откройте <code>/deploy</code>, нажмите «Развернуть контракт».<br/>
          <b>Шаг 2:</b> Скопируйте адрес контракта и добавьте его в Vercel как <code>NEXT_PUBLIC_DIARY_ADDRESS</code>, затем redeploy.
        </div>
      )}

      <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label>
          Дата:&nbsp;
          <input type="date" value={date.toISOString().slice(0,10)} onChange={e=>setDate(new Date(e.target.value+'T00:00:00Z'))} />
        </label>
        <label>
          Вес (кг):&nbsp;
          <input value={weightKg} onChange={e=>setWeightKg(e.target.value)} placeholder="72.3" />
        </label>
        <label>
          Калории потреблено:&nbsp;
          <input value={calIn} onChange={e=>setCalIn(e.target.value)} placeholder="2000" />
        </label>
        <label>
          Калории сожжено:&nbsp;
          <input value={calOut} onChange={e=>setCalOut(e.target.value)} placeholder="500" />
        </label>
        <label>
          Шаги:&nbsp;
          <input value={steps} onChange={e=>setSteps(e.target.value)} placeholder="8000" />
        </label>
        <button onClick={onLog} style={{padding:'8px 12px'}}>Добавить запись</button>
      </section>

      <hr style={{ margin: '24px 0' }} />

      <h2>Мои даты (для примера)</h2>
      <ul>
        {Array.isArray(dates) && dates.map((d,i)=>(
          <li key={i}>{String(d)}</li>
        ))}
      </ul>
    </main>
  )
}
