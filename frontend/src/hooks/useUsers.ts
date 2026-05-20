import { useEffect, useState } from "react";

import type { User } from "@/types/User/User";

import { getUsers } from "@/api/users_service";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error obteniendo usuarios", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    refreshUsers: fetchUsers,
  };
}