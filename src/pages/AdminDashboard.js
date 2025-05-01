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
  const [activeDonationRejectId, setActiveDonationRejectId] = useState(null);
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

      const userMap = {};
      usersSnapshot.forEach((userDoc) => {
        const data = userDoc.data();

        userMap[userDoc.id] = {
          fullName: data.fullName || data.name || "Unnamed Student",
          accountNumber: data.accountNumber || "N/A",
          ifscCode: data.ifscCode || "N/A",
          upiId: data.upiId || "N/A",
        };
      });

      const pending = [];
      donationsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "paid") {
          const userInfo = userMap[data.studentUid] || {};

          console.log("Donation data for student:", data.studentUid, userInfo);

          pending.push({
            id: docSnap.id,
            ...data,
            studentName: userInfo.fullName || "Unknown Student",
            accountNumber: userInfo.accountNumber,
            ifscCode: userInfo.ifscCode,
            upiId: userInfo.upiId,
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

  const rejectDonation = async (id) => {
    if (!reasonInputs[id]) {
      showNotification("Please enter a reason for rejection.", "error");
      return;
    }

    try {
      await updateDoc(doc(db, "donations", id), {
        status: "rejected",
        rejectionReason: reasonInputs[id],
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
            <div className={styles.grid}></div>
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
                  <h3 className={styles.studentName}>
                    Donor: {donation.donorName || "Anonymous"}
                  </h3>
                  <p>
                    <strong>Student:</strong> {donation.studentName}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{donation.amount}
                  </p>
                  <p>
                    <strong>Account Number:</strong> {donation.accountNumber}
                  </p>
                  <p>
                    <strong>IFSC Code:</strong> {donation.ifscCode}
                  </p>
                  <p>
                    <strong>UPI ID:</strong> {donation.upiId}
                  </p>
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
                          style={{ maxWidth: "200px" }}
                        />
                      </a>
                    ) : (
                      <p>No screenshot available</p>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => approveDonation(donation.id)}
                    >
                      Approve
                    </button>
                    {activeDonationRejectId === donation.id ? (
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
                          onClick={() => rejectDonation(donation.id)}
                          disabled={!reasonInputs[donation.id]}
                        >
                          Confirm Reject
                        </button>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => setActiveDonationRejectId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.rejectBtn}
                        onClick={() => setActiveDonationRejectId(donation.id)}
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
