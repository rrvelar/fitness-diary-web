import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

// ✅ Берём правильный ключ из переменной окружения
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

if (!alchemyKey) {
  console.warn("⚠️ NEXT_PUBLIC_ALCHEMY_API_KEY не задан! Запросы к Alchemy будут падать.")
}

export const publicClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`),
})
