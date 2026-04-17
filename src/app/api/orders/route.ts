import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id ?? null,
        total: body.product.price,
        currency: body.product.currency,
        customerName: body.customer.fullName,
        customerEmail: body.customer.email,
        street: body.customer.street,
        city: body.customer.city,
        postalCode: body.customer.postalCode,
        country: body.customer.country,
        notes: body.customer.notes ?? null,
        walletAddress: body.customer.walletAddress ?? null,
        productId: body.product.id,
        productName: body.product.name,
        productColor: body.product.color,
        productSize: body.product.size,
        nftName: body.nft.name,
        nftCollection: body.nft.collection,
        nftContract: body.nft.contract,
        nftTokenId: body.nft.tokenId,
        nftImage: body.nft.image,
        nftChainId: body.nft.chainId,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
