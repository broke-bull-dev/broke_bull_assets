'use client';

import { useState } from 'react';
import { X, CheckCircle, Loader } from 'lucide-react';
import type { Product, ProductColor } from '@/lib/products';
import type { NFT } from '@/lib/fetchNFTs';

interface Props {
  product: Product;
  selectedNFT: NFT;
  selectedColor: ProductColor;
  selectedSize: string;
  walletAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderForm {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

const INITIAL_FORM: OrderForm = {
  fullName: '',
  email: '',
  street: '',
  city: '',
  postalCode: '',
  country: '',
  notes: '',
};

export function OrderModal({
  product,
  selectedNFT,
  selectedColor,
  selectedSize,
  walletAddress,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<OrderForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof OrderForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            color: selectedColor.name,
            size: selectedSize,
          },
          nft: {
            name: selectedNFT.name,
            collection: selectedNFT.collection,
            contract: selectedNFT.contract,
            tokenId: selectedNFT.tokenId,
            image: selectedNFT.image,
            chainId: selectedNFT.chainId,
          },
          customer: {
            ...form,
            walletAddress,
          },
        }),
      });

      if (!res.ok) throw new Error('Order submission failed');
      setSuccess(true);
      setTimeout(() => onSuccess(), 3000);
    } catch {
      setError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors';

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg bg-dark-800 border border-dark-500 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-dark-500 sticky top-0 bg-dark-800 z-10">
            <h2 className="text-white font-bold text-lg">Complete Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {success ? (
            <div className="p-10 flex flex-col items-center text-center gap-4">
              <CheckCircle className="text-gold-500 w-16 h-16" />
              <h3 className="text-white font-black text-2xl">Order Received!</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                We'll be in touch at <span className="text-white">{form.email}</span> to confirm your
                order and start crafting your embroidered garment.
              </p>
              <p className="text-gray-500 text-xs">Delivery: 2–3 weeks worldwide</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Order summary */}
              <div className="bg-dark-700 rounded-xl p-4 border border-dark-500">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
                  Order Summary
                </p>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{product.name}</span>
                  <span className="text-white font-semibold">€{product.price}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{selectedColor.name}</span>
                  <span>·</span>
                  <span>Size {selectedSize}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-dark-500">
                  <p className="text-xs text-gray-400 mb-1">NFT to embroider:</p>
                  <p className="text-white text-sm font-medium">{selectedNFT.name}</p>
                  <p className="text-gray-500 text-xs">{selectedNFT.collection}</p>
                </div>
              </div>

              {/* Customer details */}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
                  Your Details
                </p>
                <div className="space-y-2.5">
                  <input
                    required
                    type="text"
                    placeholder="Full name"
                    value={form.fullName}
                    onChange={set('fullName')}
                    className={inputClass}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={set('email')}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
                  Shipping Address
                </p>
                <div className="space-y-2.5">
                  <input
                    required
                    type="text"
                    placeholder="Street address"
                    value={form.street}
                    onChange={set('street')}
                    className={inputClass}
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      required
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={set('city')}
                      className={inputClass}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Postal code"
                      value={form.postalCode}
                      onChange={set('postalCode')}
                      className={inputClass}
                    />
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="Country"
                    value={form.country}
                    onChange={set('country')}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <textarea
                  placeholder="Special instructions (optional)"
                  value={form.notes}
                  onChange={set('notes')}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Wallet */}
              <div className="bg-dark-700 rounded-lg px-3 py-2.5 border border-dark-500">
                <p className="text-xs text-gray-500 mb-0.5">Connected wallet (proof of ownership)</p>
                <p className="text-xs text-gray-300 font-mono break-all">{walletAddress}</p>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gold bg-gold-500 hover:bg-gold-600 text-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order — €${product.price}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                We'll email you a payment link and order confirmation. Ships in 2–3 weeks.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
