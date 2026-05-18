import {
  Navigate,
} from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

function ProtectedRoute({
  children,
}: Props) {

  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;