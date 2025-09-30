// pages/frame.tsx
import Head from "next/head"
import { useEffect, useMemo, useRef, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import {
  encodeFunctionData,
  createPublicClient,
  http,
  type Hex,
  type Address,
} from "viem"
import { base } from "viem/chains"
import abi from "../abi/FitnessDiary.json"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

// viem client (Alchemy HTTP). Нужен только для чтения и ожидания tx.
const publicClient = createPublicClient({
  chain: base,
  transport: http(
    `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY ?? ""}`
  ),
})

type Entry = {
  date: bigint
  weightGrams: bigint
  caloriesIn: bigint
  caloriesOut: bigint
  steps: bigint
  exists: boolean
}

type Tab = "records" | "form" | "chart"

export default function Frame() {
  // --- state ---
  const [tab, setTab] = useState<Tab>("form")
  const [status, setStatus] = useState<string>("Готово")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [userAddress, setUserAddress] = useState<Address | null>(null)

  // форма
  const [dateStr, setDateStr] = useState<string>("") // из <input type="date"> => 'YYYY-MM-DD'
  const [weight, setWeight] = useState<string>("")
  const [calIn, setCalIn] = useState<string>("")
  const [calOut, setCalOut] = useState<string>("")
  const [steps, setSteps] = useState<string>("")

  const provider = sdk.wallet.ethProvider
  const pollRef = useRef<number | null>(null)
  // 0) Сообщаем Warpcast, что мини-апп готово (убирает splash)
  useEffect(() => {
    ;(async () => {
      try {
        await sdk.actions.ready()
        // подтянем адрес из встроенного кошелька
        const accs = (await provider.request({
          method: "eth_accounts",
        })) as Address[]
        if (accs?.length) setUserAddress(accs[0])
      } catch (e) {
        console.warn("sdk.actions.ready() / eth_accounts failed", e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 1) чтение последних записей (через Alchemy)
  const fetchEntries = async () => {
    if (!userAddress) return
    try {
      setLoading(true)

      const dates = (await publicClient.readContract({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "getDates",
        args: [userAddress, 0n, 20n], // забираем до 20 шт, ниже отфильтруем
      })) as readonly bigint[]

      const recent = [...dates].slice(-10) // до 10 последних
      const fetched: Entry[] = []

      for (const d of recent) {
        const e = (await publicClient.readContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getEntry",
          args: [userAddress, d],
        })) as unknown as Entry

        if (e?.exists) fetched.push(e)
      }

      // по убыванию даты, и в стейт в прямом порядке (новые сверху)
      fetched.sort((a, b) => Number(b.date - a.date))
      setEntries(fetched)
    } catch (e) {
      console.error("fetchEntries error", e)
    } finally {
      setLoading(false)
    }
  }

  // первый fetch и авто-пуллинг раз в 5 сек
  useEffect(() => {
  if (!userAddress) return
  fetchEntries()

  if (pollRef.current !== null) {
    window.clearInterval(pollRef.current)
  }

  pollRef.current = window.setInterval(fetchEntries, 5000)

  return () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current)
    }
  }
}, [userAddress])

  // 2) отправка записи через встроенный кошелёк (EIP-1193)
  const onSubmit = async () => {
    try {
      if (!provider?.request) {
        setStatus("⚠️ Встроенный кошелёк недоступен")
        return
      }
      if (!userAddress) {
        setStatus("⚠️ Адрес пользователя не определён")
        return
      }
      if (!dateStr || !weight || !calIn || !calOut || !steps) {
        setStatus("⚠️ Заполни все поля")
        return
      }

      setSending(true)
      setStatus("⏳ Отправка транзакции...")

      // YYYY-MM-DD -> YYYYMMDD (число)
      const ymd = Number(dateStr.replaceAll("-", ""))
      const w = Math.round(Number(weight) * 1000) // кг => граммы
      const ci = Number(calIn)
      const co = Number(calOut)
      const st = Number(steps)

      const data = encodeFunctionData({
        abi: abi as any,
        functionName: "logEntry",
        args: [BigInt(ymd), BigInt(w), BigInt(ci), BigInt(co), BigInt(st)],
      })

      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAddress,
            to: CONTRACT_ADDRESS,
            data,
            value: "0x0",
          },
        ],
      })) as Hex

      setStatus(`✅ Транзакция отправлена: ${txHash}`)

      // ждём подтверждение через Alchemy/viem (у провайдера может не быть wait)
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      setStatus("✅ Успешно подтверждено")
      // очистим поля и покажем вкладку "Записи"
      setWeight("")
      setCalIn("")
      setCalOut("")
      setSteps("")
      fetchEntries()
      setTab("records")
    } catch (e: any) {
      console.error(e)
      setStatus(`❌ Ошибка: ${e?.message || String(e)}`)
    } finally {
      setSending(false)
    }
  }

  // форматтеры
  const formatDate = (num: bigint) => {
    const s = num.toString()
    if (s.length !== 8) return s
    return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`
  }
  const chartData = useMemo(
    () =>
      entries
        .slice()
        .reverse()
        .map((e) => ({
          date: formatDate(e.date),
          weight: Number(e.weightGrams) / 1000,
        })),
    [entries]
  )

  // UI helpers
  const NavBtn = ({
    active,
    onClick,
    icon,
    children,
  }: {
    active: boolean
    onClick: () => void
    icon: string
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      className={`mr-4 mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition
      ${active ? "bg-emerald-600 text-white" : "bg-white/10 text-emerald-300 hover:bg-white/20"}`}
    >
      <span aria-hidden>{icon}</span>
      <span className="font-medium">{children}</span>
    </button>
  )

  return (
    <>
      <Head>
        <title>Fitness Diary — Mini</title>
        {/* в mini-app странице никаких fc:frame/fc:miniapp не ставим */}
        <meta property="og:title" content="Fitness Diary — Mini" />
        <meta
          property="og:description"
          content="Логируй вес, калории и шаги прямо из Warpcast"
        />
        <meta
          property="og:image"
          content="https://fitness-diary-web.vercel.app/og.png"
        />
      </Head>

      <main
        className="min-h-screen p-6"
        style={{
          background:
            "linear-gradient(160deg, #101923 0%, #0e1720 40%, #0a1420 100%)",
        }}
      >
        {/* Навигация */}
        <div className="mb-4 -mt-2">
          <NavBtn
            active={tab === "records"}
            onClick={() => setTab("records")}
            icon="📖"
          >
            Записи
          </NavBtn>
          <NavBtn
            active={tab === "form"}
            onClick={() => setTab("form")}
            icon="➕"
          >
            Добавить
          </NavBtn>
          <NavBtn
            active={tab === "chart"}
            onClick={() => setTab("chart")}
            icon="📊"
          >
            График
          </NavBtn>
        </div>

        <h1 className="mb-4 text-3xl font-extrabold text-emerald-500">
          Fitness Diary — Mini
        </h1>

        <p
          className={`mb-4 text-sm ${
            status.startsWith("❌")
              ? "text-red-400"
              : status.startsWith("✅")
              ? "text-emerald-300"
              : "text-gray-300"
          }`}
        >
          {status}
        </p>

        {/* --- Вкладка: форма --- */}
        {tab === "form" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
            {/* дата */}
            <div className="mb-3">
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
              />
            </div>
            {/* вес */}
            <div className="mb-3">
              <input
                inputMode="decimal"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
                placeholder="Вес (кг)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            {/* калории in */}
            <div className="mb-3">
              <input
                inputMode="numeric"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
                placeholder="Калории In"
                value={calIn}
                onChange={(e) => setCalIn(e.target.value)}
              />
            </div>
            {/* калории out */}
            <div className="mb-3">
              <input
                inputMode="numeric"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
                placeholder="Калории Out"
                value={calOut}
                onChange={(e) => setCalOut(e.target.value)}
              />
            </div>
            {/* шаги */}
            <div className="mb-4">
              <input
                inputMode="numeric"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none"
                placeholder="Шаги"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </div>

            <button
              onClick={onSubmit}
              disabled={sending}
              className={`w-full rounded-lg px-4 py-3 text-white transition ${
                sending
                  ? "cursor-not-allowed bg-emerald-400"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {sending ? "⏳ Отправка..." : "➕ Добавить запись"}
            </button>
          </section>
        )}

        {/* --- Вкладка: записи --- */}
        {tab === "records" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-emerald-300">
                Последние записи
              </h2>
              <button
                onClick={fetchEntries}
                className="rounded-md bg-white/10 px-3 py-1 text-sm text-emerald-200 hover:bg-white/20"
              >
                Обновить
              </button>
            </div>

            {loading && (
              <p className="text-gray-300">Загрузка последних записей…</p>
            )}

            {!loading && entries.length === 0 && (
              <p className="text-gray-400">Записей пока нет</p>
            )}

            <div className="space-y-3">
              {entries.map((e, i) => (
                <div
                  key={`${e.date.toString()}-${i}`}
                  className="rounded-lg border border-white/10 bg-white p-3 shadow"
                >
                  <p className="text-sm text-gray-500">{formatDate(e.date)}</p>
                  <p className="font-semibold text-emerald-700">
                    Вес: {(Number(e.weightGrams) / 1000).toFixed(1)} кг
                  </p>
                  <p className="text-sm text-gray-800">
                    Калории: {Number(e.caloriesIn)} /{" "}
                    {Number(e.caloriesOut)}
                  </p>
                  <p className="text-sm text-gray-800">
                    Шаги: {Number(e.steps)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Вкладка: график --- */}
        {tab === "chart" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold text-emerald-300">
              Динамика веса
            </h2>
            {chartData.length === 0 ? (
              <p className="text-gray-400">Нет данных для графика</p>
            ) : (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  )
}
