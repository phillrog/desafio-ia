import React, { useState, useEffect } from "react";
import { clientService } from "../../services/api";

const ClientSelector = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientService.getClients();
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    onSelectClient(clientId);
  };

  return (
    <select
      className="border rounded p-2"
      value={selectedClientId}
      onChange={handleClientChange}
    >
      <option value="">Select a client</option>
      {clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.firstName} {client.lastName}
        </option>
      ))}
    </select>
  );
};

export default ClientSelector;
