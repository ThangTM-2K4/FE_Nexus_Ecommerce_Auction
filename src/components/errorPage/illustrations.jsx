const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  role: 'img',
  focusable: 'false',
};

/** 401 — cảnh sát đá stick figure (ref: orange kick page) */
export function Illustration401() {
  return (
    <svg {...base} viewBox="0 0 400 220" className="error-illu">
      <title>Chưa đăng nhập</title>
      <line x1="40" y1="188" x2="360" y2="188" className="error-illu__line" strokeWidth="4" />
      {/* Victim */}
      <circle cx="130" cy="118" r="14" className="error-illu__ink" />
      <text x="118" y="98" fontSize="16" fontWeight="800" fill="white">?!</text>
      <line x1="130" y1="132" x2="118" y2="188" className="error-illu__line" />
      <line x1="118" y1="188" x2="108" y2="188" className="error-illu__line" />
      <line x1="118" y1="155" x2="98" y2="168" className="error-illu__line" />
      <line x1="118" y1="155" x2="138" y2="162" className="error-illu__line" />
      {/* Impact */}
      <path d="M152 148 L162 138 M158 152 L168 148" className="error-illu__line-light" strokeWidth="2.5" />
      {/* Officer */}
      <circle cx="230" cy="108" r="14" className="error-illu__ink" />
      <rect x="218" y="88" width="24" height="10" rx="2" className="error-illu__ink" />
      <rect x="214" y="84" width="32" height="6" rx="2" className="error-illu__ink" />
      <line x1="230" y1="122" x2="230" y2="188" className="error-illu__line" />
      <line x1="230" y1="188" x2="214" y2="188" className="error-illu__line" />
      <line x1="230" y1="188" x2="246" y2="188" className="error-illu__line" />
      <line x1="230" y1="145" x2="210" y2="158" className="error-illu__line" />
      {/* Kick leg */}
      <line x1="230" y1="158" x2="148" y2="168" className="error-illu__line" strokeWidth="4" />
    </svg>
  );
}

/** 403 — lính gác chặn, rào chắn, ổ khoá (ref: forbidden guard) */
export function Illustration403() {
  return (
    <svg {...base} viewBox="0 0 360 280" className="error-illu">
      <title>Khu vực cấm</title>
      <circle cx="180" cy="140" r="118" fill="rgba(255,255,255,0.35)" />
      {/* Padlock */}
      <rect x="52" y="118" width="44" height="52" rx="8" className="error-illu__ink" fill="none" strokeWidth="4" />
      <path d="M62 118 V104 C62 88 86 88 86 104 V118" className="error-illu__line" strokeWidth="4" fill="none" />
      <circle cx="74" cy="144" r="6" className="error-illu__lavender" />
      {/* Barricade */}
      <rect x="118" y="178" width="124" height="14" rx="3" className="error-illu__ink" />
      <rect x="128" y="164" width="104" height="14" rx="3" className="error-illu__accent" />
      <line x1="138" y1="192" x2="138" y2="212" className="error-illu__line" strokeWidth="4" />
      <line x1="222" y1="192" x2="222" y2="212" className="error-illu__line" strokeWidth="4" />
      {/* Guard */}
      <circle cx="210" cy="88" r="22" className="error-illu__surface" />
      <circle cx="210" cy="82" r="18" className="error-illu__ink" />
      <rect x="196" y="58" width="28" height="10" rx="3" className="error-illu__ink" />
      <rect x="178" y="106" width="64" height="72" rx="10" className="error-illu__lavender" />
      <rect x="188" y="116" width="44" height="10" rx="2" className="error-illu__ink" />
      <rect x="196" y="132" width="28" height="36" rx="4" className="error-illu__surface" opacity="0.5" />
      {/* Stop hand */}
      <circle cx="252" cy="108" r="16" className="error-illu__surface" />
      <line x1="236" y1="120" x2="252" y2="108" className="error-illu__line" strokeWidth="5" />
      <line x1="236" y1="120" x2="228" y2="138" className="error-illu__line" strokeWidth="4" />
      {/* Cone */}
      <path d="M278 212 L292 178 L306 212 Z" className="error-illu__warn" />
      <rect x="276" y="210" width="32" height="6" rx="2" className="error-illu__surface" />
      <line x1="284" y1="192" x2="300" y2="198" className="error-illu__line-light" strokeWidth="3" />
    </svg>
  );
}

/** 404 — mèo cáu kỉnh cầm biển ERROR (ref: grumpy cat) */
export function Illustration404() {
  return (
    <svg {...base} viewBox="0 0 360 300" className="error-illu">
      <title>Trang không tìm thấy</title>
      {/* Fluffy body */}
      <ellipse cx="180" cy="210" rx="100" ry="72" className="error-illu__surface" />
      <circle cx="180" cy="128" r="72" className="error-illu__surface" />
      {/* Ears */}
      <path d="M118 72 L108 28 L142 58 Z" className="error-illu__surface" />
      <path d="M242 72 L252 28 L218 58 Z" className="error-illu__surface" />
      {/* Grumpy face */}
      <ellipse cx="152" cy="122" rx="10" ry="12" className="error-illu__warn" />
      <ellipse cx="208" cy="122" rx="10" ry="12" className="error-illu__warn" />
      <circle cx="152" cy="124" r="4" className="error-illu__ink" />
      <circle cx="208" cy="124" r="4" className="error-illu__ink" />
      <path d="M152 148 Q180 132 208 148" className="error-illu__line" strokeWidth="3" fill="none" />
      <path d="M128 108 Q152 100 168 108" className="error-illu__line" strokeWidth="2.5" fill="none" />
      <path d="M192 108 Q208 100 232 108" className="error-illu__line" strokeWidth="2.5" fill="none" />
      {/* ERROR sign */}
      <polygon
        points="248,168 290,182 248,196 206,182"
        className="error-illu__accent"
      />
      <text x="218" y="186" fontSize="11" fontWeight="800" fill="white" letterSpacing="1">
        ERROR
      </text>
      {/* Paws holding sign */}
      <ellipse cx="228" cy="198" rx="14" ry="10" className="error-illu__surface" />
      <ellipse cx="248" cy="204" rx="12" ry="9" className="error-illu__surface" />
    </svg>
  );
}

/** 500 — mèo cắn dây cáp (ref: cat cables) */
export function Illustration500() {
  return (
    <svg {...base} viewBox="0 0 360 300" className="error-illu">
      <title>Lỗi máy chủ</title>
      <defs>
        <linearGradient id="catGrad500" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--err-grad-start, #B35A8A)" />
          <stop offset="55%" stopColor="var(--err-grad-mid, #7880AE)" />
          <stop offset="100%" stopColor="var(--err-grad-end, #523F77)" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="228" rx="88" ry="28" fill="rgba(82,63,119,0.08)" />
      {/* Cat body gradient using theme colors inline in gradient def - allowed as theme tokens */}
      <path
        d="M180 88 C140 88 118 128 118 168 C118 210 148 238 180 238 C212 238 242 210 242 168 C242 128 220 88 180 88 Z"
        fill="url(#catGrad500)"
      />
      <circle cx="180" cy="108" r="38" fill="url(#catGrad500)" />
      <polygon points="148,78 138,42 168,68" fill="url(#catGrad500)" />
      <polygon points="212,78 222,42 192,68" fill="url(#catGrad500)" />
      <ellipse cx="164" cy="108" rx="8" ry="10" fill="var(--err-eye, currentColor)" className="error-illu__warn" />
      <ellipse cx="196" cy="108" rx="8" ry="10" fill="var(--err-eye, currentColor)" className="error-illu__warn" />
      <circle cx="164" cy="110" r="3" className="error-illu__ink" />
      <circle cx="196" cy="110" r="3" className="error-illu__ink" />
      <ellipse cx="180" cy="124" rx="6" ry="4" className="error-illu__ink" />
      {/* Cables */}
      <path
        d="M128 218 C108 228 98 248 88 262 M148 228 C138 248 128 258 118 268 M192 228 C202 248 218 258 232 268"
        className="error-illu__line"
        strokeWidth="3"
        opacity="0.7"
      />
      <path d="M168 168 Q148 198 132 218" className="error-illu__warn" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M192 168 Q212 188 228 198" className="error-illu__sky" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M176 158 Q180 178 188 188" className="error-illu__line" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** 503 — màn hình 503 + nhân vật bối rối (ref: service unavailable) */
export function Illustration503() {
  return (
    <svg {...base} viewBox="0 0 400 280" className="error-illu">
      <title>Bảo trì hệ thống</title>
      {/* Gear */}
      <circle cx="200" cy="72" r="28" className="error-illu__surface" opacity="0.25" />
      <circle cx="200" cy="72" r="14" className="error-illu__surface" opacity="0.15" />
      {/* Monitor */}
      <rect x="88" y="48" width="224" height="148" rx="12" className="error-illu__surface" />
      <rect x="100" y="60" width="200" height="112" rx="6" fill="rgba(163,187,215,0.35)" />
      <circle cx="112" cy="72" r="4" fill="rgba(82,63,119,0.25)" />
      <circle cx="124" cy="72" r="4" fill="rgba(82,63,119,0.25)" />
      <circle cx="136" cy="72" r="4" fill="rgba(82,63,119,0.25)" />
      <text x="148" y="132" fontSize="52" fontWeight="800" fill="#523F77" textAnchor="middle">
        503
      </text>
      <text x="200" y="158" fontSize="13" fontWeight="700" fill="#523F77" textAnchor="middle">
        Service Unavailable
      </text>
      <rect x="168" y="196" width="64" height="10" rx="3" className="error-illu__surface" opacity="0.7" />
      <rect x="148" y="206" width="104" height="8" rx="3" className="error-illu__surface" opacity="0.45" />
      {/* Person */}
      <circle cx="318" cy="108" r="18" className="error-illu__surface" />
      <rect x="298" y="128" width="40" height="56" rx="10" className="error-illu__sky" />
      <rect x="306" y="184" width="12" height="36" rx="4" className="error-illu__surface" opacity="0.85" />
      <rect x="318" y="184" width="12" height="36" rx="4" className="error-illu__surface" opacity="0.85" />
      <path d="M308 138 Q318 118 328 138" className="error-illu__line" strokeWidth="3" />
      {/* Confused bubble */}
      <ellipse cx="318" cy="68" rx="22" ry="16" className="error-illu__surface" />
      <path d="M308 82 L302 92" className="error-illu__line-light" strokeWidth="2" />
      <circle cx="312" cy="66" r="2" fill="#523F77" />
      <circle cx="324" cy="66" r="2" fill="#523F77" />
      <path d="M310 74 Q318 78 326 74" stroke="#523F77" strokeWidth="2" fill="none" />
      {/* Cone */}
      <path d="M72 228 L88 188 L104 228 Z" className="error-illu__warn" />
      <rect x="68" y="226" width="40" height="6" rx="2" className="error-illu__surface" opacity="0.8" />
      {/* Sparkles */}
      <text x="52" y="88" fontSize="14" fill="white" opacity="0.5">+</text>
      <text x="340" y="188" fontSize="12" fill="white" opacity="0.4">+</text>
      <circle cx="64" cy="148" r="3" fill="white" opacity="0.35" />
    </svg>
  );
}
