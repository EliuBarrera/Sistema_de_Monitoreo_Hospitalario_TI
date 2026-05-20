// CreateUserPage.tsx — sin cambios en estructura, solo pasa showRoleSelect
import { useNavigate } from "react-router-dom";
import UserForm from "@/components/users/UserForm";
import { createUser } from "@/api/users_service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";

function CreateUserPage() {
  const navigate = useNavigate();

  async function handleCreate(data: any) {
    try {
      await createUser(data);
      navigate("/users");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/users")}
            className="
              p-2 h-9 w-9 rounded-xl
              text-slate-500 dark:text-slate-400
              hover:text-slate-900 dark:hover:text-slate-100
              hover:bg-slate-100 dark:hover:bg-slate-800
              cursor-pointer
            "
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <UserPlus size={18} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Crear Usuario
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completa los campos para registrar un nuevo usuario
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="
          max-w-xl mx-auto
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-2xl p-6
        ">
          <UserForm onSubmit={handleCreate} showRoleSelect={true} />
        </div>
      </main>
    </div>
  );
}

export default CreateUserPage;