import { useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 🚀 при загрузке сразу редиректим на /frame
    router.replace("/frame")
  }, [router])

  return (
    <>
      <Head>
        <title>Fitness Diary</title>
        <meta property="og:title" content="Fitness Diary" />
        <meta
          property="og:description"
          content="Onchain дневник: вес, калории и шаги"
        />
        <meta
          property="og:image"
          content="https://fitness-diary-web.vercel.app/preview2.png"
        />

        {/* ✅ Минимальный, но валидный fc:frame с кнопкой */}
        <meta
          name="fc:frame"
          content='{
            "version": "next",
            "imageUrl": "https://fitness-diary-web.vercel.app/preview2.png",
            "buttons": [
              {
                "title": "Открыть",
                "action": {
                  "type": "post",
                  "target": "https://fitness-diary-web.vercel.app/frame"
                }
              }
            ]
          }'
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
