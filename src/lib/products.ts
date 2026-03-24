export type GarmentType = 'hoodie' | 'tshirt';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  description: string;
  details: string[];
  sizes: string[];
  colors: ProductColor[];
  type: GarmentType;
  badge?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'hoodie',
    name: 'Premium Embroidered Hoodie',
    tagline: 'Your NFT. Your Hoodie.',
    price: 149,
    currency: 'EUR',
    description:
      'Heavyweight 400gsm organic cotton hoodie with your NFT precision-embroidered on the chest. Each piece is hand-crafted and one-of-a-kind.',
    details: [
      '400gsm organic cotton fleece',
      'High-density embroidery (up to 15,000 stitches)',
      'Unisex relaxed fit',
      'Ribbed cuffs and hem',
      'Double-lined hood',
      'Certificate of authenticity included',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'White', hex: '#f0f0f0' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Forest', hex: '#1a3a2a' },
    ],
    type: 'hoodie',
    badge: 'Best Seller',
  },
  {
    id: 'tshirt',
    name: 'Premium Embroidered T-Shirt',
    tagline: 'Wear your collection.',
    price: 89,
    currency: 'EUR',
    description:
      'Premium 220gsm Pima cotton t-shirt with your NFT beautifully embroidered. Soft, durable, and uniquely yours.',
    details: [
      '220gsm Pima cotton',
      'High-density embroidery (up to 10,000 stitches)',
      'Regular fit',
      'Pre-shrunk fabric',
      'Reinforced collar',
      'Certificate of authenticity included',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'White', hex: '#f0f0f0' },
      { name: 'Grey', hex: '#6b7280' },
      { name: 'Cream', hex: '#f5f0e8' },
    ],
    type: 'tshirt',
  },
];

export const CHAIN_OPTIONS = [
  { id: 1, name: 'Ethereum', icon: '⟠' },
  { id: 137, name: 'Polygon', icon: '⬡' },
  { id: 8453, name: 'Base', icon: '🔵' },
  { id: 42161, name: 'Arbitrum', icon: '🔷' },
];
