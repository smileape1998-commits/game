import React from 'react';
import { CharacterRole } from '@hamster-coup/shared';

export const GoldenAcornIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`inline-block drop-shadow-md ${className}`}
  >
    <defs>
      <linearGradient id="acornGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="acornCap" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
    </defs>
    {/* Cap Stem */}
    <path d="M46,6 Q50,0 56,3 Q53,9 49,14" stroke="#78350F" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Cap Body */}
    <path d="M20,34 C20,16 80,16 80,34 C80,37 20,37 20,34 Z" fill="url(#acornCap)" />
    <circle cx="32" cy="25" r="3" fill="#B45309" opacity="0.6" />
    <circle cx="50" cy="22" r="3.5" fill="#B45309" opacity="0.6" />
    <circle cx="68" cy="25" r="3" fill="#B45309" opacity="0.6" />
    <circle cx="41" cy="31" r="3" fill="#B45309" opacity="0.6" />
    <circle cx="59" cy="31" r="3" fill="#B45309" opacity="0.6" />
    {/* Nut Shell Body */}
    <path d="M23,35 C23,64 42,92 50,95 C58,92 77,64 77,35 Z" fill="url(#acornGold)" stroke="#92400E" strokeWidth="2" />
    {/* Highlights */}
    <path d="M30,42 C28,52 33,68 38,75 C35,68 32,54 34,44 Z" fill="#FFFBEB" opacity="0.75" />
    <circle cx="60" cy="50" r="4" fill="#FEF08A" opacity="0.6" />
  </svg>
);

export const CharacterArtwork: React.FC<{
  role: CharacterRole;
  className?: string;
  size?: number;
}> = ({ role, className = '', size = 120 }) => {
  switch (role) {
    case 'duke':
      // The Duke - Royal Golden Hamster
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
          <defs>
            <radialGradient id="dukeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dukeBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="dukeMantle" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#dukeGlow)" />
          {/* Royal Velvet Mantle */}
          <path d="M45,130 C45,185 155,185 155,130 L145,115 L55,115 Z" fill="url(#dukeMantle)" stroke="#FEF08A" strokeWidth="2" />
          <ellipse cx="100" cy="130" rx="42" ry="12" fill="#FEF3C7" />
          {/* Hamster Body & Cheeks */}
          <ellipse cx="100" cy="118" rx="48" ry="46" fill="url(#dukeBody)" />
          <ellipse cx="72" cy="122" rx="14" ry="12" fill="#FDE68A" />
          <ellipse cx="128" cy="122" rx="14" ry="12" fill="#FDE68A" />
          {/* Ears */}
          <circle cx="66" cy="74" r="14" fill="#F59E0B" />
          <circle cx="66" cy="74" r="8" fill="#FCA5A5" />
          <circle cx="134" cy="74" r="14" fill="#F59E0B" />
          <circle cx="134" cy="74" r="8" fill="#FCA5A5" />
          {/* Eyes */}
          <ellipse cx="84" cy="104" rx="6" ry="8" fill="#1E293B" />
          <circle cx="82" cy="101" r="2.5" fill="#FFFFFF" />
          <ellipse cx="116" cy="104" rx="6" ry="8" fill="#1E293B" />
          <circle cx="114" cy="101" r="2.5" fill="#FFFFFF" />
          {/* Cute Nose & Mouth */}
          <polygon points="100,113 95,108 105,108" fill="#FB7185" />
          <path d="M95,115 Q100,119 105,115" stroke="#881337" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Royal Crown */}
          <path d="M74,72 L82,46 L92,62 L100,38 L108,62 L118,46 L126,72 Z" fill="#FACC15" stroke="#B45309" strokeWidth="2" />
          <circle cx="82" cy="45" r="3" fill="#EF4444" />
          <circle cx="100" cy="37" r="4" fill="#3B82F6" />
          <circle cx="118" cy="45" r="3" fill="#10B981" />
        </svg>
      );

    case 'assassin':
      // The Assassin - Hooded Shadow Hamster
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
          <defs>
            <radialGradient id="shadowGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cowlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#shadowGlow)" />
          {/* Hood Cloak */}
          <path d="M50,140 C40,190 160,190 150,140 L135,110 L65,110 Z" fill="#0F172A" />
          {/* Hood Head Cover */}
          <path d="M60,120 C50,60 70,40 100,35 C130,40 150,60 140,120 C130,135 70,135 60,120 Z" fill="url(#cowlGrad)" stroke="#2563EB" strokeWidth="1.5" />
          {/* Inner Shadowed Face */}
          <ellipse cx="100" cy="100" rx="32" ry="26" fill="#090D16" />
          {/* Glowing Assassin Eyes */}
          <path d="M78,98 Q88,96 92,102 Q84,103 78,98 Z" fill="#60A5FA" filter="drop-shadow(0 0 4px #93C5FD)" />
          <path d="M122,98 Q112,96 108,102 Q116,103 122,98 Z" fill="#60A5FA" filter="drop-shadow(0 0 4px #93C5FD)" />
          {/* Poison Dagger */}
          <path d="M135,145 L170,110 L165,105 L130,140 Z" fill="#94A3B8" stroke="#38BDF8" strokeWidth="1" />
          <polygon points="170,110 178,102 165,105" fill="#38BDF8" />
          <rect x="126" y="138" width="10" height="14" rx="2" transform="rotate(-45 131 145)" fill="#64748B" />
        </svg>
      );

    case 'captain':
      // The Captain - Mischievous Pirate Hamster
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
          <defs>
            <radialGradient id="pirateGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#083344" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="captainFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="60%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#pirateGlow)" />
          {/* Pirate Coat */}
          <path d="M48,135 C45,190 155,190 152,135 Z" fill="#0E7490" stroke="#0891B2" strokeWidth="2" />
          {/* Hamster Head */}
          <ellipse cx="100" cy="115" rx="46" ry="42" fill="url(#captainFur)" />
          {/* Ears */}
          <circle cx="68" cy="76" r="13" fill="#64748B" />
          <circle cx="68" cy="76" r="8" fill="#FCA5A5" />
          <circle cx="132" cy="76" r="13" fill="#64748B" />
          <circle cx="132" cy="76" r="8" fill="#FCA5A5" />
          {/* Eye Patch & Jolly Eye */}
          <ellipse cx="85" cy="106" rx="6" ry="8" fill="#0F172A" />
          <circle cx="83" cy="103" r="2.5" fill="#FFFFFF" />
          {/* Eye Patch on Right Eye */}
          <ellipse cx="115" cy="106" rx="9" ry="10" fill="#090D16" stroke="#475569" strokeWidth="1" />
          <line x1="98" y1="96" x2="136" y2="114" stroke="#090D16" strokeWidth="2" />
          {/* Snout & Smirk */}
          <polygon points="100,116 96,112 104,112" fill="#FB7185" />
          <path d="M96,120 Q105,124 109,118" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Pirate Hat (Tricorne) */}
          <path d="M50,78 Q100,42 150,78 Q120,60 100,62 Q80,60 50,78 Z" fill="#1E293B" stroke="#FACC15" strokeWidth="2" />
          <circle cx="100" cy="62" r="5" fill="#FACC15" />
        </svg>
      );

    case 'ambassador':
      // The Ambassador - Aristocratic Diplomat Hamster
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
          <defs>
            <radialGradient id="diploGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#022C22" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="diploFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#diploGlow)" />
          {/* Aristocratic Emerald Vest */}
          <path d="M48,135 C45,190 155,190 152,135 Z" fill="#047857" stroke="#10B981" strokeWidth="2" />
          {/* White Court Ruff Collar */}
          <ellipse cx="100" cy="132" rx="42" ry="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
          {/* Hamster Head */}
          <ellipse cx="100" cy="112" rx="46" ry="42" fill="url(#diploFur)" />
          {/* Ears */}
          <circle cx="68" cy="74" r="13" fill="#D97706" />
          <circle cx="68" cy="74" r="8" fill="#FCA5A5" />
          <circle cx="132" cy="74" r="13" fill="#D97706" />
          <circle cx="132" cy="74" r="8" fill="#FCA5A5" />
          {/* Monocle on Left Eye */}
          <circle cx="84" cy="104" r="9" fill="none" stroke="#FACC15" strokeWidth="2" />
          <line x1="84" y1="113" x2="90" y2="135" stroke="#FACC15" strokeWidth="1.5" />
          {/* Eyes */}
          <ellipse cx="84" cy="104" rx="5" ry="7" fill="#1E293B" />
          <circle cx="82" cy="102" r="2" fill="#FFFFFF" />
          <ellipse cx="116" cy="104" rx="5" ry="7" fill="#1E293B" />
          <circle cx="114" cy="102" r="2" fill="#FFFFFF" />
          {/* Diplomatic Scroll in hand */}
          <rect x="135" y="125" width="30" height="12" rx="3" fill="#FEF3C7" stroke="#B45309" strokeWidth="1" transform="rotate(-25 135 125)" />
          <circle cx="152" cy="120" r="3" fill="#DC2626" />
        </svg>
      );

    case 'contessa':
      // The Contessa - Royal Princess Hamster
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
          <defs>
            <radialGradient id="pinkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#500724" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="contessaFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1F2" />
              <stop offset="60%" stopColor="#FFE4E6" />
              <stop offset="100%" stopColor="#FECDD3" />
            </linearGradient>
            <linearGradient id="gownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DB2777" />
              <stop offset="100%" stopColor="#831843" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#pinkGlow)" />
          {/* Royal Silk Gown */}
          <path d="M48,132 C45,190 155,190 152,132 Z" fill="url(#gownGrad)" stroke="#F472B6" strokeWidth="2" />
          {/* Shield of Sanctuary */}
          <path d="M135,115 Q155,110 160,135 Q155,160 135,165 Z" fill="#FDF2F8" stroke="#DB2777" strokeWidth="2" />
          <circle cx="147" cy="138" r="4" fill="#DB2777" />
          {/* Head */}
          <ellipse cx="100" cy="114" rx="46" ry="42" fill="url(#contessaFur)" />
          {/* Rosy Cheeks */}
          <circle cx="72" cy="118" r="8" fill="#FDA4AF" opacity="0.7" />
          <circle cx="128" cy="118" r="8" fill="#FDA4AF" opacity="0.7" />
          {/* Ears */}
          <circle cx="68" cy="74" r="13" fill="#FECDD3" />
          <circle cx="68" cy="74" r="7" fill="#FB7185" />
          <circle cx="132" cy="74" r="13" fill="#FECDD3" />
          <circle cx="132" cy="74" r="7" fill="#FB7185" />
          {/* Big sparkly Anime eyes */}
          <ellipse cx="85" cy="104" rx="6.5" ry="9" fill="#831843" />
          <circle cx="83" cy="100" r="3" fill="#FFFFFF" />
          <circle cx="87" cy="107" r="1.5" fill="#FFFFFF" />
          <ellipse cx="115" cy="104" rx="6.5" ry="9" fill="#831843" />
          <circle cx="113" cy="100" r="3" fill="#FFFFFF" />
          <circle cx="117" cy="107" r="1.5" fill="#FFFFFF" />
          {/* Floral Tiara */}
          <path d="M78,75 Q100,65 122,75" stroke="#F472B6" strokeWidth="3" fill="none" />
          <circle cx="84" cy="74" r="4" fill="#F43F5E" />
          <circle cx="100" cy="70" r="5" fill="#E11D48" />
          <circle cx="116" cy="74" r="4" fill="#F43F5E" />
        </svg>
      );

    case 'inquisitor':
      // The Inquisitor - Scholarly Grey Hamster
      return (
        <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
          <defs>
            <radialGradient id="purpGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2E1065" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="inqFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="inqRobe" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#purpGlow)" />
          {/* Scholarly Robes */}
          <path d="M48,135 C45,190 155,190 152,135 Z" fill="url(#inqRobe)" stroke="#A855F7" strokeWidth="2" />
          {/* Head */}
          <ellipse cx="100" cy="115" rx="46" ry="42" fill="url(#inqFur)" />
          {/* Ears */}
          <circle cx="68" cy="76" r="13" fill="#94A3B8" />
          <circle cx="68" cy="76" r="8" fill="#FCA5A5" />
          <circle cx="132" cy="76" r="13" fill="#94A3B8" />
          <circle cx="132" cy="76" r="8" fill="#FCA5A5" />
          {/* Round Glasses */}
          <circle cx="85" cy="106" r="10" fill="none" stroke="#FACC15" strokeWidth="2" />
          <circle cx="115" cy="106" r="10" fill="none" stroke="#FACC15" strokeWidth="2" />
          <line x1="95" y1="106" x2="105" y2="106" stroke="#FACC15" strokeWidth="2" />
          {/* Eyes behind spectacles */}
          <ellipse cx="85" cy="106" rx="4" ry="6" fill="#1E293B" />
          <circle cx="84" cy="104" r="1.5" fill="#FFFFFF" />
          <ellipse cx="115" cy="106" rx="4" ry="6" fill="#1E293B" />
          <circle cx="114" cy="104" r="1.5" fill="#FFFFFF" />
          {/* Magnifying Glass */}
          <circle cx="145" cy="130" r="12" fill="rgba(192, 132, 252, 0.3)" stroke="#C084FC" strokeWidth="2" />
          <line x1="153" y1="139" x2="165" y2="152" stroke="#6B21A8" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
  }
};
