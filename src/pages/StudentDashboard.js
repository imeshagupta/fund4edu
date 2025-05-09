import React, { useEffect, useState } from "react";
import { auth, db } from "../services/Firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import styles from "../styles/StudentDashboard.module.css";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [fundRequest, setFundRequest] = useState(null);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [status, setStatus] = useState("Pending");
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [step, setStep] = useState(1);
  const [donations, setDonations] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);

  const navigate = useNavigate();

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchDonations = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "donations"),
        where("studentUid", "==", user.uid),
        where("status", "in", ["paid", "approved", "verified"])
      );

      const querySnapshot = await getDocs(q);
      const donationsList = [];
      let total = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        donationsList.push(data);
        total += Number(data.amount);
      });

      setDonations(donationsList);
      setTotalCollected(total);
    };

    fetchDonations();
  }, []);
  const numericAmount = parseFloat(amount);
  const percentage =
    numericAmount > 0
      ? Math.min((totalCollected / numericAmount) * 100, 100)
      : 0;

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
        setAccountNumber(data.accountNumber || "");
        setIfscCode(data.ifscCode || "");
        setBankName(data.bankName || "");
        setUpiId(data.upiId || "");

        if (data.status === "Rejected" && data.rejectionReason) {
          setReason(data.rejectionReason);
        }

        if (
          data.studentId &&
          data.fundRequest &&
          data.reason &&
          data.amount &&
          data.accountNumber &&
          data.ifscCode &&
          data.bankName
        ) {
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
  const [studentIdSize, setStudentIdSize] = useState(null);
  const [fundRequestSize, setFundRequestSize] = useState(null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeInBytes = 400 * 1024;

    if (file.size > maxSizeInBytes) {
      showNotification("Please upload a file under 400 KB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const fileSizeKB = (file.size / 1024).toFixed(1) + " KB";

      if (type === "studentId") {
        setStudentId(base64String);
        setStudentIdSize(fileSizeKB);
      }

      if (type === "fundRequest") {
        setFundRequest(base64String);
        setFundRequestSize(fileSizeKB);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      showNotification("User not logged in!", "error");
      return;
    }

    if (address.length > 250) {
      showNotification("Address cannot exceed 250 characters.", "error");
      return;
    }

    if (reason.length > 500) {
      showNotification("Reason cannot exceed 500 characters.", "error");
      return;
    }

    if (
      !studentId ||
      !fundRequest ||
      !reason.trim() ||
      !amount ||
      !phone.trim() ||
      !address.trim() ||
      !accountNumber.trim() ||
      !ifscCode.trim() ||
      !bankName.trim()
    ) {
      showNotification("Please fill all required fields.", "error");
      return;
    }

    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone)) {
      showNotification(
        "Please enter a valid 10-digit Indian phone number.",
        "error"
      );
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
          accountNumber,
          ifscCode,
          bankName,
          upiId,
          status: "Pending",
        },
        { merge: true }
      );
      setSubmitted(true);
      setStatus("Pending");
      showNotification("Funding request submitted successfully!", "success");
    } catch (error) {
      showNotification("Failed to submit request. Please try again.", "error");
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
      setReason("");
      setAmount("");
      setPhone("");
      setAddress("");
      setStudentId(null);
      setFundRequest(null);
      setAccountNumber("");
      setIfscCode("");
      setBankName("");
      setUpiId("");
      setSubmitted(false);
      showNotification("You can now re-submit your request.", "success");
    } catch (error) {
      showNotification("Failed to reset request. Please try again.", "error");
    }
  };

  const renderStepOne = () => (
    <>
      <div className={styles.uploadSection}>
        <label>Upload Student ID (Max 400 KB):</label>
        <input
          type="file"
          className={styles.input}
          onChange={(e) => handleFileUpload(e, "studentId")}
        />
        {studentId && <p>Uploaded ✅ ({studentIdSize})</p>}
      </div>

      <div className={styles.uploadSection}>
        <label>Upload College Approved Fund Request (Max 400 KB):</label>
        <input
          type="file"
          className={styles.input}
          onChange={(e) => handleFileUpload(e, "fundRequest")}
        />
        {fundRequest && <p>Uploaded ✅ ({fundRequestSize})</p>}
      </div>

      <div className={styles.inputGroup}>
        <label>Phone Number:</label>
        <input
          type="tel"
          value={phone}
          className={styles.input}
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d{0,10}$/.test(input)) setPhone(input);
          }}
          placeholder="Enter 10-digit phone number"
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Address (250 chars):</label>
        <textarea
          value={address}
          className={styles.input}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={250}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => setStep(2)} className={styles.submitBtn}>
          Next
        </button>
      </div>
    </>
  );

  const renderStepTwo = () => (
    <>
      <div className={styles.inputGroup}>
        <label>Reason for Request (500 chars):</label>
        <textarea
          value={reason}
          className={styles.input}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Required Amount (₹):</label>
        <input
          type="number"
          className={styles.input}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => setStep(1)} className={styles.backBtn}>
          Back
        </button>
        <button onClick={() => setStep(3)} className={styles.submitBtn}>
          Next
        </button>
      </div>
    </>
  );

  const renderStepThree = () => (
    <>
      <div className={styles.inputGroup}>
        <label>Bank Account Number:</label>
        <input
          type="text"
          className={styles.input}
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>IFSC Code:</label>
        <input
          type="text"
          className={styles.input}
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Bank Name:</label>
        <input
          type="text"
          className={styles.input}
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>UPI ID (optional):</label>
        <input
          type="text"
          className={styles.input}
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="example@upi"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => setStep(2)} className={styles.backBtn}>
          Back
        </button>
        <button onClick={handleSubmit} className={styles.submitBtn}>
          Submit Request
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.dashboardPage}>
      {notification.message && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.container}>
        <h1>{isAdmin ? "Admin Dashboard" : "Student Dashboard"}</h1>
        {isAdmin && (
          <p className={styles.pendingInfo}>
            Total Pending Requests: {pendingRequests.length}
          </p>
        )}
        {!isAdmin && !submitted && (
          <>
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
          </>
        )}
        {submitted && !isAdmin && status === "Pending" && (
          <div
            className={`${styles.statusBox} ${
              status === "Pending"
                ? styles.pending
                : status === "Approved"
                ? styles.approved
                : styles.rejected
            }`}
          >
            <strong>Status:</strong> {status}
          </div>
        )}

        {!isAdmin && submitted && status === "Rejected" && (
          <div className={styles.rejectedBox}>
            <p>
              <strong>Rejection Reason:</strong> {reason}
            </p>
            <button onClick={handleReSubmit} className={styles.submitBtn}>
              Re-submit Request
            </button>
          </div>
        )}

        {!isAdmin && submitted && status === "Paid" && percentage < 100 && (
          <div className={styles.donationsSection}>
            <h2>Donation Progress</h2>
            <div style={{ width: 200, height: 200, margin: "1rem auto" }}>
              <CircularProgressbar
                value={percentage}
                text={`${Math.floor(percentage)}%`}
                styles={buildStyles({
                  pathColor: percentage === 100 ? "#00C853" : "#f44336",
                  textColor: "#333",
                  trailColor: "#ddd",
                })}
              />
            </div>
            <p style={{ textAlign: "center" }}>
              ₹{totalCollected} raised out of ₹{amount}
            </p>
            <h3>Donors List</h3>
            <ul>
              {donations.map((donation, index) => (
                <li key={index}>
                  {donation.donorName || "Anonymous"} - ₹{donation.amount}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isAdmin && submitted && percentage === 100 && (
          <div className={styles.donationsSection}>
            <h2>Fund Complete 🎉</h2>
            <div style={{ width: 200, height: 200, margin: "1rem auto" }}>
              <CircularProgressbar
                value={100}
                text={`100%`}
                styles={buildStyles({
                  pathColor: "#00C853",
                  textColor: "#333",
                  trailColor: "#ddd",
                })}
              />
            </div>
            <p style={{ textAlign: "center" }}>
              ₹{totalCollected} raised towards your goal of ₹{amount}.
            </p>
            <h3>Donors List</h3>
            <ul>
              {donations.map((donation, index) => (
                <li key={index}>
                  {donation.donorName || "Anonymous"} donated ₹{donation.amount}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isAdmin && submitted && Math.floor(percentage) === 100 && (
          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: "green", fontWeight: "bold" }}>Paid</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
