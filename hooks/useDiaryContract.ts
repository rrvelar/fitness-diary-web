import { ethers } from "ethers";
import abi from "../abi/FitnessDiary.json";
import addressJson from "../abi/FitnessDiary.address.json";

export function useDiaryContract() {
  if (!window.ethereum) throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(addressJson.address, abi, signer);

  return contract;
}
