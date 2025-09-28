// pages/test.tsx
import { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/FitnessDiary.json";
import addressJson from "../abi/FitnessDiary.address.json";

const contractAddress = addressJson.address;

export default function Test() {
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");
  const [caloriesIn, setCaloriesIn] = useState("");
  const [caloriesOut, setCaloriesOut] = useState("");
  const [steps, setSteps] = useState("");

  const connectContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  const logEntry = async () => {
    try {
      if (!date || !weight || !caloriesIn || !caloriesOut || !steps) {
        alert("Заполни все поля!");
        return;
      }

      const contract = await connectContract();
      const tx = await contract.logEntry(
        Number(date),
        Number(weight),
        Number(caloriesIn),
        Number(caloriesOut),
        Number(steps)
      );
      await tx.wait();
      alert("✅ Entry logged!");
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    }
  };

  const getEntry = async () => {
    try {
      if (!date) {
        alert("Введите дату!");
        return;
      }

      const contract = await connectContract();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];

      const entry = await contract.getEntry(account, Number(date));

      // Красиво форматируем вывод
      alert(`
📅 Date: ${entry.date}
⚖️ Weight: ${entry.weightGrams} g
🔥 Calories In: ${entry.caloriesIn}
🏃 Calories Out: ${entry.caloriesOut}
👟 Steps: ${entry.steps}
✅ Exists: ${entry.exists}
      `);
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    }
  };

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
    </div>
  );
}
