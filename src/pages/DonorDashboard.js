import React, { useState, useEffect } from "react";
import { auth, db } from "../services/Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "../styles/DonorDashboard.module.css";

const DonorDashboard = () => {
  const [students, setStudents] = useState([]);
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

  return (
    <div className={styles.container}>
      <h2>Welcome, Donor</h2>
      <p className={styles.subtitle}>Here are students who need your help</p>

      {students.length === 0 ? (
        <p className={styles.emptyMessage}>No approved funding requests yet.</p>
      ) : (
        <div className={styles.studentList}>
          {students.map((student) => (
            <div key={student.id} className={styles.studentCard}>
              <h3>{student.fullName || "Unnamed Student"}</h3>
              <p>
                <strong>University:</strong> {student.university || "N/A"}
              </p>
              <p>
                <strong>Reason:</strong> {student.reason}
              </p>
              <p>
                <strong>Required:</strong> ₹{student.amount}
              </p>

              <p>
                <strong>Student ID:</strong>
              </p>
              <a
                href={student.studentId}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={student.studentId}
                  alt="Student ID"
                  width="120"
                  style={{ borderRadius: "6px", cursor: "pointer" }}
                />
              </a>

              <p>
                <strong>Fund Request Proof:</strong>
              </p>
              <a
                href={student.fundRequest}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className={styles.fundRequestImage}
                  src={student.fundRequest}
                  alt="Fund Request"
                  width="120"
                  style={{ borderRadius: "6px", cursor: "pointer" }}
                />
              </a>
              <br />
              <button className={styles.donateBtn}>Donate Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
