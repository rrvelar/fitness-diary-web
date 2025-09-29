import { useAccount, useDisconnect } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-3xl font-bold text-emerald-700">Профиль</h1>

      {!isConnected ? (
        <ConnectButton />
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-800">Подключен: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Отключить
          </button>
        </div>
      )}
    </div>
  )
}
