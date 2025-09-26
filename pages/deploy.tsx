import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { useState } from 'react'
import abi from '../abi/FitnessDiary.json'
import bytecode from '../abi/FitnessDiary.bytecode.json'
import { ethers } from 'ethers'

export default function DeployPage() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()

  const [loading, setLoading] = useState(false)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!walletClient) {
        throw new Error('Кошелёк не подключен')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const factory = new ethers.ContractFactory(abi, bytecode, signer)
      const contract = await factory.deploy()

      await contract.waitForDeployment()

      setContractAddress(await contract.getAddress())
      setTxHash(contract.deploymentTransaction()?.hash || '')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Деплой Fitness Diary</h1>

      {!isConnected ? (
        <button onClick={() => connect({ connector: connectors[0] })}>Подключить кошелёк</button>
      ) : (
        <>
          <p>Кошелёк: {address}</p>
          <button onClick={() => disconnect()}>Отключить</button>
          <br /><br />
          <button onClick={handleDeploy} disabled={loading}>
            {loading ? 'Деплой...' : 'Развернуть контракт'}
          </button>
        </>
      )}

      {contractAddress && (
        <div style={{ marginTop: '20px' }}>
          <p>✅ Контракт успешно развернут!</p>
          <p><b>Адрес:</b> {contractAddress}</p>
          <p><b>Tx Hash:</b> {txHash}</p>
        </div>
      )}

      {error && <div style={{ marginTop: '20px', color: 'red' }}>❌ {error}</div>}
    </div>
  )
}
