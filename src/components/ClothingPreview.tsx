'use client';

import type { GarmentType } from '@/lib/products';

interface ClothingMockupProps {
  type: GarmentType;
  color: string;
  nftImage: string | null;
  size?: 'sm' | 'md' | 'lg';
}

// Embroidery zone: center chest area in SVG coordinate space
const EMBROIDERY_ZONES = {
  hoodie: { x: 145, y: 155, w: 110, h: 110 },
  tshirt: { x: 145, y: 130, w: 110, h: 110 },
};

function HoodieSVG({ color, nftImage }: { color: string; nftImage: string | null }) {
  const zone = EMBROIDERY_ZONES.hoodie;
  const isDark = color === '#1a1a1a' || color === '#1e3a5f' || color === '#1a3a2a';
  const strokeColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
  const shadowColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)';

  return (
    <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <clipPath id="hoodie-body-clip">
          <path d="M90,130 L60,200 L20,180 L10,320 L80,330 L80,440 L320,440 L320,330 L390,320 L380,180 L340,200 L310,130 Q270,110 250,80 Q240,60 220,55 L200,60 L180,55 Q160,60 150,80 Q130,110 90,130 Z" />
        </clipPath>
        <filter id="fabric-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={shadowColor} />
        </filter>
        <radialGradient id="hoodie-shine" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity={isDark ? '0.06' : '0.12'} />
          <stop offset="100%" stopColor="black" stopOpacity={isDark ? '0.08' : '0.04'} />
        </radialGradient>
      </defs>

      {/* Left sleeve */}
      <path
        d="M90,130 L60,200 L20,180 L30,100 L90,130 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        filter="url(#fabric-shadow)"
      />
      {/* Right sleeve */}
      <path
        d="M310,130 L340,200 L380,180 L370,100 L310,130 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        filter="url(#fabric-shadow)"
      />

      {/* Main body */}
      <path
        d="M90,130 L80,440 L320,440 L310,130 Q270,110 250,80 Q240,60 220,55 L200,60 L180,55 Q160,60 150,80 Q130,110 90,130 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        filter="url(#fabric-shadow)"
      />

      {/* Left cuff */}
      <path
        d="M10,320 L80,330 L80,355 L8,344 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1"
        opacity="0.85"
      />
      {/* Right cuff */}
      <path
        d="M390,320 L320,330 L320,355 L392,344 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1"
        opacity="0.85"
      />

      {/* Kangaroo pocket */}
      <path
        d="M145,320 Q140,370 155,390 L245,390 Q260,370 255,320 Z"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />

      {/* Hood */}
      <path
        d="M140,70 Q130,20 180,10 L200,8 L220,10 Q270,20 260,70 Q240,55 220,52 L200,56 L180,52 Q160,55 140,70 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <path
        d="M155,65 Q150,30 180,18 L200,16 L220,18 Q250,30 245,65"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
      />

      {/* Drawstrings */}
      <line x1="190" y1="62" x2="182" y2="90" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="210" y1="62" x2="218" y2="90" stroke={strokeColor} strokeWidth="1.5" />

      {/* Shine overlay */}
      <path
        d="M90,130 L80,440 L320,440 L310,130 Q270,110 250,80 Q240,60 220,55 L200,60 L180,55 Q160,60 150,80 Q130,110 90,130 Z"
        fill="url(#hoodie-shine)"
        clipPath="url(#hoodie-body-clip)"
      />

      {/* Bottom ribbing */}
      {[430, 435, 440].map((y) => (
        <line
          key={y}
          x1="80"
          y1={y}
          x2="320"
          y2={y}
          stroke={strokeColor}
          strokeWidth="1"
        />
      ))}

      {/* Embroidery zone */}
      {nftImage ? (
        <>
          <defs>
            <clipPath id="emb-clip-hoodie">
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="4" />
            </clipPath>
          </defs>
          {/* NFT image */}
          <image
            href={nftImage}
            x={zone.x}
            y={zone.y}
            width={zone.w}
            height={zone.h}
            clipPath="url(#emb-clip-hoodie)"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.9"
          />
          {/* Stitch border */}
          <rect
            x={zone.x - 3}
            y={zone.y - 3}
            width={zone.w + 6}
            height={zone.h + 6}
            rx="6"
            fill="none"
            stroke="rgba(245,158,11,0.7)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </>
      ) : (
        /* Placeholder zone */
        <>
          <rect
            x={zone.x}
            y={zone.y}
            width={zone.w}
            height={zone.h}
            rx="4"
            fill="rgba(245,158,11,0.05)"
          />
          <rect
            x={zone.x - 3}
            y={zone.y - 3}
            width={zone.w + 6}
            height={zone.h + 6}
            rx="6"
            fill="none"
            stroke="rgba(245,158,11,0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={zone.x + zone.w / 2}
            y={zone.y + zone.h / 2 - 8}
            textAnchor="middle"
            fill="rgba(245,158,11,0.5)"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            Your
          </text>
          <text
            x={zone.x + zone.w / 2}
            y={zone.y + zone.h / 2 + 6}
            textAnchor="middle"
            fill="rgba(245,158,11,0.5)"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            NFT here
          </text>
        </>
      )}
    </svg>
  );
}

function TShirtSVG({ color, nftImage }: { color: string; nftImage: string | null }) {
  const zone = EMBROIDERY_ZONES.tshirt;
  const isDark = color === '#1a1a1a' || color === '#1e3a5f' || color === '#1a3a2a' || color === '#6b7280';
  const strokeColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
  const shadowColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)';

  return (
    <svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="tshirt-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={shadowColor} />
        </filter>
        <radialGradient id="tshirt-shine" cx="40%" cy="25%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity={isDark ? '0.06' : '0.12'} />
          <stop offset="100%" stopColor="black" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Left sleeve */}
      <path
        d="M110,80 L50,160 L90,180 L130,120 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        filter="url(#tshirt-shadow)"
      />
      {/* Right sleeve */}
      <path
        d="M290,80 L350,160 L310,180 L270,120 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        filter="url(#tshirt-shadow)"
      />

      {/* Main body */}
      <path
        d="M110,80 Q80,80 80,420 L320,420 Q320,80 290,80 Q250,100 200,100 Q150,100 110,80 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
        filter="url(#tshirt-shadow)"
      />

      {/* Collar */}
      <path
        d="M110,80 Q130,55 160,50 Q180,46 200,46 Q220,46 240,50 Q270,55 290,80 Q260,90 200,92 Q140,90 110,80 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Collar inner */}
      <path
        d="M135,78 Q155,62 200,60 Q245,62 265,78"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
      />

      {/* Shoulder seams */}
      <line x1="110" y1="80" x2="90" y2="180" stroke={strokeColor} strokeWidth="1" />
      <line x1="290" y1="80" x2="310" y2="180" stroke={strokeColor} strokeWidth="1" />

      {/* Shine overlay */}
      <path
        d="M110,80 Q80,80 80,420 L320,420 Q320,80 290,80 Q250,100 200,100 Q150,100 110,80 Z"
        fill="url(#tshirt-shine)"
      />

      {/* Bottom hem */}
      {[414, 420].map((y) => (
        <line key={y} x1="82" y1={y} x2="318" y2={y} stroke={strokeColor} strokeWidth="1" />
      ))}

      {/* Embroidery zone */}
      {nftImage ? (
        <>
          <defs>
            <clipPath id="emb-clip-tshirt">
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="4" />
            </clipPath>
          </defs>
          <image
            href={nftImage}
            x={zone.x}
            y={zone.y}
            width={zone.w}
            height={zone.h}
            clipPath="url(#emb-clip-tshirt)"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.9"
          />
          <rect
            x={zone.x - 3}
            y={zone.y - 3}
            width={zone.w + 6}
            height={zone.h + 6}
            rx="6"
            fill="none"
            stroke="rgba(245,158,11,0.7)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </>
      ) : (
        <>
          <rect
            x={zone.x}
            y={zone.y}
            width={zone.w}
            height={zone.h}
            rx="4"
            fill="rgba(245,158,11,0.05)"
          />
          <rect
            x={zone.x - 3}
            y={zone.y - 3}
            width={zone.w + 6}
            height={zone.h + 6}
            rx="6"
            fill="none"
            stroke="rgba(245,158,11,0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={zone.x + zone.w / 2}
            y={zone.y + zone.h / 2 - 8}
            textAnchor="middle"
            fill="rgba(245,158,11,0.5)"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            Your
          </text>
          <text
            x={zone.x + zone.w / 2}
            y={zone.y + zone.h / 2 + 6}
            textAnchor="middle"
            fill="rgba(245,158,11,0.5)"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            NFT here
          </text>
        </>
      )}
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
