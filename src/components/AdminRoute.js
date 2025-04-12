import React, { useEffect, useState } from "react";
import { auth, db } from "../services/Firebase";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) return <p>Loading...</p>;

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;
