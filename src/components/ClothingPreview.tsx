'use client';

import type { GarmentType } from '@/lib/products';

interface ClothingMockupProps {
  type: GarmentType;
  color: string;
  nftImage: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const EMBROIDERY_ZONES = {
  hoodie: { x: 150, y: 170, w: 100, h: 100 },
  tshirt: { x: 150, y: 148, w: 100, h: 100 },
};

function EmbroideryZone({
  zone,
  nftImage,
  clipId,
}: {
  zone: { x: number; y: number; w: number; h: number };
  nftImage: string | null;
  clipId: string;
}) {
  if (nftImage) {
    return (
      <>
        <defs>
          <clipPath id={clipId}>
            <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="6" />
          </clipPath>
        </defs>
        <image
          href={nftImage}
          x={zone.x}
          y={zone.y}
          width={zone.w}
          height={zone.h}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
          opacity="0.92"
        />
        {/* Stitch border */}
        <rect
          x={zone.x - 4}
          y={zone.y - 4}
          width={zone.w + 8}
          height={zone.h + 8}
          rx="9"
          fill="none"
          stroke="rgba(245,158,11,0.75)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
      </>
    );
  }

  return (
    <>
      <rect
        x={zone.x}
        y={zone.y}
        width={zone.w}
        height={zone.h}
        rx="6"
        fill="rgba(245,158,11,0.06)"
      />
      <rect
        x={zone.x - 4}
        y={zone.y - 4}
        width={zone.w + 8}
        height={zone.h + 8}
        rx="9"
        fill="none"
        stroke="rgba(245,158,11,0.35)"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      {/* Crosshair */}
      <line
        x1={zone.x + zone.w / 2}
        y1={zone.y + 8}
        x2={zone.x + zone.w / 2}
        y2={zone.y + zone.h - 8}
        stroke="rgba(245,158,11,0.2)"
        strokeWidth="1"
      />
      <line
        x1={zone.x + 8}
        y1={zone.y + zone.h / 2}
        x2={zone.x + zone.w - 8}
        y2={zone.y + zone.h / 2}
        stroke="rgba(245,158,11,0.2)"
        strokeWidth="1"
      />
      <text
        x={zone.x + zone.w / 2}
        y={zone.y + zone.h / 2 + 18}
        textAnchor="middle"
        fill="rgba(245,158,11,0.45)"
        fontSize="9"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
        letterSpacing="0.05em"
      >
        YOUR NFT
      </text>
    </>
  );
}

function HoodieSVG({ color, nftImage }: { color: string; nftImage: string | null }) {
  const zone = EMBROIDERY_ZONES.hoodie;
  const isLight = color === '#f0f0f0' || color === '#f5f0e8';
  const shade = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  const stroke = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)';
  const deep = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.25)';

  return (
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
      <defs>
        <linearGradient id={`hg-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      {/* ── Left sleeve ── */}
      <path
        d="M138,112 L62,168 L48,236 L68,242 L94,182 L114,148 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Left sleeve cuff */}
      <path
        d="M48,236 L68,242 L66,258 L44,252 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Sleeve seam */}
      <line x1="94" y1="182" x2="68" y2="242" stroke={deep} strokeWidth="1" />

      {/* ── Right sleeve ── */}
      <path
        d="M262,112 L338,168 L352,236 L332,242 L306,182 L286,148 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Right sleeve cuff */}
      <path
        d="M352,236 L332,242 L334,258 L356,252 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Sleeve seam */}
      <line x1="306" y1="182" x2="332" y2="242" stroke={deep} strokeWidth="1" />

      {/* ── Body ── */}
      <path
        d="M114,148 L94,182 L80,450 L320,450 L306,182 L286,148 Q244,130 200,130 Q156,130 114,148 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />

      {/* Body gradient sheen */}
      <path
        d="M114,148 L94,182 L80,450 L320,450 L306,182 L286,148 Q244,130 200,130 Q156,130 114,148 Z"
        fill={`url(#hg-${color})`}
      />

      {/* Bottom hem ribbing */}
      <path d="M80,450 L320,450 L320,462 L80,462 Z" fill={color} stroke={stroke} strokeWidth="1" />
      <line x1="80" y1="454" x2="320" y2="454" stroke={shade} strokeWidth="1" />
      <line x1="80" y1="458" x2="320" y2="458" stroke={shade} strokeWidth="1" />

      {/* ── Hood ── */}
      {/* Hood back */}
      <path
        d="M148,128 Q138,72 160,42 Q178,18 200,16 Q222,18 240,42 Q262,72 252,128"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Hood inner shadow */}
      <path
        d="M158,126 Q150,78 168,52 Q182,32 200,30 Q218,32 232,52 Q250,78 242,126"
        fill={deep}
        opacity="0.5"
      />
      {/* Hood opening edge */}
      <path
        d="M148,128 Q158,118 200,116 Q242,118 252,128"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
      />

      {/* Drawstring channel */}
      <path
        d="M172,124 Q186,118 200,117 Q214,118 228,124"
        fill="none"
        stroke={shade}
        strokeWidth="1"
      />
      {/* Drawstrings */}
      <line x1="188" y1="119" x2="184" y2="148" stroke={shade} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="212" y1="119" x2="216" y2="148" stroke={shade} strokeWidth="1.5" strokeLinecap="round" />
      {/* Drawstring tips */}
      <circle cx="184" cy="150" r="3" fill={shade} />
      <circle cx="216" cy="150" r="3" fill={shade} />

      {/* Front zip / center seam */}
      <line x1="200" y1="148" x2="200" y2="450" stroke={shade} strokeWidth="0.75" strokeDasharray="3 4" />

      {/* Kangaroo pocket */}
      <path
        d="M148,338 Q144,380 152,400 L248,400 Q256,380 252,338 Z"
        fill="none"
        stroke={shade}
        strokeWidth="1.5"
      />
      <line x1="200" y1="338" x2="200" y2="400" stroke={shade} strokeWidth="1" />

      {/* Embroidery zone */}
      <EmbroideryZone zone={zone} nftImage={nftImage} clipId="emb-hoodie" />
    </svg>
  );
}

function TShirtSVG({ color, nftImage }: { color: string; nftImage: string | null }) {
  const zone = EMBROIDERY_ZONES.tshirt;
  const isLight = color === '#f0f0f0' || color === '#f5f0e8';
  const shade = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  const stroke = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)';
  const deep = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.25)';

  return (
    <svg viewBox="0 0 400 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
      <defs>
        <linearGradient id={`tg-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      {/* ── Left sleeve ── */}
      <path
        d="M136,82 L72,108 L52,168 L76,176 L104,128 L126,110 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Left sleeve hem */}
      <path d="M52,168 L76,176 L74,186 L50,178 Z" fill={color} stroke={stroke} strokeWidth="1" />
      <line x1="52" y1="172" x2="76" y2="180" stroke={shade} strokeWidth="1" />

      {/* ── Right sleeve ── */}
      <path
        d="M264,82 L328,108 L348,168 L324,176 L296,128 L274,110 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Right sleeve hem */}
      <path d="M348,168 L324,176 L326,186 L350,178 Z" fill={color} stroke={stroke} strokeWidth="1" />
      <line x1="348" y1="172" x2="324" y2="180" stroke={shade} strokeWidth="1" />

      {/* ── Body ── */}
      <path
        d="M126,110 L104,128 L84,432 L316,432 L296,128 L274,110 Q238,96 200,96 Q162,96 126,110 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />

      {/* Body gradient sheen */}
      <path
        d="M126,110 L104,128 L84,432 L316,432 L296,128 L274,110 Q238,96 200,96 Q162,96 126,110 Z"
        fill={`url(#tg-${color})`}
      />

      {/* Bottom hem */}
      <path d="M84,432 L316,432 L316,444 L84,444 Z" fill={color} stroke={stroke} strokeWidth="1" />
      <line x1="84" y1="436" x2="316" y2="436" stroke={shade} strokeWidth="1" />
      <line x1="84" y1="440" x2="316" y2="440" stroke={shade} strokeWidth="1" />

      {/* ── Collar — crew neck ── */}
      {/* Collar band */}
      <path
        d="M136,82 Q148,56 168,48 Q182,42 200,42 Q218,42 232,48 Q252,56 264,82 Q238,94 200,94 Q162,94 136,82 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Collar inner rim */}
      <path
        d="M148,80 Q160,62 178,56 Q188,52 200,52 Q212,52 222,56 Q240,62 252,80"
        fill="none"
        stroke={deep}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Collar top edge */}
      <path
        d="M148,80 Q174,90 200,90 Q226,90 252,80"
        fill="none"
        stroke={shade}
        strokeWidth="1"
      />

      {/* Shoulder seams */}
      <line x1="136" y1="82" x2="104" y2="128" stroke={deep} strokeWidth="1" />
      <line x1="264" y1="82" x2="296" y2="128" stroke={deep} strokeWidth="1" />

      {/* Side seams */}
      <line x1="104" y1="128" x2="84" y2="432" stroke={shade} strokeWidth="0.75" />
      <line x1="296" y1="128" x2="316" y2="432" stroke={shade} strokeWidth="0.75" />

      {/* Embroidery zone */}
      <EmbroideryZone zone={zone} nftImage={nftImage} clipId="emb-tshirt" />
    </svg>
  );
}

export function ClothingMockup({ type, color, nftImage, size = 'md' }: ClothingMockupProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-56 h-56',
    lg: 'w-72 h-72',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {type === 'hoodie' ? (
        <HoodieSVG color={color} nftImage={nftImage} />
      ) : (
        <TShirtSVG color={color} nftImage={nftImage} />
      )}
    </div>
  );
}
