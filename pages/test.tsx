"use client";

import { useState } from "react";
import { ethers } from "ethers";

// Импортируем ABI и адрес контракта
import abi from "../abi/FitnessDiary.abi.json";
import address from "../abi/FitnessDiary.address.json";

export default function TestPage() {
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");
  const [caloriesIn, setCaloriesIn] = useState("");
  const [caloriesOut, setCaloriesOut] = useState("");
  const [steps, setSteps] = useState("");
  const [result, setResult] = useState("");

  // Подключение к контракту
  async function getContract() {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi, signer);
  }

  // Логируем запись
  async function logEntry() {
    try {
      const contract = await getContract();
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
      alert("Ошибка: " + err.message);
    }
  }

  // Получаем запись
  async function getEntry() {
    try {
      const contract = await getContract();
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const user = await signer.getAddress();
      const entry = await contract.getEntry(user, Number(date));
      setResult(JSON.stringify(entry));
    } catch (err: any) {
      alert("Ошибка: " + err.message);
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

      {result && (
        <div>
          <h3>Результат:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
