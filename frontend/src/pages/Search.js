import React, { useState, useContext, useEffect } from "react";
import axios from "../api/axiosInstance";
import { useLocation } from "react-router-dom";

const Search = () => {
  const [tutors, setTutors] = useState([]);
  const [error, setError] = useState("");
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const subject = queryParams.get("subject");

  useEffect(() => {
    axios
      .get(`/tutor/search?subject=${subject}`)
      .then((res) => setTutors(res.data))
      .catch(() => setError("Failed to fetch tutors"));
  }, [subject]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        Search Results for: <span style={styles.subject}>{subject}</span>
      </h2>

      {error && <div style={styles.error}>{error}</div>}

      {tutors.length > 0 ? (
        <div style={styles.grid}>
          {tutors.map((tutor) => (
            <div key={tutor._id} style={styles.card}>
              <h3 style={styles.name}>{tutor.name}</h3>
              <p style={styles.subjects}>
                <strong>Subjects:</strong> {tutor.subjects.join(", ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noResults}>No tutors found.</div>
      )}
    </div>
  );
};

export default Search;

// ------------ Inline Styles ----------------

const styles = {
  container: {
    padding: "30px 40px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  heading: {
    fontSize: "26px",
    marginBottom: "20px",
    color: "#1E3A8A",
  },
  subject: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  error: {
    padding: "10px",
    marginBottom: "15px",
    background: "#FEE2E2",
    color: "#B91C1C",
    borderRadius: "6px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    padding: "20px",
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "0.3s",
  },
  name: {
    fontSize: "20px",
    color: "#1F2937",
    marginBottom: "10px",
  },
  subjects: {
    color: "#4B5563",
    fontSize: "15px",
  },
  noResults: {
    marginTop: "40px",
    textAlign: "center",
    color: "#6B7280",
    fontSize: "18px",
  },
};
