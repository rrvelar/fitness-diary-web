// pages/frame.tsx
import Head from "next/head"

export default function Frame() {
  return (
    <>
      <Head>
        <title>Fitness Diary Frame</title>
        <meta property="og:title" content="Fitness Diary Frame" />
        <meta property="og:description" content="Добавь запись прямо из Warpcast" />
        <meta property="og:image" content="https://fitness-diary-web.vercel.app/preview.png" />

        {/* 🔑 Основные мета-теги для Warpcast */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://fitness-diary-web.vercel.app/preview.png" />

        <meta property="fc:frame:button:1" content="📖 Мои записи" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="https://fitness-diary-web.vercel.app/api/frame-action?action=entries" />

        <meta property="fc:frame:button:2" content="➕ Добавить" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content="https://fitness-diary-web.vercel.app/api/frame-action?action=log" />
      </Head>

      <main>
        <h1>Fitness Diary Frame</h1>
        <p>Эта страница нужна только для Warpcast (frames).</p>
      </main>
    </>
  )
}
