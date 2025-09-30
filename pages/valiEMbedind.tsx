import { useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

export default function HomePage() {
  const router = useRouter()

  // для обычного веба редиректим на мини-апп
  useEffect(() => {
    router.replace("/frame")
  }, [router])

  // JSON для embed (валидатор требует version:"1" и button)
  const miniappEmbed = {
    version: "1",
    imageUrl: "https://fitness-diary-web.vercel.app/preview2.png",
    button: {
      title: "Open Fitness Diary",
      action: {
        type: "launch_miniapp",
        url: "https://fitness-diary-web.vercel.app/frame",
        name: "Fitness Diary",
        splashImageUrl: "https://fitness-diary-web.vercel.app/splash.png",
        splashBackgroundColor: "#34D399",
      },
    },
  }

  // дублируем для b/c (action.type: launch_frame) — не обязательно, но полезно
  const legacyFrameEmbed = {
    ...miniappEmbed,
    button: {
      ...miniappEmbed.button,
      action: { ...miniappEmbed.button.action, type: "launch_frame" as const },
    },
  }

  return (
    <>
      <Head>
        <title>Fitness Diary</title>

        {/* OG для социальных превью */}
        <meta property="og:title" content="Fitness Diary" />
        <meta property="og:description" content="Onchain дневник: вес, калории и шаги" />
        <meta property="og:image" content="https://fitness-diary-web.vercel.app/preview2.png" />

        {/* ✅ главный метатег для Mini App embed */}
        <meta name="fc:miniapp" content={JSON.stringify(miniappEmbed)} />
        {/* ↩️ обратная совместимость */}
        <meta name="fc:frame" content={JSON.stringify(legacyFrameEmbed)} />
      </Head>

      <main className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-emerald-700">Загружается Fitness Diary…</h1>
      </main>
    </>
  )
}
