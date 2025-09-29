// pages/frame.tsx
import Head from "next/head"
import { useEffect } from "react"

export default function Frame() {
  useEffect(() => {
    // Загружаем SDK с CDN
    const script = document.createElement("script")
    script.src = "https://www.unpkg.com/@farcaster/mini/dist/sdk.min.js"
    script.async = true
    script.onload = () => {
      // Когда SDK загрузился, вызываем ready()
      // @ts-ignore
      if (window.farcaster) {
        // @ts-ignore
        window.farcaster.actions.ready()
      }
    }
    document.body.appendChild(script)
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

        {/* 🔑 Новый формат Embed (рекомендуемый Farcaster Mini Apps) */}
        <meta
          name="fc:miniapp"
          content={JSON.stringify({
            version: "1",
            imageUrl: "https://fitness-diary-web.vercel.app/preview.png",
            buttons: [
              {
                title: "📖 Мои записи",
                action: {
                  type: "post",
                  target:
                    "https://fitness-diary-web.vercel.app/api/frame-action?action=entries",
                },
              },
              {
                title: "➕ Добавить",
                action: {
                  type: "post",
                  target:
                    "https://fitness-diary-web.vercel.app/api/frame-action?action=log",
                },
              },
            ],
          })}
        />

        {/* ✅ Для обратной совместимости (старый формат) */}
        <meta property="fc:frame" content="vNext" />
        <meta
          property="fc:frame:image"
          content="https://fitness-diary-web.vercel.app/preview.png"
        />

        <meta property="fc:frame:button:1" content="📖 Мои записи" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta
          property="fc:frame:button:1:target"
          content="https://fitness-diary-web.vercel.app/api/frame-action?action=entries"
        />

        <meta property="fc:frame:button:2" content="➕ Добавить" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta
          property="fc:frame:button:2:target"
          content="https://fitness-diary-web.vercel.app/api/frame-action?action=log"
        />
      </Head>

      <main>
        <h1>Fitness Diary Frame</h1>
        <p>Эта страница нужна только для Warpcast (frames).</p>
      </main>
    </>
  )
}
