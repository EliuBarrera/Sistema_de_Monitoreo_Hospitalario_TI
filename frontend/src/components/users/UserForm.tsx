// UserForm.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Save } from "lucide-react";

interface Props {
  onSubmit: (data: any) => void;
}

function UserForm({ onSubmit }: Props) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: 1,
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Nombre */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Nombre de usuario
        </Label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <Input
            name="username"
            placeholder="nombre.apellido"
            onChange={handleChange}
            value={form.username}
            className="
              pl-9
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus-visible:ring-[#4a5296]/40 dark:focus-visible:ring-[#4a5296]/60
              rounded-xl h-10
            "
          />
        </div>
      </div>

      {/* Correo */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <Input
            name="email"
            type="email"
            placeholder="correo@hospital.com"
            onChange={handleChange}
            value={form.email}
            className="
              pl-9
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus-visible:ring-[#4a5296]/40 dark:focus-visible:ring-[#4a5296]/60
              rounded-xl h-10
            "
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Contraseña
        </Label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            onChange={handleChange}
            value={form.password}
            className="
              pl-9
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus-visible:ring-[#4a5296]/40 dark:focus-visible:ring-[#4a5296]/60
              rounded-xl h-10
            "
          />
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-1" />

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
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
        <Save size={15} />
        {loading ? "Guardando..." : "Guardar usuario"}
      </Button>
    </form>
  );
}

export default UserForm;