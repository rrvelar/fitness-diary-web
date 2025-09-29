import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-md border border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-600 text-center">
            Мой профиль
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectButton showBalance={true} accountStatus="full" />
        </CardContent>
      </Card>
    </div>
  )
}
