// UsersPage.tsx
import { useNavigate } from "react-router-dom";
import UserTable from "@/components/Users/UserTable";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Loader2 } from "lucide-react";

function UsersPage() {
  const { users, loading } = useUsers();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      {/* Topbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Users size={18} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Usuarios
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestión de usuarios del sistema
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/users/create")}
            className="
              flex items-center gap-2 h-9 px-4 text-sm font-medium
              bg-[#4a5296] hover:bg-[#3d4580] dark:bg-[#4a5296] dark:hover:bg-[#3d4580]
              text-white border-0 cursor-pointer rounded-xl
            "
          >
            <UserPlus size={15} />
            Nuevo usuario
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400 dark:text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Cargando usuarios...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Users size={28} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No hay usuarios registrados
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              Crea el primero con el botón de arriba
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <UserTable users={users} />
          </div>
        )}
      </main>
    </div>
  );
}

export default UsersPage;