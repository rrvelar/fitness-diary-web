// pages/web.tsx
import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import { encodeFunctionData } from "viem"
import { publicClient } from "../lib/viem"
import abi from "../abi/FitnessDiary.json"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

// 🔤 Переводы
const translations = {
  ru: {
    connect: "🔑 Подключить кошелек",
    connected: "✅ Кошелек подключен",
    log: "➕ Добавить",
    entries: "📖 Записи",
    chart: "📊 График",
    stats: "🏆 Статистика",
    goals: "🏅 Цели",
    restart: "✨ Новый старт",
    restartNote: "Сбросит отображение записей с выбранной даты (данные не удаляются)",
    lastEntries: "Последние записи",
    update: "🔄 Обновить",
    export: "💾 Экспорт",
    noEntries: "Записей пока нет",
    weight: "Вес",
    weightUnit: "кг",
    calories: "Калории",
    steps: "Шаги",
    statsTitle: "📊 Общая статистика",
    avgWeight: "Средний вес",
    avgIn: "Средний калораж In",
    avgOut: "Средний калораж Out",
    maxSteps: "Макс. шагов",
    minWeight: "Мин. вес",
    goalsTitle: "🏅 Цели и достижения",
    goalWeight: "Цель по весу",
    goalSteps: "Цель по шагам",
    achieved: "✅ Достигнуто",
    notAchieved: "❌ Пока нет",
    calorieBalance: "Баланс калорий",
    save: "💾 Сохранить",
  },
  en: {
    connect: "🔑 Connect Wallet",
    connected: "✅ Wallet Connected",
    log: "➕ Add",
    entries: "📖 Entries",
    chart: "📊 Chart",
    stats: "🏆 Stats",
    goals: "🏅 Goals",
    restart: "✨ New Start",
    restartNote: "Resets entries display from the chosen date (data is not deleted)",
    lastEntries: "Recent entries",
    update: "🔄 Refresh",
    export: "💾 Export",
    noEntries: "No records yet",
    weight: "Weight",
    weightUnit: "kg",
    calories: "Calories",
    steps: "Steps",
    statsTitle: "📊 Overall stats",
    avgWeight: "Avg. weight",
    avgIn: "Avg. calories In",
    avgOut: "Avg. calories Out",
    maxSteps: "Max. steps",
    minWeight: "Min. weight",
    goalsTitle: "🏅 Goals & Achievements",
    goalWeight: "Weight goal",
    goalSteps: "Steps goal",
    achieved: "✅ Achieved",
    notAchieved: "❌ Not yet",
    calorieBalance: "Calorie balance",
    save: "💾 Save",
  },
}

// 🎯 Мотивация
const motivational = {
  ru: ["💪 Вперёд к лучшей версии себя!", "🔥 Каждый шаг — ближе к цели", "🏆 Дисциплина сильнее мотивации"],
  en: ["💪 Become your best self!", "🔥 Every step counts", "🏆 Discipline beats motivation"],
}

type Entry = {
  date: number
  weightGrams: number
  caloriesIn: number
  caloriesOut: number
  steps: number
  exists: boolean
}

export default function Web() {
  const [lang, setLang] = useState<"ru" | "en">("ru")
  const t = translations[lang]

  const [address, setAddress] = useState<string | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"log" | "entries" | "chart" | "stats" | "goals">("log")

  // форма
  const [date, setDate] = useState("")
  const [weight, setWeight] = useState("")
  const [calIn, setCalIn] = useState("")
  const [calOut, setCalOut] = useState("")
  const [steps, setSteps] = useState("")

  // фильтр дат
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [restartDate, setRestartDate] = useState("")

  // цели
  const [goalWeight, setGoalWeight] = useState(80)
  const [goalSteps, setGoalSteps] = useState(10000)

  const pollRef = useRef<number | null>(null)

  // кошелек
  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAddress(accounts[0])
      } catch (err) {
        console.error("Wallet connect error:", err)
      }
    } else {
      alert("Install MetaMask or use WalletConnect")
    }
  }

  // 📡 безопасный вызов getDates
  async function safeGetDates(user: `0x${string}`): Promise<bigint[]> {
    let count = 50n
    while (count > 0n) {
      try {
        return (await publicClient.readContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getDates",
          args: [user, 0n, count],
        })) as bigint[]
      } catch (err: any) {
        if (!err.message?.includes("Out of bounds")) throw err
        count -= 1n
      }
    }
    return []
  }

  async function fetchEntries() {
    if (!address) return
    try {
      setLoading(true)
      const datesBigInt = await safeGetDates(address as `0x${string}`)
      const dates = datesBigInt.map(Number)
      const fetched: Entry[] = []

      for (let d of dates) {
        try {
          const entry = (await publicClient.readContract({
            abi,
            address: CONTRACT_ADDRESS,
            functionName: "getEntry",
            args: [address as `0x${string}`, BigInt(d)],
          })) as Entry
          if (entry.exists) {
            fetched.push({
              ...entry,
              date: Number(entry.date),
              weightGrams: Number(entry.weightGrams),
              caloriesIn: Number(entry.caloriesIn),
              caloriesOut: Number(entry.caloriesOut),
              steps: Number(entry.steps),
            })
          }
        } catch {}
      }
      setEntries(fetched.sort((a, b) => b.date - a.date))
    } finally {
      setLoading(false)
    }
  }

  async function logEntry() {
    if (!date || !weight || !calIn || !calOut || !steps) {
      alert(lang === "ru" ? "⚠️ Заполни все поля" : "⚠️ Fill all fields")
      return
    }
    if (!address || typeof window.ethereum === "undefined") return

    const ymd = Number(date.replace(/-/g, ""))
    const w = Math.round(Number(weight) * 1000)
    const ci = Number(calIn)
    const co = Number(calOut)
    const st = Number(steps)

    const data = encodeFunctionData({
      abi: abi as any,
      functionName: "logEntry",
      args: [ymd, w, ci, co, st],
    })

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{ from: address, to: CONTRACT_ADDRESS, data, value: "0x0" }],
    })
    fetchEntries()
  }

  // автообновление
  useEffect(() => {
    if (address) {
      fetchEntries()
      if (pollRef.current !== null) window.clearInterval(pollRef.current)
      pollRef.current = window.setInterval(fetchEntries, 30000)
    }
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current)
    }
  }, [address])

  function formatDate(num: number) {
    const str = num.toString()
    return lang === "ru" ? `${str.slice(6, 8)}/${str.slice(4, 6)}/${str.slice(0, 4)}` : `${str.slice(4, 6)}/${str.slice(6, 8)}/${str.slice(0, 4)}`
  }

  const chartData = entries
    .filter((e) => !restartDate || e.date >= Number(restartDate.replace(/-/g, "")))
    .map((e) => ({
      date: formatDate(e.date),
      weight: e.weightGrams / 1000,
      calIn: e.caloriesIn,
      calOut: e.caloriesOut,
      balance: e.caloriesIn - e.caloriesOut,
    }))

  function getStats() {
    const filtered = entries.filter((e) => !restartDate || e.date >= Number(restartDate.replace(/-/g, "")))
    if (filtered.length === 0) return null
    const avgWeight = filtered.reduce((s, e) => s + e.weightGrams, 0) / filtered.length / 1000
    const avgIn = filtered.reduce((s, e) => s + e.caloriesIn, 0) / filtered.length
    const avgOut = filtered.reduce((s, e) => s + e.caloriesOut, 0) / filtered.length
    const maxSteps = Math.max(...filtered.map((e) => e.steps))
    const minWeight = Math.min(...filtered.map((e) => e.weightGrams)) / 1000
    return { avgWeight, avgIn, avgOut, maxSteps, minWeight }
  }

  const stats = getStats()

  const filteredEntries = entries.filter((e) => {
    if (restartDate && e.date < Number(restartDate.replace(/-/g, ""))) return false
    if (startDate && e.date < Number(startDate.replace(/-/g, ""))) return false
    if (endDate && e.date > Number(endDate.replace(/-/g, ""))) return false
    return true
  })

  return (
    <>
      <Head>
        <title>Fitness Diary — Web</title>
      </Head>

      <main className="min-h-screen p-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-emerald-700 text-center">Fitness Diary — Web</h1>
          <div className="flex gap-2">
            {!address && (
              <button onClick={connectWallet} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
                {t.connect}
              </button>
            )}
            {address && <span className="text-emerald-700 font-semibold">{t.connected}</span>}
            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="px-3 py-1 rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              {lang === "ru" ? "EN" : "RU"}
            </button>
          </div>
        </div>

        <p className="text-center text-emerald-600 font-semibold">
          {motivational[lang][Math.floor(Math.random() * motivational[lang].length)]}
        </p>

        {/* Новый старт */}
        <div className="bg-white p-4 rounded shadow text-center space-y-2">
          <h3 className="font-semibold text-emerald-700">{t.restart}</h3>
          <input
            type="date"
            value={restartDate}
            onChange={(e) => setRestartDate(e.target.value)}
            className="border p-2 rounded text-gray-800 w-48 text-center"
          />
          <p className="text-xs text-gray-500">{t.restartNote}</p>
        </div>

        {/* меню */}
        <nav className="grid grid-cols-2 sm:flex sm:justify-center gap-3">
          {[
            ["entries", t.entries],
            ["log", t.log],
            ["chart", t.chart],
            ["stats", t.stats],
            ["goals", t.goals],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-lg w-full sm:w-auto transition font-medium ${
                view === key ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 border border-emerald-600 hover:bg-emerald-50"
              }`}
              onClick={() => setView(key as any)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Добавить запись */}
        {view === "log" && address && (
          <div className="space-y-2 border p-4 rounded-lg shadow bg-white">
            <input type="date" className="w-full border p-2 rounded text-gray-900" value={date} onChange={(e) => setDate(e.target.value)} />
            <input
              className="w-full border p-2 rounded text-gray-900"
              placeholder={`${t.weight} (${t.weightUnit})`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <input className="w-full border p-2 rounded text-gray-900" placeholder={`${t.calories} In`} value={calIn} onChange={(e) => setCalIn(e.target.value)} />
            <input className="w-full border p-2 rounded text-gray-900" placeholder={`${t.calories} Out`} value={calOut} onChange={(e) => setCalOut(e.target.value)} />
            <input className="w-full border p-2 rounded text-gray-900" placeholder={t.steps} value={steps} onChange={(e) => setSteps(e.target.value)} />
            <button onClick={logEntry} className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 w-full transition">
              {t.log}
            </button>
          </div>
        )}

        {/* Последние записи */}
        {view === "entries" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="font-semibold text-lg text-emerald-700">{t.lastEntries}</h2>
              <div className="flex gap-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-1 rounded text-gray-700" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-1 rounded text-gray-700" />
                <button onClick={fetchEntries} className="bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-600 transition">
                  {t.update}
                </button>
                <button
                  onClick={() => {
                    if (entries.length === 0) return
                    const header = `${t.weight},${t.calories} In,${t.calories} Out,${t.steps}\n`
                    const rows = entries
                      .filter((e) => !restartDate || e.date >= Number(restartDate.replace(/-/g, "")))
                      .map((e) => `${formatDate(e.date)},${(e.weightGrams / 1000).toFixed(1)},${e.caloriesIn},${e.caloriesOut},${e.steps}`)
                      .join("\n")
                    const blob = new Blob([header + rows], { type: "text/csv" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "fitness-diary.csv"
                    a.click()
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  {t.export}
                </button>
              </div>
            </div>
            {loading && <p className="text-gray-500">Loading...</p>}
            {!loading && filteredEntries.length === 0 && <p className="text-gray-500">{t.noEntries}</p>}
            {filteredEntries.map((e, i) => (
              <div key={i} className="border rounded-xl p-4 shadow-md bg-white hover:shadow-lg transition">
                <p className="text-sm text-gray-500">{formatDate(e.date)}</p>
                <p className="font-semibold text-emerald-700 text-lg">
                  {t.weight}: {(e.weightGrams / 1000).toFixed(1)} {t.weightUnit}
                </p>
                <p className="text-sm text-gray-800">
                  {t.calories}: <span className="font-medium">{e.caloriesIn}</span> / <span className="font-medium">{e.caloriesOut}</span>
                </p>
                <p className="text-sm text-gray-800">
                  {t.steps}: {e.steps}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* График */}
        {view === "chart" && (
          <div className="w-full h-72 bg-white p-4 rounded-lg shadow">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} name={`${t.weight} (${t.weightUnit})`} />
                  <Line type="monotone" dataKey="calIn" stroke="#3b82f6" strokeWidth={2} name={`${t.calories} In`} />
                  <Line type="monotone" dataKey="calOut" stroke="#ef4444" strokeWidth={2} name={`${t.calories} Out`} />
                  <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} name={t.calorieBalance} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">{lang === "ru" ? "Нет данных" : "No data"}</p>
            )}
          </div>
        )}

        {/* Статистика */}
        {view === "stats" && stats && (
          <div className="bg-white p-6 rounded-lg shadow space-y-2 text-center">
            <h2 className="text-lg font-bold text-emerald-700">{t.statsTitle}</h2>
            <p className="text-gray-800">
              {t.avgWeight}: {stats.avgWeight.toFixed(1)} {t.weightUnit}
            </p>
            <p className="text-gray-800">
              {t.avgIn}: {stats.avgIn.toFixed(0)}
            </p>
            <p className="text-gray-800">
              {t.avgOut}: {stats.avgOut.toFixed(0)}
            </p>
            <p className="text-gray-800">
              {t.maxSteps}: {stats.maxSteps}
            </p>
            <p className="text-gray-800">
              {t.minWeight}: {stats.minWeight.toFixed(1)} {t.weightUnit}
            </p>
          </div>
        )}

        {/* Цели */}
        {view === "goals" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-3 text-center">
            <h2 className="text-lg font-bold text-emerald-700">{t.goalsTitle}</h2>
            <div className="flex flex-col gap-2 items-center">
              <input type="number" value={goalWeight} onChange={(e) => setGoalWeight(Number(e.target.value))} className="border p-2 rounded text-gray-800 w-40 text-center" />
              <p>
                {t.goalWeight} ≤ {goalWeight}
                {t.weightUnit}: {entries.length > 0 && (entries[0].weightGrams / 1000) <= goalWeight ? t.achieved : t.notAchieved}
              </p>
              <input type="number" value={goalSteps} onChange={(e) => setGoalSteps(Number(e.target.value))} className="border p-2 rounded text-gray-800 w-40 text-center" />
              <p>
                {t.goalSteps} ≥ {goalSteps}: {entries.some((e) => e.steps >= goalSteps) ? t.achieved : t.notAchieved}
              </p>
              <button onClick={() => {
                localStorage.setItem("goalWeight", String(goalWeight))
                localStorage.setItem("goalSteps", String(goalSteps))
              }} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                {t.save}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
