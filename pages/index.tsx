import { useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 🚀 при загрузке сразу редиректим в /frame
    router.replace("/frame")
  }, [router])

  return (
    <>
      <Head>
        <title>Fitness Diary</title>
        <meta property="og:title" content="Fitness Diary" />
        <meta property="og:description" content="Onchain дневник: вес, калории и шаги" />
        <meta property="og:image" content="https://fitness-diary-web.vercel.app/preview2.png" />

        {/* ✅ Обязательный fc:frame для галочек */}
        <meta
          name="fc:frame"
          content='{"version":"next","imageUrl":"https://fitness-diary-web.vercel.app/preview2.png","buttons":[{"title":"📖 Мои записи","action":{"type":"post","target":"https://fitness-diary-web.vercel.app/api/frame-action?action=entries"}},{"title":"➕ Добавить","action":{"type":"post","target":"https://fitness-diary-web.vercel.app/api/frame-action?action=log"}}]}'
        />
      </Head>

      <main className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-emerald-700">
          Загружается Fitness Diary...
        </h1>
      </main>
    </>
  )
}
