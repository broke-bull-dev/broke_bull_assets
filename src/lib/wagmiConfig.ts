import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, base, arbitrum } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Broke Bull Store',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'broke-bull-nft-store',
  chains: [mainnet, polygon, base, arbitrum],
  ssr: true,
});
