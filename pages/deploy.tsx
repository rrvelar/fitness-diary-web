import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import abi from '../abi/FitnessDiary.json'
import bytecode from '../abi/FitnessDiary.bytecode.json'

export default function DeployPage() {
  const { isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const deploy = async () => {
    if (!walletClient) return alert('Подключи кошелёк')

    try {
      const provider = new ethers.BrowserProvider(walletClient)
      const signer = await provider.getSigner()

      const factory = new ethers.ContractFactory(abi, bytecode, signer)
      const contract = await factory.deploy()

      await contract.waitForDeployment()

      alert(`Контракт задеплоен по адресу: ${await contract.getAddress()}`)
    } catch (err) {
      console.error(err)
      alert('Ошибка при деплое, смотри консоль')
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">🚀 Deploy FitnessDiary</h1>
      {isConnected ? (
        <button onClick={deploy} className="bg-green-500 text-white px-4 py-2 rounded">
          Задеплоить контракт
        </button>
      ) : (
        <p>Подключи кошелёк</p>
      )}
    </div>
  )
}
