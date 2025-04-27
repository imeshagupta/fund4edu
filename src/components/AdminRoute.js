import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Use the context you already made

const AdminRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!currentUser || !userData || !userData.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
