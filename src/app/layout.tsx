import type { Metadata } from 'next';
import { Web3Provider } from '@/providers/Web3Provider';
import { SessionProvider } from '@/providers/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'On Chain Drip — NFT Embroidered Clothing',
  description: 'Connect your crypto wallet, select any NFT you own, and get it precision-embroidered on premium hoodies and t-shirts.',
  keywords: 'NFT, embroidery, hoodie, t-shirt, crypto, web3, custom clothing, on chain drip',
  openGraph: {
    title: 'On Chain Drip — NFT Embroidered Clothing',
    description: 'Wear your NFT. Connect wallet, choose your NFT, order premium embroidered clothing.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <Web3Provider>{children}</Web3Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
