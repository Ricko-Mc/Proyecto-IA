import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import logoImage from "../../assets/2196c88c8e6b71450386427e39960842b5b3abc1.png";
import backgroundImage from "../../assets/839a08a8647a60638301e92960eee6e1607ac796.png";
import { api } from "../../services/api";

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const respuesta = await api.register({
        nombre_completo: name,
        email,
        password,
        confirmar_password: confirmPassword,
      });
      localStorage.setItem("access_token", respuesta.access_token || "");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: respuesta.usuario_id,
          name: respuesta.nombre_completo,
          email: respuesta.email,
          roles: respuesta.roles,
        }),
      );
      navigate("/chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="w-[90%] max-w-[420px] relative z-10 mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logoImage}
            alt="SEGUA Logo"
            className="h-[100px] md:h-[120px] w-auto drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.25))' }}
          />
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-6 md:mb-8">
          <h1
            className="text-[1.5rem] md:text-[1.75rem] font-bold text-white mb-2"
            style={{
              fontWeight: 700,
              textShadow: '0px 2px 12px rgba(0,0,0,0.4)'
            }}
          >
            Únete a SEGUA
          </h1>
          <p
            className="text-white text-[0.875rem]"
            style={{ fontWeight: 400 }}
          >
            Crear nueva cuenta
          </p>
        </div>

        {/* Register form */}
        <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
          {/* Name Input */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder-white/70 pl-8 pb-2 pt-2 focus:outline-none focus:border-white transition-all duration-200 ease-in-out text-[1rem]"
              style={{ fontWeight: 400, fontSize: 'max(16px, 0.9375rem)' }}
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder-white/70 pl-8 pb-2 pt-2 focus:outline-none focus:border-white transition-all duration-200 ease-in-out text-[1rem]"
              style={{ fontWeight: 400, fontSize: 'max(16px, 0.9375rem)' }}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder-white/70 pl-8 pr-10 pb-2 pt-2 focus:outline-none focus:border-white transition-all duration-200 ease-in-out text-[1rem]"
              style={{ fontWeight: 400, fontSize: 'max(16px, 0.9375rem)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all duration-200 ease-in-out"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder-white/70 pl-8 pr-10 pb-2 pt-2 focus:outline-none focus:border-white transition-all duration-200 ease-in-out text-[1rem]"
              style={{ fontWeight: 400, fontSize: 'max(16px, 0.9375rem)' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all duration-200 ease-in-out"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            disabled={isLoading || !name || !email || !password || !confirmPassword}
            className="w-full h-12 bg-transparent hover:bg-white/10 text-white border-2 border-white rounded-full text-[1rem] transition-all duration-200 ease-in-out mt-6 disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>

          {error && (
            <p className="text-red-200 text-xs text-center" style={{ fontWeight: 500 }}>
              {error}
            </p>
          )}
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-5 md:mt-6 text-white text-[0.8125rem]" style={{ fontWeight: 400 }}>
          <span>¿Ya tienes cuenta? </span>
          <Link
            to="/"
            className="font-semibold underline hover:no-underline transition-all duration-200 ease-in-out"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 md:mt-12 text-white/80 text-[0.75rem] space-y-1" style={{ fontWeight: 300 }}>
          <p>Educación inclusiva para todos</p>
          <p>SEGUA v1.0.0 · Marzo 2026</p>
        </div>
      </div>
    </div>
  );
}