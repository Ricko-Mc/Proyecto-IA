export function MascotaPixel() {
  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16"
    >
      {/* Cabeza/Cuerpo rosa */}
      <rect x="20" y="15" width="88" height="80" fill="#FFB3D9" />

      {/* Ojos azul oscuro izquierdo */}
      <rect x="35" y="32" width="10" height="12" fill="#1A3790" />

      {/* Ojos azul oscuro derecho */}
      <rect x="83" y="32" width="10" height="12" fill="#1A3790" />

      {/* Brillo en ojos izquierdo */}
      <rect x="37" y="34" width="4" height="4" fill="#FFFFFF" />

      {/* Brillo en ojos derecho */}
      <rect x="85" y="34" width="4" height="4" fill="#FFFFFF" />

      {/* Accesorios cabello arriba izquierdo - Azul */}
      <rect x="15" y="10" width="8" height="8" fill="#1A3790" />
      <rect x="15" y="18" width="8" height="8" fill="#4682FF" />

      {/* Accesorios cabello arriba derecho - Oro */}
      <rect x="105" y="10" width="8" height="8" fill="#FFD700" />
      <rect x="105" y="18" width="8" height="8" fill="#DAA520" />

      {/* Detalles de cabello lateral izquierdo - Patrón */}
      <rect x="12" y="25" width="6" height="6" fill="#4682FF" />
      <rect x="12" y="32" width="6" height="6" fill="#FFD700" />
      <rect x="12" y="39" width="6" height="6" fill="#1A3790" />

      {/* Detalles de cabello lateral derecho - Patrón */}
      <rect x="110" y="25" width="6" height="6" fill="#FFD700" />
      <rect x="110" y="32" width="6" height="6" fill="#4682FF" />
      <rect x="110" y="39" width="6" height="6" fill="#DAA520" />

      {/* Mejillas/detalles rojos izquierdo */}
      <rect x="30" y="60" width="5" height="4" fill="#FF4444" />

      {/* Mejillas/detalles rojos derecho */}
      <rect x="93" y="60" width="5" height="4" fill="#FF4444" />

      {/* Boca */}
      <rect x="58" y="70" width="12" height="4" fill="#FF6B9D" />

      {/* Pies rojos izquierdo */}
      <rect x="30" y="95" width="16" height="20" fill="#FF0000" />

      {/* Pies rojos derecho */}
      <rect x="82" y="95" width="16" height="20" fill="#FF0000" />

      {/* Sombra/detalles cuerpo */}
      <rect x="20" y="75" width="88" height="2" fill="#FFB3D9" opacity="0.7" />
    </svg>
  );
}
