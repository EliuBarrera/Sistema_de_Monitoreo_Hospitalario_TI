import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "@/api/auth_service";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import hospitalBg from "@/assets/hospital-bg.jpg";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginRequest({ email, password });
      login(response.token);
      console.log(response);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-end pb-10 overflow-hidden"
      style={{
        backgroundImage: `url(${hospitalBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Overlay sutil solo en la parte inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

      {/* Formulario horizontal en la parte inferior */}
      <div className="relative z-10 w-full max-w-4xl px-4">
        <form onSubmit={handleSubmit}>
          <div
            className="
              flex flex-row flex-wrap items-center justify-center gap-4
              bg-white/15 backdrop-blur-md
              border border-white/30
              rounded-2xl
              px-8 py-5
              shadow-2xl
            "
          >
            {/* Email */}
            <div className="flex flex-col gap-1 min-w-[200px] flex-1">
              <label
                htmlFor="email"
                className="text-white font-semibold text-sm tracking-wide drop-shadow"
              >
                E-mail:
              </label>
              <Input
                id="email"
                type="email"
                placeholder="correo@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  bg-white/90 border-0 text-slate-800
                  placeholder:text-slate-400
                  rounded-lg h-10 text-sm
                  focus-visible:ring-2 focus-visible:ring-white
                "
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 min-w-[200px] flex-1">
              <label
                htmlFor="password"
                className="text-white font-semibold text-sm tracking-wide drop-shadow"
              >
                Password:
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  bg-white/90 border-0 text-slate-800
                  placeholder:text-slate-400
                  rounded-lg h-10 text-sm
                  focus-visible:ring-2 focus-visible:ring-white
                "
              />
            </div>

            {/* Botón + link */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="
                  bg-white text-slate-800 hover:bg-slate-100
                  font-semibold px-8 h-10 rounded-lg
                  shadow-md transition-all duration-200
                  cursor-pointer whitespace-nowrap
                "
              >
                {loading ? "Ingresando..." : "Sign in →"}
              </Button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="
                  text-white/80 hover:text-white
                  text-xs underline underline-offset-2
                  transition-colors duration-150
                  cursor-pointer
                "
              >
                Aren't registered yet?
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;