import { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/FitnessDiary.json";
import address from "../abi/FitnessDiary.address.json"; // строка с адресом контракта

export default function TestPage() {
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");
  const [caloriesIn, setCaloriesIn] = useState("");
  const [caloriesOut, setCaloriesOut] = useState("");
  const [steps, setSteps] = useState("");
  const [entry, setEntry] = useState<any>(null);

  async function getContract() {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi, signer);
  }

  async function logEntry() {
    try {
      const contract = await getContract();
      const tx = await contract.logEntry(
        parseInt(date),
        parseInt(weight),
        parseInt(caloriesIn),
        parseInt(caloriesOut),
        parseInt(steps)
      );
      await tx.wait();
      alert("✅ Entry logged!");
    } catch (err: any) {
      alert("Ошибка: " + err.message);
      console.error(err);
    }
  }

  async function getEntry() {
    try {
      const contract = await getContract();
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const user = await signer.getAddress();
      const data = await contract.getEntry(user, parseInt(date));
      setEntry(data);
    } catch (err: any) {
      alert("Ошибка: " + err.message);
      console.error(err);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Fitness Diary Test</h1>

      <div>
        <label>Дата (YYYYMMDD): </label>
        <input value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label>Вес (граммы): </label>
        <input value={weight} onChange={(e) => setWeight(e.target.value)} />
      </div>
      <div>
        <label>Калории In: </label>
        <input value={caloriesIn} onChange={(e) => setCaloriesIn(e.target.value)} />
      </div>
      <div>
        <label>Калории Out: </label>
        <input value={caloriesOut} onChange={(e) => setCaloriesOut(e.target.value)} />
      </div>
      <div>
        <label>Шаги: </label>
        <input value={steps} onChange={(e) => setSteps(e.target.value)} />
      </div>

      <button onClick={logEntry}>Log Entry</button>
      <button onClick={getEntry}>Get Entry</button>

      {entry && (
        <div style={{ marginTop: "20px" }}>
          <h3>📖 Данные из блокчейна:</h3>
          <pre>{JSON.stringify(entry, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
