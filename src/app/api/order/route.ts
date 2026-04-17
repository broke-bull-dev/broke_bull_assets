import { NextRequest, NextResponse } from 'next/server';

interface OrderPayload {
  product: { id: string; name: string; price: number; currency: string; color: string; size: string };
  nft: { name: string; collection: string; contract: string; tokenId: string; image: string; chainId: number };
  customer: { fullName: string; email: string; street: string; city: string; postalCode: string; country: string; notes: string; walletAddress: string };
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderPayload = await req.json();
    const { product, nft, customer } = body;
    if (!product || !nft || !customer) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const orderId = `OCD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order = { orderId, timestamp: new Date().toISOString(), ...body };

    console.log('=== NEW ORDER ===');
    console.log(JSON.stringify(order, null, 2));

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'orders@onchaindip.store';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'orders@onchaindip.store',
          to: contactEmail,
          subject: `New Order ${orderId} — ${product.name}`,
          html: `<h2>New On Chain Drip Order: ${orderId}</h2><p>${product.name} — ${product.color} / ${product.size}</p><p>NFT: ${nft.name} (${nft.collection})</p><p>Customer: ${customer.fullName} &lt;${customer.email}&gt;</p>`,
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, orderId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
