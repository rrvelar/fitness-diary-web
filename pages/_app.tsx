// pages/_app.tsx
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

// ⛔ ВАЖНО: импортируем Providers динамически без SSR
const Providers = dynamic(() => import('../components/providers').then(mod => mod.Providers), {
  ssr: false,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
