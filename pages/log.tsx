
import { useState } from "react";
import { getDiaryContract } from "../hooks/useDiaryContract";

export default function LogPage() {
  const [date, setDate] = useState<number>(20250101); // YYYYMMDD
  const [weight, setWeight] = useState<number>(80000); // grams
  const [calIn, setCalIn] = useState<number>(2500);
  const [calOut, setCalOut] = useState<number>(3000);
  const [steps, setSteps] = useState<number>(12000);
  const [loading, setLoading] = useState<null | "log" | "update">(null);

  const validate = () => {
    if (!Number.isFinite(date)) throw new Error("Дата невалидна");
    if (!Number.isFinite(weight)) throw new Error("Вес невалиден");
    if (!Number.isFinite(calIn) || !Number.isFinite(calOut)) throw new Error("Калории невалидны");
    if (!Number.isFinite(steps)) throw new Error("Шаги невалидны");
  };

  const logEntry = async () => {
    try {
      validate();
      setLoading("log");
      const { contract } = await getDiaryContract();
      const tx = await contract.logEntry(
        Number(date),
        Number(weight),
        Number(calIn),
        Number(calOut),
        Number(steps)
      );
      await tx.wait();
      alert("✅ Запись добавлена");
    } catch (e: any) {
      alert(`Ошибка: ${e?.message || e}`);
    } finally {
      setLoading(null);
    }
  };

  const updateEntry = async () => {
    try {
      validate();
      setLoading("update");
      const { contract } = await getDiaryContract();
      const tx = await contract.updateEntry(
        Number(date),
        Number(weight),
        Number(calIn),
        Number(calOut),
        Number(steps)
      );
      await tx.wait();
      alert("✅ Запись обновлена");
    } catch (e: any) {
      alert(`Ошибка: ${e?.message || e}`);
    } finally {
      setLoading(null);
    }
  };

  const field = (label: string, value: number, setter: (v: number)=>void) => (
    <label style={{display:"block", margin:"8px 0"}}>
      {label}{" "}
      <input
        type="number"
        value={value}
        onChange={(e)=>setter(Number(e.target.value))}
        style={{padding:"6px", width:260}}
      />
    </label>
  );

  return (
    <main style={{maxWidth:720, margin:"40px auto", fontFamily:"system-ui"}}>
      <h1 style={{fontSize:32, fontWeight:700}}>Log / Update Entry</h1>

      {field("Дата (YYYYMMDD)", date, setDate)}
      {field("Вес (гр)", weight, setWeight)}
      {field("Калории In", calIn, setCalIn)}
      {field("Калории Out", calOut, setCalOut)}
      {field("Шаги", steps, setSteps)}

      <div style={{display:"flex", gap:12, marginTop:12}}>
        <button onClick={logEntry} disabled={loading!==null}
          style={{padding:"10px 14px", border:"1px solid #ccc", borderRadius:8}}>
          {loading==="log" ? "Подтвердите..." : "Добавить запись"}
        </button>

        <button onClick={updateEntry} disabled={loading!==null}
          style={{padding:"10px 14px", border:"1px solid #ccc", borderRadius:8}}>
          {loading==="update" ? "Подтвердите..." : "Обновить запись"}
        </button>
      </div>
    </main>
  );
}
