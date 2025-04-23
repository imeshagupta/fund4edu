import React, { useState, useEffect } from "react";
import { db, auth } from "../services/Firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [reasonInputs, setReasonInputs] = useState({});

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

  const handleRejectReasonChange = (id, value) => {
    setReasonInputs((prev) => ({ ...prev, [id]: value }));
  };

  const updateStatus = async (id, status) => {
    const reason = reasonInputs[id] || "";
    try {
      const updateData = { status };
      if (status === "Rejected" && reason.trim() !== "") {
        updateData.rejectionReason = reason.trim();
      }
      await updateDoc(doc(db, "users", id), updateData);
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      setActiveRejectId(null);
      setReasonInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[id];
        return newInputs;
      });
      alert(`${status} request successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2>Admin Dashboard</h2>
        <h3>Pending Requests</h3>
      </div>

      <div className={styles.container}>
        {pendingRequests.length === 0 ? (
          <p className={styles.noRequest}>No pending requests</p>
        ) : (
          <div className={styles.grid}>
            {pendingRequests.map((req) => (
              <div key={req.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <p>
                    <strong>Email:</strong> {req.email}
                  </p>
                  <p>
                    <strong>Reason:</strong> {req.reason}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{req.amount}
                  </p>
                </div>

                <div className={styles.cardRight}>
                  <div>
                    <p>
                      <strong>Student ID:</strong>
                    </p>
                    <a
                      href={req.studentId}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={req.studentId}
                        alt="Student ID"
                        className={styles.image}
                      />
                    </a>
                  </div>
                  <div>
                    <p>
                      <strong>Request Proof:</strong>
                    </p>
                    <a
                      href={req.fundRequest}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={req.fundRequest}
                        alt="Request Proof"
                        className={styles.image}
                      />
                    </a>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button onClick={() => updateStatus(req.id, "Approved")}>
                    Approve
                  </button>

                  {activeRejectId === req.id ? (
                    <div className={styles.rejectBox}>
                      <textarea
                        placeholder="Enter reason for rejection"
                        value={reasonInputs[req.id] || ""}
                        onChange={(e) =>
                          setReasonInputs((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        className={styles.textarea}
                      />
                      <button
                        className={styles.confirmRejectBtn}
                        onClick={() => updateStatus(req.id, "Rejected")}
                      >
                        Confirm Reject
                      </button>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => setActiveRejectId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveRejectId(req.id)}>
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
