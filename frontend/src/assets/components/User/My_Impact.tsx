import { Navigate } from "react-router-dom";

/** Impact metrics live on the user dashboard (`MyImpactView`). */
export default function My_Impact() {
  return <Navigate to="/user_dashboard" replace />;
}
