import Image from 'next/image';

export function Footer() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@onchaindip.store';

  return (
    <footer className="bg-dark-900 border-t border-dark-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/LOGO_COIN_METADATA.png"
                alt="On Chain Drip"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <div>
              <span className="text-white font-bold">ON CHAIN</span>
              <span className="text-gold-500 font-bold"> DRIP</span>
            </div>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Premium NFT embroidered clothing. Ships worldwide.</p>
            <p className="mt-1">
              Questions?{' '}
              <a href={`mailto:${contactEmail}`} className="text-gold-500 hover:underline">
                {contactEmail}
              </a>
            </p>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-600 text-center md:text-right max-w-xs">
            <p>All NFT art is owned by the customer.</p>
            <p className="mt-1">© {new Date().getFullYear()} On Chain Drip</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
