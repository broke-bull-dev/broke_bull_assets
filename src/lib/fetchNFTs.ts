import { Alchemy, Network } from 'alchemy-sdk';

export interface NFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  contract: string;
  chainId: number;
}

const CHAIN_TO_NETWORK: Record<number, Network> = {
  1: Network.ETH_MAINNET,
  137: Network.MATIC_MAINNET,
  8453: Network.BASE_MAINNET,
  42161: Network.ARB_MAINNET,
};

function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  if (url.startsWith('ar://')) {
    return url.replace('ar://', 'https://arweave.net/');
  }
  return url;
}

export async function fetchNFTs(address: string, chainId: number = 1): Promise<NFT[]> {
  const network = CHAIN_TO_NETWORK[chainId] || Network.ETH_MAINNET;
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  if (!apiKey || apiKey === 'your_alchemy_api_key_here') {
    console.warn('No Alchemy API key configured. Set NEXT_PUBLIC_ALCHEMY_API_KEY in .env.local');
    return [];
  }

  const alchemy = new Alchemy({ apiKey, network });

  try {
    const response = await alchemy.nft.getNftsForOwner(address, {
      omitMetadata: false,
      pageSize: 100,
    });

    return response.ownedNfts
      .map((nft) => {
        const image =
          resolveImageUrl(nft.image?.cachedUrl) ||
          resolveImageUrl(nft.image?.originalUrl) ||
          resolveImageUrl(nft.image?.thumbnailUrl) ||
          '';
        return {
          tokenId: nft.tokenId,
          name: nft.name || `#${nft.tokenId}`,
          description: nft.description || '',
          image,
          collection: nft.contract.name || 'Unknown Collection',
          contract: nft.contract.address,
          chainId,
        };
      })
      .filter((nft) => nft.image !== '');
  } catch (error) {
    console.error('Failed to fetch NFTs:', error);
    return [];
  }
}
