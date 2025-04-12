import React, { useState, useEffect } from "react";
import { db, auth } from "../services/Firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onSnapshot } from "firebase/firestore";
import styles from "../styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/");
      return;
    }

    const docRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.isAdmin) {
          navigate("/");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchRequests = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const pending = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "Pending") {
          pending.push({ id: docSnap.id, ...data });
        }
      });
      setPendingRequests(pending);
    };

    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "users", id), { status });
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      alert(`${status} request successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Admin Dashboard</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        pendingRequests.map((req) => (
          <div key={req.id} className={styles.card}>
            <p>
              <strong>Email:</strong> {req.email}
            </p>
            <p>
              <strong>Reason:</strong> {req.reason}
            </p>
            <p>
              <strong>Amount:</strong> ₹{req.amount}
            </p>

            <p>
              <strong>Student ID:</strong>
            </p>
            <a href={req.studentId} target="_blank" rel="noopener noreferrer">
              <img
                src={req.studentId}
                alt="Student ID"
                width="120"
                style={{ borderRadius: "6px", cursor: "pointer" }}
              />
            </a>

            <p>
              <strong>Request Proof:</strong>
            </p>
            <a href={req.fundRequest} target="_blank" rel="noopener noreferrer">
              <img
                src={req.fundRequest}
                alt="Request Proof"
                width="120"
                style={{ borderRadius: "6px", cursor: "pointer" }}
              />
            </a>

            <div className={styles.actions}>
              <button
                className={styles.approveButton}
                onClick={() => updateStatus(req.id, "Approved")}
              >
                Approve
              </button>
              <button
                className={styles.rejectButton}
                onClick={() => updateStatus(req.id, "Rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
