import React, { useEffect, useState } from "react";
import { auth, db } from "../services/Firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "../styles/StudentDashboard.module.css";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [fundRequest, setFundRequest] = useState(null);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Pending");
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  const navigate = useNavigate();

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/");
      return;
    }

    setUser(currentUser);
    const docRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudentId(data.studentId || null);
        setFundRequest(data.fundRequest || null);
        setReason(data.reason || "");
        setAmount(data.amount || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setStatus(data.status || "Pending");
        setIsAdmin(data.isAdmin || false);
        setRejectionReason(data.rejectionReason || "");

        if (data.studentId && data.fundRequest && data.reason && data.amount) {
          setSubmitted(true);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
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
    }
  }, [isAdmin]);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (type === "studentId") setStudentId(base64String);
      if (type === "fundRequest") setFundRequest(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      showNotification("User not logged in!", "error");
      return;
    }

    if (
      !studentId ||
      !fundRequest ||
      !reason.trim() ||
      !amount ||
      !phone.trim() ||
      !address.trim()
    ) {
      showNotification("Please fill all fields.", "error");
      return;
    }

    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone)) {
      showNotification("Invalid 10-digit Indian phone number.", "error");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          studentId,
          fundRequest,
          reason,
          amount,
          phone,
          address,
          status: "Pending",
          rejectionReason: "",
        },
        { merge: true }
      );
      setSubmitted(true);
      showNotification("Funding request submitted successfully!", "success");
    } catch (error) {
      console.error("Error submitting request:", error);
      showNotification("Submission failed. Please try again.", "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === "Rejected") {
        const rejectionReason = prompt("Enter rejection reason:");
        if (!rejectionReason || rejectionReason.trim() === "") {
          showNotification("Rejection reason required.", "error");
          return;
        }
        await updateDoc(doc(db, "users", id), {
          status,
          rejectionReason,
        });
      } else {
        await updateDoc(doc(db, "users", id), { status });
      }
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      showNotification(`${status} successfully!`, "success");
    } catch (error) {
      console.error("Status update error:", error);
      showNotification("Failed to update status. Try again.", "error");
    }
  };

  const handleReSubmit = async () => {
    if (!user) {
      showNotification("User not logged in!", "error");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        status: "Pending",
        rejectionReason: "",
      });
      setStatus("Pending");
      setRejectionReason("");
      setSubmitted(false);
      showNotification("You can now re-submit your request.", "success");
    } catch (error) {
      console.error("Re-submit error:", error);
      showNotification("Failed to reset. Try again.", "error");
    }
  };

  return (
    <div className={styles.dashboardPage}>
      {notification.message && (
        <div
          className={`${styles.notification} ${
            styles[notification.type] || styles.info
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className={styles.container}>
        <h1>{isAdmin ? "Admin Dashboard" : "Student Dashboard"}</h1>

        {isAdmin ? (
          <>
            <h3>Pending Requests</h3>
            {pendingRequests.length === 0 ? (
              <p>No pending requests</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className={styles.card}>
                  {req.email && (
                    <p>
                      <strong>Email:</strong> {req.email}
                    </p>
                  )}
                  <p>
                    <strong>Reason:</strong> {req.reason}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{req.amount}
                  </p>
                  <p>
                    <strong>Phone:</strong> {req.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {req.address}
                  </p>
                  <a
                    href={req.studentId}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View ID
                  </a>
                  <br />
                  <a
                    href={req.fundRequest}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Request
                  </a>
                  <div className={styles.actions}>
                    <button onClick={() => updateStatus(req.id, "Approved")}>
                      Approve
                    </button>
                    <button onClick={() => updateStatus(req.id, "Rejected")}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {!submitted && (
              <>
                <div className={styles.uploadSection}>
                  <label>Upload Student ID (Max 400 KB):</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, "studentId")}
                  />
                  {studentId && <p>Uploaded ✅</p>}
                </div>

                <div className={styles.uploadSection}>
                  <label>Upload Fund Request (Max 400 KB):</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, "fundRequest")}
                  />
                  {fundRequest && <p>Uploaded ✅</p>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d{0,10}$/.test(input)) setPhone(input);
                    }}
                    placeholder="10-digit phone"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Address (max 250):</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Reason (max 500):</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Required Amount (max ₹10L):</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={
                    !studentId ||
                    !fundRequest ||
                    !reason.trim() ||
                    !amount ||
                    !phone.trim() ||
                    !address.trim() ||
                    !/^[6-9]\d{9}$/.test(phone)
                  }
                >
                  Submit Request
                </button>
              </>
            )}

            {submitted && (
              <>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        status === "Approved"
                          ? "green"
                          : status === "Rejected"
                          ? "red"
                          : "orange",
                      fontWeight: "bold",
                    }}
                  >
                    {status}
                  </span>
                </p>
                {status === "Rejected" && rejectionReason && (
                  <p>
                    <strong>Reason for Rejection:</strong> {rejectionReason}
                  </p>
                )}
                {status === "Rejected" && (
                  <button onClick={handleReSubmit} className={styles.submitBtn}>
                    Re-submit Request
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
