// hooks/useDiaryContract.ts
import { ethers } from "ethers";
import abi from "../abi/FitnessDiary.json";
import addressJson from "../abi/FitnessDiary.address.json";

export async function getDiaryContract() {
  if (typeof window === "undefined" || !(window as any).ethereum)
    throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(addressJson.address, abi, signer);

  return { provider, signer, contract };
}
