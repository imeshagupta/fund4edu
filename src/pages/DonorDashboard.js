import React, { useState, useEffect } from "react";
import { auth, db } from "../services/Firebase";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "../styles/DonorDashboard.module.css";
import Notification from "../components/Notification";

const DonorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate("/");
        return;
      }

      const querySnapshot = await getDocs(collection(db, "users"));
      const approvedStudents = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Approved") {
          approvedStudents.push({ id: doc.id, ...data });
        }
      });
      setStudents(approvedStudents);
    };

    fetchUserData();
  }, [navigate]);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const markAsPaid = async (studentId, paidAmount, paymentScreenshot) => {
    if (!paidAmount || isNaN(paidAmount) || Number(paidAmount) <= 0) {
      showNotification("Please enter a valid paid amount.", "error");
      return;
    }

    if (!paymentScreenshot) {
      showNotification("Please upload payment screenshot.", "error");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      showNotification("User not authenticated.", "error");
      return;
    }

    const donorUid = currentUser.uid;

    try {
      // Retrieve donor's full name from the 'users' collection
      const donorDocRef = doc(db, "users", donorUid);
      const donorDocSnap = await getDoc(donorDocRef);

      if (!donorDocSnap.exists()) {
        showNotification("Donor information not found.", "error");
        return;
      }

      const donorData = donorDocSnap.data();
      const donorName = donorData.fullName || "Anonymous";

      // Update the student's document with payment status
      await updateDoc(doc(db, "users", studentId), {
        status: "Paid",
        paidAmount: Number(paidAmount),
        paymentProof: paymentScreenshot,
        lastDonorName: donorName,
      });

      // Add donation record to Firestore
      await addDoc(collection(db, "donations"), {
        studentUid: studentId,
        donorUid,
        donorName: donorName,
        amount: Number(paidAmount),
        status: "paid",
        paymentProof: paymentScreenshot,
        timestamp: new Date(),
      });

      showNotification("Payment goes on Admin's review", "success");
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error updating payment status:", error);
      showNotification("Something went wrong while updating status.", "error");
    }
  };

  return (
    <div className={styles.container}>
      <Notification message={notification.message} type={notification.type} />

      <h2>Welcome, Donor</h2>
      <p className={styles.subtitle}>Here are students who need your help</p>

      {selectedStudent ? (
        <div className={styles.selectedStudentSection}>
          <h3>{selectedStudent.fullName}</h3>

          <div className={styles.accountDetails}>
            <p>
              <strong>Bank Name:</strong> {selectedStudent.bankName || "N/A"}
            </p>
            <p>
              <strong>Account Number:</strong>{" "}
              {selectedStudent.accountNumber || "N/A"}
            </p>
            <p>
              <strong>IFSC Code:</strong> {selectedStudent.ifscCode || "N/A"}
            </p>
            <p>
              <strong>UPI ID:</strong> {selectedStudent.upiId || "N/A"}
            </p>
          </div>

          <div className={styles.paymentSection}>
            <label>
              <strong>Enter Paid Amount (₹):</strong>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="e.g. 5000"
                className={styles.amountInput}
              />
            </label>

            <label>
              <strong>Upload Payment Screenshot:</strong>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const maxWidth = 800; // scale down width
                        const scaleSize = maxWidth / img.width;
                        canvas.width = maxWidth;
                        canvas.height = img.height * scaleSize;

                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const compressedDataUrl = canvas.toDataURL(
                          "image/jpeg",
                          0.6
                        ); // compression here
                        setPaymentScreenshot(compressedDataUrl);
                        console.log(
                          "Compressed image base64 length:",
                          compressedDataUrl.length
                        );
                      };
                      img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className={styles.amountInput}
              />
            </label>
            {paymentScreenshot && <p>Uploaded ✅</p>}

            <div className={styles.buttonGroup}>
              <button
                className={styles.paidBtn}
                onClick={() =>
                  markAsPaid(selectedStudent.id, paidAmount, paymentScreenshot)
                }
                disabled={!paymentScreenshot}
              >
                Mark as Paid
              </button>

              <button
                className={styles.backBtn}
                onClick={() => setSelectedStudent(null)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      ) : students.length === 0 ? (
        <p className={styles.emptyMessage}>No approved funding requests yet.</p>
      ) : (
        <div className={styles.studentList}>
          {students.map((student) => (
            <div key={student.id} className={styles.studentCard}>
              <h3>
                {student.fullName ||
                  student.name ||
                  student.studentName ||
                  "Unnamed Student"}
              </h3>

              <div className={styles.cardContent}>
                <div className={styles.leftDetails}>
                  <p>
                    <strong>University:</strong> {student.university || "N/A"}
                  </p>
                  <p>
                    <strong>Contact No:</strong> {student.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {student.address || "N/A"}
                  </p>
                  <p>
                    <strong>Reason:</strong> {student.reason}
                  </p>
                  <p>
                    <strong>Required Amount:</strong> ₹{student.amount}
                  </p>
                </div>

                <div className={styles.rightImages}>
                  <div>
                    <p>
                      <strong>Student ID:</strong>
                    </p>
                    <a
                      href={student.studentId || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={student.studentId || "default-image.jpg"}
                        alt="Student ID"
                      />
                    </a>
                  </div>
                  <div>
                    <p>
                      <strong>Proof:</strong>
                    </p>
                    <a
                      href={student.fundRequest || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={student.fundRequest || "default-image.jpg"}
                        alt="Fund Proof"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <button
                className={styles.donateBtn}
                onClick={() => {
                  setSelectedStudent(student);
                  setPaidAmount("");
                  setPaymentScreenshot(null);
                }}
              >
                Interested in
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
