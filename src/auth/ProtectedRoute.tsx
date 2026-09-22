import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";
import type { JwtPayload } from "../types/Account/auth";

interface Props {
  children: ReactNode;
  allowedRole: "Admin" | "Staff" | "Customer";
}

 const  ProtectedRoute = ({
  children,
  allowedRole,
}: Props)  => {
  const token =
  localStorage.getItem("accessToken") ??
  sessionStorage.getItem("accessToken");

  // Không có token → đá về login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);

    // Token hết hạn
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      return <Navigate to="/login" replace />;
    }

    const role =
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];

    // Có token nhưng đi sai khu vực
    if (role !== allowedRole) {
      return <Navigate to={`/${role.toLowerCase()}`} replace />;
    }

    return children;
  } catch {
    // Token rác / decode lỗi
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    return <Navigate to="/login" replace />;
  }
}
export default ProtectedRoute;