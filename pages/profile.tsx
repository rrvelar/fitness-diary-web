// pages/profile.tsx
import { useAccount, useBalance } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-emerald-700 text-center">
            Профиль
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <ConnectButton />

          {isConnected && (
            <div className="w-full space-y-2 text-center">
              <p className="text-gray-700">
                <span className="font-medium">Адрес:</span> {address}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Баланс:</span>{" "}
                {balance ? `${balance.formatted} ${balance.symbol}` : "…"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
