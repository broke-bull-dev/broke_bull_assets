export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect Your Wallet',
      description:
        'Use MetaMask, WalletConnect, Coinbase Wallet, or any Web3 wallet. We support Ethereum, Polygon, Base, and Arbitrum.',
      icon: '🔗',
    },
    {
      number: '02',
      title: 'Choose a Garment',
      description:
        'Select from our premium hoodie or t-shirt. Pick your size and color. All items are made from high-quality materials.',
      icon: '👕',
    },
    {
      number: '03',
      title: 'Select Your NFT',
      description:
        'Browse your entire NFT collection. Pick the one you want embroidered. See it previewed on your garment in real time.',
      icon: '🖼️',
    },
    {
      number: '04',
      title: 'Place Your Order',
      description:
        'Fill in your shipping details. We hand-craft your item with precision embroidery and ship it worldwide within 2-3 weeks.',
      icon: '📦',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            How It <span className="gold-text">Works</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From wallet to wardrobe in four simple steps. Each piece is hand-crafted with care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gold-500/30 to-transparent z-0" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center p-6 bg-dark-700 rounded-2xl border border-dark-500 hover:border-gold-500/30 transition-colors">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-gold-500 text-sm font-bold tracking-widest mb-2">
                  {step.number}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
