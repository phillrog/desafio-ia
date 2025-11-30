import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  technicianService,
  clientService,
  bookingService,
} from "../../services/api";
import { Card } from "../SharedComponents";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalTechnicians, setTotalTechnicians] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [clients, technicians, bookings, aiInteractions] =
          await Promise.all([
            clientService.getClients(),
            technicianService.getTechnicians(),
            bookingService.getBookings()
          ]);

        setTotalClients(clients.data.length);
        setTotalTechnicians(technicians.data.length);
        setTotalBookings(bookings.data.length);        

        setData([
          { name: "Dec", value: 400 },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderLoading = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isLoading) {
    return renderLoading();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Total Clients" value={totalClients} color="blue" />
        <Card title="Total Technicians" value={totalTechnicians} color="green" />
        <Card
          title="Total Bookings"
          value={totalBookings}
          color="purple"
        />
        <Card
          title="AI Interactions"
          value={totalAIInteractions}
          color="orange"
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Client Interactions Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
