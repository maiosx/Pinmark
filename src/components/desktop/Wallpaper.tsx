export function Wallpaper() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-bg" aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="sky" cx="50%" cy="18%" r="80%">
            <stop offset="0%" stopColor="#2a3328" />
            <stop offset="45%" stopColor="#1a1e18" />
            <stop offset="100%" stopColor="#0e100e" />
          </radialGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8e4d6" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#c5c1b4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c5c1b4" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f261c" />
            <stop offset="100%" stopColor="#121511" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#252c22" />
            <stop offset="100%" stopColor="#161914" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#sky)" />
        <circle cx="1180" cy="160" r="90" fill="url(#moonGlow)" />
        <circle cx="1180" cy="160" r="28" fill="#e8e4d6" />
        <circle cx="1192" cy="150" r="8" fill="#d4d0c2" opacity="0.45" />
        <g fill="#d8d4c6" opacity="0.55">
          <circle cx="180" cy="90" r="1.2" />
          <circle cx="260" cy="140" r="0.8" />
          <circle cx="420" cy="70" r="1" />
          <circle cx="640" cy="120" r="0.7" />
          <circle cx="790" cy="55" r="1.1" />
          <circle cx="980" cy="88" r="0.8" />
          <circle cx="1320" cy="64" r="1" />
          <circle cx="1460" cy="130" r="0.9" />
          <circle cx="1520" cy="210" r="0.7" />
          <circle cx="90" cy="200" r="0.8" />
        </g>
        <path
          d="M0 520 C 180 460, 320 500, 480 440 C 640 380, 780 430, 960 390 C 1140 350, 1280 400, 1600 340 L 1600 900 L 0 900 Z"
          fill="url(#hill2)"
          opacity="0.9"
        />
        <path
          d="M0 610 C 220 540, 400 600, 620 560 C 860 514, 1040 580, 1280 530 C 1440 500, 1540 540, 1600 520 L 1600 900 L 0 900 Z"
          fill="url(#hill1)"
        />
        <path
          d="M0 740 C 260 690, 480 760, 760 710 C 1040 660, 1280 730, 1600 690 L 1600 900 L 0 900 Z"
          fill="#0c0e0b"
        />
      </svg>
      <div className="grain" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0c0e0b_100%)] opacity-50" />
    </div>
  );
}
