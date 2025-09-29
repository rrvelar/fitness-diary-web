import Link from "next/link"
import { ReactNode } from "react"
import { Dumbbell } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const isMiniApp = router.pathname.startsWith("/frame")

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-emerald-700 font-bold text-xl"
          >
            <Dumbbell className="w-6 h-6" />
            Fitness Diary
          </Link>

          <nav className="flex items-center gap-6 text-gray-700">
            <Link href="/entries" className="hover:text-emerald-600 transition">
              Записи
            </Link>
            <Link href="/log" className="hover:text-emerald-600 transition">
              Добавить
            </Link>
            <Link href="/profile" className="hover:text-emerald-600 transition">
              Профиль
            </Link>

            {/* Wallet connect button только в веб-версии */}
            {!isMiniApp && (
              <ConnectButton
                showBalance={false}
                accountStatus="address"
              />
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto p-6">{children}</main>
    </div>
  )
}
