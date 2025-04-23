import React, { useEffect, useState } from "react";
import { auth, db } from "../services/Firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import styles from "../styles/StudentDashboard.module.css";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [fundRequest, setFundRequest] = useState(null);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Pending");
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate();

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
        setStatus(data.status || "Pending");
        setIsAdmin(data.isAdmin || false); // Check if user is admin

        if (data.studentId && data.fundRequest && data.reason && data.amount) {
          setSubmitted(true);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // If the user is admin, show requests to approve/reject
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
      alert("User not logged in!");
      return;
    }

    if (!studentId || !fundRequest || !reason.trim() || !amount) {
      alert("Please fill all fields.");
      return;
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        studentId,
        fundRequest,
        reason,
        amount,
        status: "Pending",
      },
      { merge: true }
    );

    setSubmitted(true);
    alert("Funding request submitted successfully!");
  };

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
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        <h2>{isAdmin ? "Admin Dashboard" : "Student Dashboard"}</h2>
        {isAdmin ? (
          <div>
            <h3>Pending Requests</h3>
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
                  <a
                    href={req.studentId}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View ID
                  </a>{" "}
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
          </div>
        ) : (
          <>
            {!submitted && (
              <>
                <div className={styles.uploadSection}>
                  <label>Upload Student ID:</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, "studentId")}
                  />
                  {studentId && <p>Uploaded ✅</p>}
                </div>

                <div className={styles.uploadSection}>
                  <label>Upload College Approved Fund Request:</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, "fundRequest")}
                  />
                  {fundRequest && <p>Uploaded ✅</p>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Reason for Request:</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Required Amount:</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <button className={styles.submitBtn} onClick={handleSubmit}>
                  Submit Request
                </button>
              </>
            )}

            {submitted && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
