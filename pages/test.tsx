import { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/FitnessDiary.json";

const CONTRACT_ADDRESS = "ТВОЙ_АДРЕС_КОНТРАКТА"; // вставь адрес из Remix-деплоя

export default function TestPage() {
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");
  const [caloriesIn, setCaloriesIn] = useState("");
  const [caloriesOut, setCaloriesOut] = useState("");
  const [steps, setSteps] = useState("");
  const [entry, setEntry] = useState<any>(null);

  async function logEntry() {
    if (!window.ethereum) return alert("MetaMask не найден");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    try {
      const tx = await contract.logEntry(
        Number(date),
        Number(weight),
        Number(caloriesIn),
        Number(caloriesOut),
        Number(steps)
      );
      await tx.wait();
      alert("Запись успешно добавлена!");
    } catch (err: any) {
      console.error(err);
      alert("Ошибка: " + (err.message || err));
    }
  }

  async function getEntry() {
    if (!window.ethereum) return alert("MetaMask не найден");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    try {
      const user = await signer.getAddress();
      const result = await contract.getEntry(user, Number(date));
      setEntry(result);
    } catch (err: any) {
      console.error(err);
      alert("Ошибка: " + (err.message || err));
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Fitness Diary Test</h1>

      <div>
        <label>Дата (YYYYMMDD): </label>
        <input value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div>
        <label>Вес (граммы): </label>
        <input value={weight} onChange={e => setWeight(e.target.value)} />
      </div>

      <div>
        <label>Калории In: </label>
        <input value={caloriesIn} onChange={e => setCaloriesIn(e.target.value)} />
      </div>

      <div>
        <label>Калории Out: </label>
        <input value={caloriesOut} onChange={e => setCaloriesOut(e.target.value)} />
      </div>

      <div>
        <label>Шаги: </label>
        <input value={steps} onChange={e => setSteps(e.target.value)} />
      </div>

      <button onClick={logEntry} style={{ marginTop: 10 }}>Log Entry</button>
      <button onClick={getEntry} style={{ marginTop: 10, marginLeft: 10 }}>Get Entry</button>

      {entry && (
        <div style={{ marginTop: 20 }}>
          <h2>Запись:</h2>
          <pre>{JSON.stringify(entry, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
