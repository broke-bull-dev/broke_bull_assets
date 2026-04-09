import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, base, arbitrum } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'On Chain Drip',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'on-chain-drip',
  chains: [mainnet, polygon, base, arbitrum],
  ssr: true,
});
