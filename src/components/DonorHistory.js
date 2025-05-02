import React, { useState, useEffect } from "react";
import { db, auth } from "../services/Firebase";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import styles from "../styles/DonorHistory.module.css";
import Notification from "./Notification";

const DonorHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const donationsQuery = query(
      collection(db, "donations"),
      where("donorUid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(donationsQuery, async (querySnapshot) => {
      try {
        const donationPromises = querySnapshot.docs.map(async (docSnap) => {
          const donation = docSnap.data();
          const donationId = docSnap.id;

          let studentName = "";

          if (donation.studentUid) {
            const studentRef = doc(db, "users", donation.studentUid);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
              const studentData = studentSnap.data();
              studentName =
                studentData.name ||
                studentData.fullName ||
                studentData.studentName ||
                studentData.firstName ||
                "N/A";
            } else {
              setNotification({
                message: `Student not found: UID ${donation.studentUid}`,
                type: "warning",
              });
            }
          }

          return {
            id: donationId,
            ...donation,
            studentName,
          };
        });

        const donationsWithStudentNames = await Promise.all(donationPromises);
        setDonations(donationsWithStudentNames);
      } catch (error) {
        setNotification({
          message: "Error fetching donation history: " + error.message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading donation history...</p>;
  }

  return (
    <div className={styles.historyContainer}>
      <h2>Your Donation History</h2>

      {notification && <Notification {...notification} />}

      {donations.length === 0 ? (
        <p>You have not made any donations yet.</p>
      ) : (
        <div className={styles.donationsList}>
          {donations.map((donation) => (
            <div key={donation.id} className={styles.donationCard}>
              <p>
                <strong>Donated to:</strong> {donation.studentName || "N/A"}
              </p>
              <p>
                <strong>Amount Paid:</strong> ₹{donation.amount}
              </p>
              <p>
                <strong>Status:</strong> {donation.status}
              </p>
              {donation.status === "rejected" &&
                (donation.rejectionReason ? (
                  <p>
                    <strong>Rejection Reason:</strong>{" "}
                    {donation.rejectionReason}
                  </p>
                ) : (
                  <p>
                    <strong>Rejection Reason:</strong> No reason provided
                  </p>
                ))}

              <p>
                <strong>Donation Date:</strong>{" "}
                {donation.timestamp?.seconds
                  ? new Date(
                      donation.timestamp.seconds * 1000
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorHistory;
