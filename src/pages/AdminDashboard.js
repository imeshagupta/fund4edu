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
import Notification from "../components/Notification";

const AdminDashboard = () => {
  console.log("Styles object:", styles);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [reasonInputs, setReasonInputs] = useState({});

  const navigate = useNavigate();

  const [notification, setNotification] = useState({ message: "", type: "" });

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

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

  const updateStatus = async (id, status, rejectionReason = "") => {
    try {
      await updateDoc(doc(db, "users", id), {
        status,
        rejectionReason: status === "Rejected" ? rejectionReason : "",
      });
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      showNotification(`${status} request successfully!`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Failed to update status. Please try again.", "error");
    }
  };

  return (
    <>
      <Notification message={notification.message} type={notification.type} />

      <div className={styles.header}>
        <h2>Admin Dashboard</h2>
        <h3>Pending Requests</h3>

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
                      <strong>Phone:</strong> {req.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {req.address || "N/A"}
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
                        <img src={req.studentId} alt="Student ID" />
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
                        <img src={req.fundRequest} alt="Request Proof" />
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
                            handleRejectReasonChange(req.id, e.target.value)
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
      </div>
    </>
  );
};

export default AdminDashboard;
