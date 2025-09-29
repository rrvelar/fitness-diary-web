// pages/frame.tsx
import Head from "next/head"
import { useEffect } from "react"

export default function Frame() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const callReady = () => {
      // @ts-ignore
      window.farcaster?.actions?.ready?.()
      console.log("✅ Farcaster SDK ready")
    }

    if (!window.farcaster) {
      const script = document.createElement("script")
      script.src = "https://warpcast.com/sdk/v2"   // ✅ вместо unpkg
      script.async = true
      script.onload = callReady
      document.body.appendChild(script)
    } else {
      callReady()
    }
  }, [])

  return (
    <>
      <Head>
        <title>Fitness Diary Frame</title>
        <meta property="og:title" content="Fitness Diary Frame" />
        <meta
          property="og:description"
          content="Добавь запись прямо из Warpcast"
        />
        <meta
          property="og:image"
          content="https://fitness-diary-web.vercel.app/preview.png"
        />

        {/* ✅ Новый JSON формат для Farcaster Frames */}
        <meta
          name="fc:frame"
          content='{
            "version": "next",
            "imageUrl": "https://fitness-diary-web.vercel.app/preview.png",
            "buttons": [
              {
                "title": "📖 Мои записи",
                "action": {
                  "type": "post",
                  "target": "https://fitness-diary-web.vercel.app/api/frame-action?action=entries"
                }
              },
              {
                "title": "➕ Добавить",
                "action": {
                  "type": "post",
                  "target": "https://fitness-diary-web.vercel.app/api/frame-action?action=log"
                }
              }
            ]
          }'
        />
      </Head>

      <main>
        <h1>Fitness Diary Frame</h1>
        <p>Эта страница нужна только для Warpcast (frames).</p>
      </main>
    </>
  )
}
