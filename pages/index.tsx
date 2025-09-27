import { useState } from "react";
import { useWalletClient } from "wagmi";
import diaryAbi from "../abi/FitnessDiary.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function Home() {
  const { data: walletClient } = useWalletClient();

  const [weight, setWeight] = useState<number>(0);
  const [caloriesIn, setCaloriesIn] = useState<number>(0);
  const [caloriesOut, setCaloriesOut] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);

  const addEntry = async () => {
    if (!walletClient) {
      alert("Нет подключенного кошелька");
      return;
    }

    try {
      // текущая дата в формате YYYYMMDD
      const today = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: diaryAbi,
        functionName: "logEntry",
        args: [
          today,
          BigInt(weight),
          BigInt(caloriesIn),
          BigInt(caloriesOut),
          BigInt(steps),
        ],
      });

      console.log("txHash:", txHash);
      alert("Запись отправлена в блокчейн!");
    } catch (err: any) {
      console.error("Ошибка при добавлении записи:", err);
      alert("Ошибка при добавлении записи: " + err.message);
    }
  };

  return (
    <div>
      <h1>Fitness Diary</h1>
      <input
        type="number"
        placeholder="Вес (г)"
        onChange={(e) => setWeight(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Калории потребленные"
        onChange={(e) => setCaloriesIn(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Калории сожженные"
        onChange={(e) => setCaloriesOut(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Шаги"
        onChange={(e) => setSteps(Number(e.target.value))}
      />

      <button onClick={addEntry}>Добавить запись</button>
    </div>
  );
}
