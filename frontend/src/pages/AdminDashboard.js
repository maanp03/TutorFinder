import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const AdminDashboard = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    axios.get('/admin/clients')
      .then(res => setClients(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ margin: '20px' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: '40px' }}>
        <div>
          <h3>Clients</h3>
          {clients.length > 0 ? (
            <ul>
              {clients.map(client => (
                <li key={client._id}>{client.name}</li>
              ))}
            </ul>
          ) : <p>No clients found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
