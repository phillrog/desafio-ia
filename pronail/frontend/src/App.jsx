import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import TechnicianView from "./components/TechnicianView";
import ClientView from "./components/ClientView";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [personRole, setPersonRole] = useState(null);
  const [personId, setPersonId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedPersonRole = localStorage.getItem("personRole");
    const storedPersonId = localStorage.getItem("personId");

    if (token && storedPersonRole && storedPersonId) {
      setIsLoggedIn(true);
      setPersonRole(storedPersonRole);
      setPersonId(storedPersonId);
    }
  }, []);

  const handleLoginSuccess = (token, email, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("personRole", role);
    localStorage.setItem("personId", email);
    setIsLoggedIn(true);
    setPersonRole(role);
    setPersonId(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("personRole");
    localStorage.removeItem("personId");
    setIsLoggedIn(false);
    setPersonRole(null);
    setPersonId(null);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        className="absolute bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Sair
      </button>
      {personRole && personRole === "client" ? (
        <ClientView personRole={personRole} personId={personId} />
      ) : (
        <TechnicianView personRole={personRole} personId={personId} />
      )}
    </div>
  );
};

export default App;
