import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

// Bootstrap CDN
const bootstrapLink = document.createElement("link");
bootstrapLink.rel = "stylesheet";
bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
document.head.appendChild(bootstrapLink);

const AdminDashboard = () => {
  const [tutors, setTutors] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/admin/tutors')
      .then(res => setTutors(res.data))
      .catch(() => setError('Failed to fetch tutors'));

    axios.get('/admin/clients')
      .then(res => setClients(res.data))
      .catch(() => setError('Failed to fetch clients'));
  }, []);

  const deleteTutor = async (tutorId) => {
    try {
      await axios.delete(`/admin/tutors/${tutorId}`);
      setTutors(tutors.filter(tutor => tutor._id !== tutorId));
    } catch {
      setError('Failed to delete tutor');
    }
  };

  const deleteClient = async (clientId) => {
    try {
      await axios.delete(`/admin/clients/${clientId}`);
      setClients(clients.filter(client => client._id !== clientId));
    } catch {
      setError('Failed to delete client');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light py-5 px-3">
      <h2 className="mb-4 fw-bold text-center">Admin Dashboard</h2>

      {error && (
        <div className="alert alert-danger w-100 text-center" role="alert">
          {error}
        </div>
      )}

      {/* Tutors Table */}
      <div className="w-100" style={{ maxWidth: '1100px' }}>
        <div className="card shadow mb-5">
          <div className="card-header bg-dark text-white text-center fw-semibold">
            Tutors
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Subjects</th>
                  <th>Bio</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tutors.length > 0 ? tutors.map(tutor => (
                  <tr key={tutor._id}>
                    <td>{tutor.name}</td>
                    <td>{tutor.subjects.join(', ')}</td>
                    <td>{tutor.bio}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteTutor(tutor._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center">No tutors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clients Table */}
        <div className="card shadow">
          <div className="card-header bg-secondary text-white text-center fw-semibold">
            Clients
          </div>
          <div className="card-body p-0">
            <table className="table table-striped mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.length > 0 ? clients.map(client => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.grade}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteClient(client._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="text-center">No clients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
