import { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Fitness Diary Frame" />
        <meta property="og:description" content="Добавь запись прямо из Warpcast" />
      </head>
      <body>
        <h2>Добавить запись</h2>
        <form method="POST" action="/api/frame-log">
          <input type="text" name="date" placeholder="20250929" required />
          <input type="number" step="0.1" name="weight" placeholder="Вес (кг)" required />
          <input type="number" name="caloriesIn" placeholder="Калории вход" required />
          <input type="number" name="caloriesOut" placeholder="Калории расход" required />
          <input type="number" name="steps" placeholder="Шаги" required />
          <button type="submit">Добавить</button>
        </form>
      </body>
    </html>
  `

  res.setHeader("Content-Type", "text/html")
  res.status(200).send(html)
}
