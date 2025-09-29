import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "text/html")
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Fitness Diary Frame" />
        <meta property="og:description" content="Добавь запись прямо из Warpcast" />
        <meta property="og:image" content="https://your-app.vercel.app/og-image.png" />

        <!-- Frame -->
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:input:text" content="Введите запись в формате: YYYYMMDD,вес,калорииВход,калорииРасход,шаги" />

        <!-- Кнопка -->
        <meta name="fc:frame:button:1" content="➕ Добавить запись" />
        <meta name="fc:frame:button:1:action" content="post" />
        <meta name="fc:frame:button:1:target" content="https://your-app.vercel.app/api/frame-log" />
      </head>
      <body>
        Fitness Diary Frame
      </body>
    </html>
  `)
}
