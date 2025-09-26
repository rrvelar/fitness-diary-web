import { useState } from 'react'

export default function DeployPage() {
  const [loading, setLoading] = useState(false)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    try {
      setLoading(true)
      setError(null)
      setContractAddress(null)
      setTxHash(null)

      const res = await fetch('/api/deploy', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setContractAddress(data.address)
        setTxHash(data.txHash)
      } else {
        setError(data.error || 'Ошибка при деплое')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Деплой Fitness Diary</h1>
      <button
        onClick={handleDeploy}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
        }}
      >
        {loading ? 'Деплой...' : 'Развернуть контракт'}
      </button>

      {contractAddress && (
        <div style={{ marginTop: '20px' }}>
          <p>✅ Контракт успешно развернут!</p>
          <p><b>Адрес:</b> {contractAddress}</p>
          <p><b>Tx Hash:</b> {txHash}</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          ❌ {error}
        </div>
      )}
    </div>
  )
}
