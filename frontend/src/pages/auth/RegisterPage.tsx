import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "@/api/auth_service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import hospitalBg from "@/assets/hospital-bg.jpg";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("You must accept the terms and conditions.");
      return;
    }
    setLoading(true);
    try {
      await registerRequest(form);
      alert("User created successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${hospitalBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

      {/* Card central */}
      <div className="w-full max-w-md mx-4">
        <div
          className="
            bg-white/15 backdrop-blur-md
            border border-white/30
            rounded-2xl shadow-2xl
            px-8 py-8
          "
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow">
              Create account
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Hospital Universitario San Rafael de Tunja
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-white font-semibold text-sm tracking-wide drop-shadow">
                Username
              </label>
              <Input
                placeholder="nombre.apellido"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="bg-white/90 border-0 text-slate-800 placeholder:text-slate-400 rounded-lg h-10 text-sm focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-white font-semibold text-sm tracking-wide drop-shadow">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="correo@hospital.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white/90 border-0 text-slate-800 placeholder:text-slate-400 rounded-lg h-10 text-sm focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-white font-semibold text-sm tracking-wide drop-shadow">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-white/90 border-0 text-slate-800 placeholder:text-slate-400 rounded-lg h-10 text-sm focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>

            {/* Términos y condiciones */}
            <div className="flex items-start gap-3 mt-1">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(v) => setAcceptTerms(v as boolean)}
                className="mt-0.5 border-white/60 data-[state=checked]:bg-white data-[state=checked]:text-slate-800"
              />
              <label
                htmlFor="terms"
                className="text-white/80 text-xs leading-relaxed cursor-pointer select-none"
              >
                I accept the{" "}
                <span className="underline underline-offset-2 text-white hover:text-white/70 cursor-pointer">
                  terms and conditions
                </span>{" "}
                and the privacy policy of the hospital system.
              </label>
            </div>

            {/* Botón register */}
            <Button
              type="submit"
              disabled={loading || !acceptTerms}
              className="
                mt-2 bg-white text-slate-800 hover:bg-slate-100
                font-semibold h-10 rounded-lg shadow-md
                transition-all duration-200 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Creating account..." : "Register →"}
            </Button>

            {/* Link volver al login */}
            <div className="text-center mt-1">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-white/70 hover:text-white text-xs underline underline-offset-2 transition-colors duration-150 cursor-pointer"
              >
                Already have an account? Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;