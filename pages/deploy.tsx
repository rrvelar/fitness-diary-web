import { useState } from 'react'

export default function DeployPage() {
  const [network, setNetwork] = useState<'base-sepolia' | 'base'>('base-sepolia')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const deploy = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`/api/deploy?network=${network}`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Deploy failed')
      setResult(json)
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', padding: 16 }}>
      <h1>Развёртывание смарт‑контракта</h1>
      <p>Этот способ использует сервер Vercel и приватный ключ из переменной окружения <code>DEPLOYER_PRIVATE_KEY</code>. Используйте новый «burner»‑кошелёк.</p>
      <label>
        Сеть:&nbsp;
        <select value={network} onChange={e=>setNetwork(e.target.value as any)}>
          <option value="base-sepolia">Base Sepolia (тестовая)</option>
          <option value="base">Base Mainnet (боевая)</option>
        </select>
      </label>
      <div style={{marginTop:12}}>
        <button onClick={deploy} disabled={loading} style={{padding:'8px 12px'}}>
          {loading ? 'Деплой...' : 'Развернуть контракт'}
        </button>
      </div>
      {error && <p style={{color:'red'}}>Ошибка: {error}</p>}
      {result && (
        <div style={{marginTop:16, padding:12, border:'1px solid #ccc', borderRadius:8}}>
          <div><b>Адрес контракта:</b> {result.address}</div>
          <div><b>Tx Hash:</b> {result.hash}</div>
          <div><b>ChainId:</b> {result.chainId}</div>
          <p>Скопируйте адрес в переменную <code>NEXT_PUBLIC_DIARY_ADDRESS</code> на Vercel и сделайте Redeploy.</p>
        </div>
      )}
    </main>
  )
}
