interface GuatemalanFlagProps {
  className?: string;
  size?: number;
}

export function GuatemalanFlag({ className = "", size = 64 }: GuatemalanFlagProps) {
  return (
    <svg
      width={size}
      height={size * 0.75} // 4:3 aspect ratio
      viewBox="0 0 900 600"
      className={className}
      aria-label="Bandera de Guatemala"
    >
      
      <rect x="0" y="0" width="300" height="600" fill="#4997D0" />
      <rect x="600" y="0" width="300" height="600" fill="#4997D0" />
      
      
      <rect x="300" y="0" width="300" height="600" fill="#FFFFFF" />
      
      
      <g transform="translate(450, 300)">
        
        <path
          d="M -80 50 Q -90 55 -80 60 L 80 60 Q 90 55 80 50 Z"
          fill="#FFFFFF"
          stroke="#4997D0"
          strokeWidth="2"
        />
        
        
        <circle cx="0" cy="-20" r="25" fill="#4FAF44" />
        <ellipse cx="0" cy="0" rx="30" ry="25" fill="#4FAF44" />
        <path
          d="M -15 -25 Q -20 -40 -10 -50 M 15 -25 Q 20 -40 10 -50"
          stroke="#D32027"
          strokeWidth="3"
          fill="none"
        />
        
        
        <line x1="-35" y1="20" x2="35" y2="-10" stroke="#8B6914" strokeWidth="4" />
        <line x1="-35" y1="-10" x2="35" y2="20" stroke="#8B6914" strokeWidth="4" />
        
        
        <text
          x="0"
          y="65"
          textAnchor="middle"
          fontSize="14"
          fill="#4997D0"
          fontWeight="bold"
        >
          LIBERTAD
        </text>
      </g>
    </svg>
  );
}
