import { useEffect, useState } from "react";
import { getDiaryContract } from "../hooks/useDiaryContract";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type Point = { date: string; weight: number; in: number; out: number; steps: number };

export default function StatsPage() {
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { signer, contract } = await getDiaryContract();
        const me = await signer.getAddress();

        const dates: bigint[] = await contract.getDates(me);
        const entries = await Promise.all(
          dates.map(async (d) => {
            const e = await contract.getEntry(me, Number(d));
            return {
              date: String(e.date),
              weight: Number(e.weightGrams) / 1000,
              in: Number(e.caloriesIn),
              out: Number(e.caloriesOut),
              steps: Number(e.steps),
            } as Point;
          })
        );

        // по возрастанию дат
        entries.sort((a,b)=>Number(a.date) - Number(b.date));
        setData(entries);
      } catch (e:any) {
        alert(`Ошибка: ${e?.message || e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main style={{maxWidth:900, margin:"40px auto"}}>Загрузка…</main>;
  if (data.length === 0) return <main style={{maxWidth:900, margin:"40px auto"}}>Нет данных для графиков</main>;

  return (
    <main style={{maxWidth:1000, margin:"40px auto", fontFamily:"system-ui"}}>
      <h1 style={{fontSize:32, fontWeight:700, marginBottom:16}}>Статистика</h1>

      <section style={{height:320, marginBottom:32}}>
        <h2 style={{margin:"0 0 8px"}}>Вес (кг)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section style={{height:320, marginBottom:32}}>
        <h2 style={{margin:"0 0 8px"}}>Калории</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="in" name="In" dot={false} />
            <Line type="monotone" dataKey="out" name="Out" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section style={{height:320}}>
        <h2 style={{margin:"0 0 8px"}}>Шаги</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="steps" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}

