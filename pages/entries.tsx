import { useEffect, useState } from "react";
import { getDiaryContract } from "../hooks/useDiaryContract";

type Entry = {
  date: number;
  weightGrams: number;
  caloriesIn: number;
  caloriesOut: number;
  steps: number;
  exists: boolean;
};

export default function EntriesPage() {
  const [address, setAddress] = useState<string>("");
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { signer, contract } = await getDiaryContract();
        const me = await signer.getAddress();
        setAddress(me);

        const dates: bigint[] = await contract.getDates(me);
        // тянем все записи параллельно
        const entries = await Promise.all(
          dates.map(async (d) => {
            const e = await contract.getEntry(me, Number(d));
            return {
              date: Number(e.date),
              weightGrams: Number(e.weightGrams),
              caloriesIn: Number(e.caloriesIn),
              caloriesOut: Number(e.caloriesOut),
              steps: Number(e.steps),
              exists: Boolean(e.exists),
            } as Entry;
          })
        );

        // сортируем по дате по убыванию
        entries.sort((a,b)=>b.date - a.date);
        setRows(entries);
      } catch (e: any) {
        alert(`Ошибка загрузки: ${e?.message || e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main style={{maxWidth:1000, margin:"40px auto", fontFamily:"system-ui"}}>
      <h1 style={{fontSize:32, fontWeight:700}}>Мои записи</h1>
      <div style={{opacity:0.7, marginBottom:12}}>Адрес: {address || "—"}</div>

      {loading ? (
        <div>Загрузка…</div>
      ) : rows.length === 0 ? (
        <div>Записей пока нет</div>
      ) : (
        <div style={{overflowX:"auto"}}>
          <table style={{borderCollapse:"collapse", width:"100%"}}>
            <thead>
              <tr>
                {["Дата","Вес (кг)","Калории In","Калории Out","Шаги"].map(h=>(
                  <th key={h} style={{textAlign:"left", padding:"10px 8px", borderBottom:"1px solid #e5e5e5"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.date}>
                  <td style={{padding:"8px"}}>{r.date}</td>
                  <td style={{padding:"8px"}}>{(r.weightGrams/1000).toFixed(1)}</td>
                  <td style={{padding:"8px"}}>{r.caloriesIn}</td>
                  <td style={{padding:"8px"}}>{r.caloriesOut}</td>
                  <td style={{padding:"8px"}}>{r.steps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
