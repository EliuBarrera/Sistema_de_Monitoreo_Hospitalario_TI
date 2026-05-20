// UserForm.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Save, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import { getRoles } from "@/api/users_service";

interface Role {
  id: number;
  name: string;
}

interface Props {
  onSubmit: (data: any) => void;
  showRoleSelect?: boolean;
}

function UserForm({ onSubmit, showRoleSelect = true }: Props) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: 0,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError]     = useState("");
  const [roles, setRoles]                     = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading]       = useState(false);
  const [loading, setLoading]                 = useState(false);

  useEffect(() => {
    if (!showRoleSelect) return;
    setRolesLoading(true);
    getRoles()
      .then((data) => { setRoles(data); setForm((f) => ({ ...f, role_id: data[0]?.id ?? 0 })); })
      .catch(console.error)
      .finally(() => setRolesLoading(false));
  }, [showRoleSelect]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value = e.target.name === "role_id" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  function handleConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value);
    setPasswordError(e.target.value !== form.password ? "Las contraseñas no coinciden" : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `
    pl-9
    bg-white dark:bg-slate-800
    border-slate-200 dark:border-slate-700
    text-slate-900 dark:text-slate-100
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus-visible:ring-[#4a5296]/40 dark:focus-visible:ring-[#4a5296]/60
    rounded-xl h-10
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Username */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Nombre de usuario
        </Label>
        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            name="username"
            placeholder="nombre.apellido"
            onChange={handleChange}
            value={form.username}
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            name="email"
            type="email"
            placeholder="correo@hospital.com"
            onChange={handleChange}
            value={form.email}
            className={inputClass}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Contraseña
        </Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            onChange={handleChange}
            value={form.password}
            className={inputClass}
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Confirmar contraseña
        </Label>
        <div className="relative">
          <ShieldCheck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={handleConfirmChange}
            className={`
              ${inputClass}
              ${passwordError
                ? "border-red-400 dark:border-red-500 focus-visible:ring-red-400/40"
                : confirmPassword && !passwordError
                  ? "border-emerald-400 dark:border-emerald-500 focus-visible:ring-emerald-400/40"
                  : ""
              }
            `}
          />
        </div>
        {passwordError && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
            {passwordError}
          </p>
        )}
        {confirmPassword && !passwordError && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
            Las contraseñas coinciden
          </p>
        )}
      </div>

      {/* Role select */}
      {showRoleSelect && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Rol
          </Label>
          <div className="relative">
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            {rolesLoading ? (
              <div className="
                flex items-center gap-2 h-10 px-3 rounded-xl
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-400 dark:text-slate-500 text-sm
              ">
                <Loader2 size={14} className="animate-spin" />
                Cargando roles...
              </div>
            ) : (
              <select
                name="role_id"
                value={form.role_id}
                onChange={handleChange}
                className="
                  w-full h-10 pl-3 pr-9 rounded-xl text-sm appearance-none
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  text-slate-900 dark:text-slate-100
                  focus:outline-none focus:ring-2
                  focus:ring-[#4a5296]/40 dark:focus:ring-[#4a5296]/60
                  cursor-pointer
                "
              >
                {roles.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                    className="bg-white dark:bg-slate-800"
                  >
                    {role.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 dark:border-slate-800 pt-1" />

      <Button
        type="submit"
        disabled={loading || !!passwordError || !confirmPassword}
        className="
          w-full h-10 rounded-xl font-medium text-sm
          flex items-center justify-center gap-2
          bg-[#4a5296] hover:bg-[#3d4580]
          dark:bg-[#4a5296] dark:hover:bg-[#3d4580]
          text-white border-0 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {loading ? "Guardando..." : "Guardar usuario"}
      </Button>
    </form>
  );
}

export default UserForm;