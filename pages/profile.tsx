import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function ProfilePage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Мой профиль</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectButton />
        </CardContent>
      </Card>
    </div>
  )
}
