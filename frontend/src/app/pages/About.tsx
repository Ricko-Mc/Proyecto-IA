import { useNavigate } from 'react-router';
import { GuatemalanFlag } from '../components/GuatemalanFlag';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import logoImage from "../../assets/2196c88c8e6b71450386427e39960842b5b3abc1.png";

export function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <GuatemalanFlag size={24} />
          <h1 className="text-base font-semibold">Más información</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
        <div className="space-y-6">
          {/* Logo and Title */}
          <div className="text-center py-6">
            <img
              src={logoImage}
              alt="SEGUA Logo"
              className="w-28 h-28 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold mb-1">SEGUA</h2>
            <p className="text-xs text-muted-foreground">Versión 1.0.0</p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Acerca de SEGUA</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              SEGUA es una plataforma educativa e inclusiva diseñada para facilitar el aprendizaje
              de la Lengua de Señas de Guatemala. Nuestro objetivo es romper barreras de comunicación
              y promover la inclusión de la comunidad sorda guatemalteca.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Características</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
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

          {/* Credits */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Desarrollado por</h3>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                Daniel Figueroa
              </p>
              <p className="text-xs text-muted-foreground">
                Desarrollador
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Tecnologías</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Firebase'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-muted rounded-full text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mt-1">
              © 2026 SEGUA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </div>
  );
}
