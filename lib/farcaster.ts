export const isFarcasterMini = () =>
  typeof window !== "undefined" && !!window.farcaster

export async function fcGetAccounts(): Promise<string[]> {
  if (!isFarcasterMini()) return []

  const accounts = await window.farcaster?.wallet?.getAccounts?.()
  return accounts ?? []
}

export async function fcSendTx(args: {
  to: `0x${string}`
  data?: `0x${string}`
  value?: `0x${string}`
}): Promise<`0x${string}`> {
  if (!isFarcasterMini()) {
    throw new Error("Not in Farcaster Mini")
  }

  if (!window.farcaster?.wallet?.sendTransaction) {
    throw new Error("Farcaster wallet.sendTransaction not available")
  }

  return await window.farcaster.wallet.sendTransaction(args)
}

export async function fcSignTypedData(typedData: unknown): Promise<`0x${string}`> {
  if (!isFarcasterMini()) {
    throw new Error("Not in Farcaster Mini")
  }

  if (!window.farcaster?.wallet?.signTypedData) {
    throw new Error("Farcaster wallet.signTypedData not available")
  }

  return await window.farcaster.wallet.signTypedData(typedData)
}
