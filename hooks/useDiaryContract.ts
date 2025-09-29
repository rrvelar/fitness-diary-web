// hooks/useDiaryContract.ts
import { ethers } from "ethers";
import abi from "../abi/FitnessDiary.json";
import addressJson from "../abi/FitnessDiary.address.json";

export async function getDiaryContract() {
  if (typeof window === "undefined") throw new Error("No window object");

  // 🚀 Вариант 1: Warpcast Mini (Farcaster встроенный кошелёк)
  if ((window as any).farcaster?.wallet) {
    return {
      provider: null,
      signer: null,
      contract: {
        // только "заглушка": запись делается напрямую через frame.tsx
        address: addressJson.address,
        abi,
      },
      isFarcaster: true,
    };
  }

  // 🌍 Вариант 2: Обычный сайт (MetaMask / WalletConnect)
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not detected");
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(addressJson.address, abi, signer);

  return { provider, signer, contract, isFarcaster: false };
}
