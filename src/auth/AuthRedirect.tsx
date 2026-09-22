import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types/Account/auth";

const AuthRedirect = () => {
  const token =
    localStorage.getItem("accessToken") ??
    sessionStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);

    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      return <Navigate to="/login" replace />;
    }

    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    switch (role) {
      case "Admin":
        return <Navigate to="/admin" replace />;
      case "Staff":
        return <Navigate to="/staff" replace />;
      case "Customer":
        return <Navigate to="/customer" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    return <Navigate to="/login" replace />;
  }
}

export default AuthRedirect;