import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Chrome, Eye, EyeOff, User, Lock } from "lucide-react";
import backgroundImage from "../../assets/839a08a8647a60638301e92960eee6e1607ac796.png";
import { api } from "../../services/api";
import { ForgotPassword } from "../components/ForgotPassword";

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { url } = await api.loginGoogle();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar con Google");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setError("");
    try {
      const respuesta = await api.login({
        email: username.includes("@") ? username : `${username}@segua.gt`,
        password,
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
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesion");
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

      <div className="w-[90%] max-w-[336px] relative z-10 mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/logowhite.png"
            alt="SEGUA Logo"
            className="h-[110px] md:h-[130px] w-auto drop-shadow-lg"
            style={{ filter: 'drop-shadow(0px 2px 10px rgba(0,0,0,0.2))' }}
          />
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-6 md:mb-8">
          <h1
            className="text-[1.2rem] md:text-[1.4rem] font-bold text-white mb-2"
            style={{
              fontWeight: 700,
              textShadow: '0px 2px 12px rgba(0,0,0,0.4)'
            }}
          >
            Bienvenido a SEGUA
          </h1>
          <p
            className="text-white text-[0.7rem]"
            style={{ fontWeight: 400 }}
          >
            Lengua de Señas de Guatemala
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 md:space-y-5">
          {/* Username Input */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Correo Electronico"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder-white/70 pl-8 pb-2 pt-2 focus:outline-none focus:border-white transition-all duration-200 ease-in-out text-[0.8rem]"
              style={{ fontWeight: 400, fontSize: 'max(14px, 0.75rem)' }}
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
              className="w-full bg-transparent border-0 border-b-2 border-white/50 text-white placeholder-white/70 pl-8 pr-10 pb-2 pt-2 focus:outline-none focus:border-white transition-all duration-200 ease-in-out text-[0.8rem]"
              style={{ fontWeight: 400, fontSize: 'max(14px, 0.75rem)' }}
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

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-[0.65rem]" style={{ fontWeight: 400 }}>
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-white bg-transparent checked:bg-white checked:border-white accent-white cursor-pointer"
                style={{ accentColor: 'white' }}
              />
              <span style={{ fontFamily: 'Poppins', color: 'white', fontSize: '10px' }}>Recuérdame</span>
            </label>
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="text-white text-[0.55rem] md:text-[0.6rem] hover:underline transition-all duration-200 ease-in-out"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full h-10 bg-transparent hover:bg-white/10 text-white border-2 border-white rounded-full text-[0.8rem] transition-all duration-200 ease-in-out disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>

          {error && (
            <p className="text-red-200 text-xs text-center" style={{ fontWeight: 500 }}>
              {error}
            </p>
          )}
        </form>

        {/* Divider */}
        <div className="relative py-3 md:py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/40"></div>
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-4 text-white bg-transparent text-[0.7rem]"
              style={{ fontWeight: 400 }}
            >
              o
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-white/90 text-gray-900 h-10 text-[0.8rem] rounded-full shadow-lg transition-all duration-200 ease-in-out"
          style={{ fontWeight: 600 }}
        >
          <Chrome className="w-5 h-5 mr-2" />
          Iniciar sesión con Google
        </Button>

        {/* Sign Up Link */}
        <div className="text-center mt-4 md:mt-5 text-white text-[0.65rem]" style={{ fontWeight: 400 }}>
          <span>¿No tienes cuenta? </span>
          <Link
            to="/register"
            className="font-semibold underline hover:no-underline transition-all duration-200 ease-in-out"
          >
            Crear nueva cuenta
          </Link>
        </div>

        {/* Footer */}

      </div>

      <ForgotPassword
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
}