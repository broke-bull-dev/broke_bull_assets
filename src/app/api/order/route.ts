import { NextRequest, NextResponse } from 'next/server';

interface OrderPayload {
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    color: string;
    size: string;
  };
  nft: {
    name: string;
    collection: string;
    contract: string;
    tokenId: string;
    image: string;
    chainId: number;
  };
  customer: {
    fullName: string;
    email: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    notes: string;
    walletAddress: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderPayload = await req.json();

    // Validate required fields
    const { product, nft, customer } = body;
    if (!product || !nft || !customer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!customer.email || !customer.fullName || !customer.street || !customer.country) {
      return NextResponse.json({ error: 'Incomplete customer details' }, { status: 400 });
    }

    const orderId = `BB-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const order = {
      orderId,
      timestamp,
      ...body,
    };

    // Log order (replace with DB or email service in production)
    console.log('=== NEW ORDER ===');
    console.log(JSON.stringify(order, null, 2));
    console.log('================');

    // Optional: Send email notification via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await sendOrderEmail(resendKey, order);
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
        // Don't fail the order if email fails
      }
    }

    return NextResponse.json({ success: true, orderId }, { status: 201 });
  } catch (err) {
    console.error('Order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendOrderEmail(apiKey: string, order: ReturnType<typeof buildOrder>) {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'orders@brokebull.store';

  const html = `
    <h2>New Broke Bull Store Order: ${order.orderId}</h2>
    <hr />
    <h3>Product</h3>
    <p>${order.product.name} — ${order.product.color} / ${order.product.size}</p>
    <p>Price: ${order.product.currency} ${order.product.price}</p>
    <hr />
    <h3>NFT to Embroider</h3>
    <p>${order.nft.name} (${order.nft.collection})</p>
    <p>Contract: ${order.nft.contract} #${order.nft.tokenId}</p>
    ${order.nft.image ? `<img src="${order.nft.image}" width="150" />` : ''}
    <hr />
    <h3>Customer</h3>
    <p>${order.customer.fullName} &lt;${order.customer.email}&gt;</p>
    <p>${order.customer.street}, ${order.customer.city} ${order.customer.postalCode}, ${order.customer.country}</p>
    <p>Wallet: ${order.customer.walletAddress}</p>
    ${order.customer.notes ? `<p>Notes: ${order.customer.notes}</p>` : ''}
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'orders@brokebull.store',
      to: contactEmail,
      subject: `New Order ${order.orderId} — ${order.product.name}`,
      html,
    }),
  });
}

// Helper type
function buildOrder(o: object) { return o as OrderPayload & { orderId: string; timestamp: string }; }
void buildOrder;
