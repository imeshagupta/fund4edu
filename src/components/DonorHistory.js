import React, { useState, useEffect } from "react";
import { db, auth } from "../services/Firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import styles from "../styles/DonorHistory.module.css";

const DonorHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonationHistory = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const donationsQuery = query(
          collection(db, "donations"),
          where("donorUid", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(donationsQuery);

        const donationPromises = querySnapshot.docs.map(async (docSnap) => {
          const donation = docSnap.data();
          const donationId = docSnap.id;

          let studentName = "";

          if (donation.studentUid) {
            const studentRef = doc(db, "students", donation.studentUid);
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
              console.warn(`Student not found: UID ${donation.studentUid}`);
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
        console.error("Error fetching donation history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationHistory();
  }, []);

  if (loading) {
    return <p>Loading donation history...</p>;
  }

  return (
    <div className={styles.historyContainer}>
      <h2>Your Donation History</h2>

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
