import { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "text/html")
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fitness Diary</title>
        <meta name="og:title" content="Fitness Diary 📒💪" />
        <meta name="og:description" content="Логируй вес и шаги прямо из Warpcast!" />
        <meta name="og:image" content="https://fitness-diary-web.vercel.app/preview.png" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://fitness-diary-web.vercel.app/preview.png" />
        <meta property="fc:frame:button:1" content="Добавить запись" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://fitness-diary-web.vercel.app/log" />
        <meta property="fc:frame:button:2" content="Мои записи" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="https://fitness-diary-web.vercel.app/entries" />
      </head>
      <body>
        MiniDapp for Warpcast
      </body>
    </html>
  `)
}
