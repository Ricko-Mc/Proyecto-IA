import { useNavigate } from 'react-router';
import { GuatemalanFlag } from '../components/GuatemalanFlag';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import logoImage from "../../assets/2196c88c8e6b71450386427e39960842b5b3abc1.png";
import umgLogo from '/umg.png';

export function About() {
  const navigate = useNavigate();
  const equipo = [
    'Andrea Chafolla',
    'Dilan Escobar',
    'Ricardo Galindo',
    'Jeffry Urbina',
    'Gustavo Barrientos',
    'Steev Figueroa',
    'Daniel Figueroa',
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="h-7 w-7"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <GuatemalanFlag size={20} />
          <h1 className="text-sm font-semibold tracking-tight">Más información</h1>
        </div>
      </div>

      
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
        <div className="space-y-4">
          
          <div className="text-center py-3">
            <img
              src={logoImage}
              alt="SEGUA Logo"
              className="w-16 h-16 mx-auto mb-2"
            />
            <h2 className="text-lg font-bold mb-0.5">SEGUA</h2>
            <p className="text-[11px] text-muted-foreground">Versión 1.0.0</p>
          </div>

          
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide">Acerca de SEGUA</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              SEGUA es una plataforma educativa e inclusiva diseñada para facilitar el aprendizaje
              de la Lengua de Señas de Guatemala. Nuestro objetivo es romper barreras de comunicación
              y promover la inclusión de la comunidad sorda guatemalteca.
            </p>
          </div>

          
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide">Características</h3>
            <ul className="space-y-1.5 text-[12px] text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#4997D0] mt-0.5">•</span>
                <span>Traducción de texto a Lengua de Señas en tiempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4997D0] mt-0.5">•</span>
                <span>Diccionario completo de señas guatemaltecas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4997D0] mt-0.5">•</span>
                <span>Videos educativos de alta calidad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4997D0] mt-0.5">•</span>
                <span>Interfaz intuitiva y accesible</span>
              </li>
            </ul>
          </div>

          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide">Desarrollado por</h3>
              <img
                src={umgLogo}
                alt="Logo UMG"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {equipo.map((nombre) => (
                  <div
                    key={nombre}
                    className="rounded-lg bg-muted/70 px-3 py-2 text-[12px] font-medium"
                  >
                    {nombre}
                  </div>
                ))}
              </div>
            </div>
          </div>

          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground mt-1">
              © 2026 SEGUA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      
      <BottomNav />
    </div>
  );
}
