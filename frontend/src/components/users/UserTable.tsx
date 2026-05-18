// UserTable.tsx
import type { User } from "@/types/User/User";

interface Props {
  users: User[];
}

function UserTable({ users }: Props) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
          <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Nombre
          </th>
          <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Correo
          </th>
          <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Rol
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {users.map((user) => (
          <tr
            key={user.id}
            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="
                  w-8 h-8 rounded-full shrink-0
                  bg-[#4a5296]/15 dark:bg-[#4a5296]/30
                  flex items-center justify-center
                  text-xs font-semibold
                  text-[#4a5296] dark:text-slate-300
                ">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {user.username}
                </span>
              </div>
            </td>
            <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">
              {user.email}
            </td>
            <td className="px-5 py-3.5">
              <span className="
                inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium
                bg-slate-100 dark:bg-slate-700
                text-slate-700 dark:text-slate-300
                border border-slate-200 dark:border-slate-600
              ">
                {user.role?.name ?? "Sin rol"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;