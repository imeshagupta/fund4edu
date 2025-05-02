import React, { useState, useEffect } from "react";
import { db } from "../services/Firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminDashboard.module.css";
import Notification from "../components/Notification";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { currentUser, userData, loading } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [reasonInputs, setReasonInputs] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });

  const navigate = useNavigate();

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !userData || !userData.isAdmin) {
      navigate("/");
    }
  }, [currentUser, userData, loading, navigate]);

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

    const fetchDonations = async () => {
      const donationsSnapshot = await getDocs(collection(db, "donations"));
      const usersSnapshot = await getDocs(collection(db, "users"));

      // Create a map of user data (including fullName)
      const userMap = {};
      usersSnapshot.forEach((userDoc) => {
        const data = userDoc.data();
        userMap[userDoc.id] = {
          fullName: data.fullName || "Unnamed User",
        };
      });

      const pending = [];
      donationsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "paid") {
          const donorData = userMap[data.donorUid] || {};
          const studentData = userMap[data.studentUid] || {};
          pending.push({
            id: docSnap.id,
            ...data,
            donorName: donorData.fullName,
            studentName: studentData.fullName,
          });
        }
      });

      setDonations(pending);
    };

    fetchRequests();
    fetchDonations();
  }, []);

  const handleRejectReasonChange = (id, value) => {
    setReasonInputs((prev) => ({ ...prev, [id]: value }));
  };

  const updateStatus = async (id, status, rejectionReason = "") => {
    if (status === "Rejected" && !rejectionReason) {
      showNotification("Please fill in the reason for rejection.", "error");
      return;
    }

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

  const approveDonation = async (id) => {
    try {
      await updateDoc(doc(db, "donations", id), { status: "approved" });
      setDonations((prev) => prev.filter((d) => d.id !== id));
      showNotification("Donation approved!", "success");
    } catch (err) {
      console.error("Error approving donation:", err);
      showNotification("Failed to approve donation.", "error");
    }
  };

  const rejectDonation = async (id, rejectionReason = "") => {
    if (!rejectionReason) {
      showNotification("Please fill in the reason for rejection.", "error");
      return;
    }

    try {
      await updateDoc(doc(db, "donations", id), {
        status: "rejected",
        rejectionReason,
      });
      setDonations((prev) => prev.filter((d) => d.id !== id));
      showNotification("Donation rejected!", "error");
    } catch (err) {
      console.error("Error rejecting donation:", err);
      showNotification("Failed to reject donation.", "error");
    }
  };

  return (
    <>
      <Notification message={notification.message} type={notification.type} />

      <div className={styles.header}>
        <h2>Admin Dashboard</h2>

        <h3>Pending Requests</h3>
        <div
          className={`${styles.container} ${
            pendingRequests.length === 0 ? styles.emptyContainer : ""
          }`}
        >
          {pendingRequests.length === 0 ? (
            <p className={styles.noRequest}>No pending requests</p>
          ) : (
            <div className={styles.grid}>
              {pendingRequests.map((req) => (
                <div key={req.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.studentName}>
                      {req.fullName || "Unnamed Student"}
                    </h3>
                  </div>
                  <div className={styles.cardContent}>
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
                      <p>
                        <strong>Account Number:</strong>{" "}
                        {req.accountNumber || "N/A"}
                      </p>
                      <p>
                        <strong>IFSC Code:</strong> {req.ifscCode || "N/A"}
                      </p>
                      <p>
                        <strong>Bank Name:</strong> {req.bankName || "N/A"}
                      </p>
                    </div>
                    <div className={styles.cardRight}>
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
                    <button
                      onClick={() => updateStatus(req.id, "Approved")}
                      className={styles.approveBtn}
                    >
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
                          onClick={() =>
                            updateStatus(
                              req.id,
                              "Rejected",
                              reasonInputs[req.id] || ""
                            )
                          }
                          disabled={!reasonInputs[req.id]}
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
                      <button
                        onClick={() => setActiveRejectId(req.id)}
                        className={styles.rejectBtn}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h3>Pending Donations</h3>
        <div
          className={`${styles.container} ${
            donations.length === 0 ? styles.emptyContainer : ""
          }`}
        >
          {donations.length === 0 ? (
            <p className={styles.noRequest}>No pending donations</p>
          ) : (
            <div className={styles.grid}>
              {donations.map((donation) => (
                <div key={donation.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.studentName}>
                      Donor: {donation.donorName || "Anonymous"}
                    </h3>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardLeft}>
                      <p>
                        <strong>Student:</strong> {donation.studentName}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{donation.amount}
                      </p>
                      <p>
                        <strong>Account Number:</strong>{" "}
                        {donation.accountNumber || "N/A"}
                      </p>
                      <p>
                        <strong>IFSC Code:</strong> {donation.ifscCode || "N/A"}
                      </p>
                      <p>
                        <strong>Bank Name:</strong> {donation.bankName || "N/A"}
                      </p>
                      <p>
                        <strong>UPI ID:</strong> {donation.upiId || "N/A"}
                      </p>
                    </div>
                    <div className={styles.cardRight}>
                      <p>
                        <strong>Payment Proof:</strong>
                      </p>
                      {donation.paymentProof ? (
                        <a
                          href={donation.paymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={donation.paymentProof}
                            alt="Payment Screenshot"
                          />
                        </a>
                      ) : (
                        <p>No screenshot available</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => approveDonation(donation.id)}
                    >
                      Approve
                    </button>
                    {activeRejectId === donation.id ? (
                      <div className={styles.rejectBox}>
                        <textarea
                          placeholder="Enter reason for rejection"
                          value={reasonInputs[donation.id] || ""}
                          onChange={(e) =>
                            handleRejectReasonChange(
                              donation.id,
                              e.target.value
                            )
                          }
                          className={styles.textarea}
                        />
                        <button
                          className={styles.confirmRejectBtn}
                          onClick={() =>
                            rejectDonation(
                              donation.id,
                              reasonInputs[donation.id] || ""
                            )
                          }
                          disabled={!reasonInputs[donation.id]}
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
                      <button
                        className={styles.rejectBtn}
                        onClick={() => setActiveRejectId(donation.id)}
                      >
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
