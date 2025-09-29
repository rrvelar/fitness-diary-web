// lib/farcaster.ts
export const isFarcasterMini = () =>
  typeof window !== "undefined" && !!window.farcaster;

export async function fcGetAccounts(): Promise<string[]> {
  if (!isFarcasterMini()) return [];
  return (await window.farcaster!.wallet?.getAccounts?.()) ?? [];
}

export async function fcSendTx(args: {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: `0x${string}`;
}): Promise<`0x${string}`> {
  if (!isFarcasterMini()) throw new Error("Not in Farcaster Mini");
  const hash = await window.farcaster!.wallet!.sendTransaction(args);
  return hash;
}

export async function fcSignTypedData(typedData: unknown) {
  if (!isFarcasterMini()) throw new Error("Not in Farcaster Mini");
  return window.farcaster!.wallet!.signTypedData(typedData);
}
