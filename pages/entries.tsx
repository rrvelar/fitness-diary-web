import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import abi from "../abi/FitnessDiary.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DIARY_ADDRESS as `0x${string}`;

export default function Entries() {
  const { address, isConnected } = useAccount();
  const [dates, setDates] = useState<bigint[]>([]);
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getDates",
    args: address ? [address, 0n, 50n] : undefined, // 🔹 3 аргумента!
    query: { enabled: false },
  });

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      refetch()
        .then((res) => {
          if (res?.data) {
            setDates(res.data as bigint[]);
          }
        })
        .catch((err) => {
          console.error("Ошибка загрузки дат:", err);
          alert("Ошибка загрузки: " + (err as any).message);
        })
        .finally(() => setLoading(false));
    }
  }, [isConnected, address, refetch]);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Мои записи</h1>
      <p>Адрес: {address || "—"}</p>

      {loading ? (
        <p>Загрузка...</p>
      ) : dates.length > 0 ? (
        <ul>
          {dates.map((d, i) => (
            <li key={i}>{d.toString()}</li>
          ))}
        </ul>
      ) : (
        <p>Нет записей</p>
      )}
    </main>
  );
}
