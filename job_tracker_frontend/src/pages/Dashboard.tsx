import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import instance from "../api/axios.ts";
import ApplicationCard from "../components/ApplicationCard.tsx";
import type { Application } from "../types";

// interface Application {
//   id: number;
//   company_name: string;
//   role: string;
//   application_status: string;
//   portal: string;
//   date_applied: string;
//   date_of_interview: string | null;
//   user_id: number;
// }

const Dashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchApplications = async () => {
    const response = await instance.get("/application");
    // console.log(response);
    setApplications(response.data);
  };

  const WS_EVENTS = [
    "application_created",
    "application_updated",
    "application_deleted",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/application/ws?token=${token}`,
    );

    ws.onmessage = (event) => {
      const { event: type } = JSON.parse(event.data);
      if (WS_EVENTS.includes(type)) fetchApplications();
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const createApplication = () => {
    navigate("/application/new");
  };

  const handleDelete = async (app_id: number) => {
    await instance.delete(`/application/${app_id}`);
    setApplications((prev) => prev.filter((app) => app.id !== app_id));
  };

  return (
    <div className="m-4">
      <section className="flex gap-2">
        <button
          className="text-zinc-50 text-sm font-semibold bg-linear-to-b from-cyan-300 to-indigo-600 p-2 rounded-2xl min-w-40 hover:from-cyan-400 hover:to-indigo-700"
          onClick={createApplication}
        >
          Create New &rarr;
        </button>
        <button
          className="text-zinc-50 text-sm font-semibold bg-linear-to-b from-orange-300 to-rose-500 p-2 rounded-2xl min-w-40 hover:from-orange-400 hover:to-rose-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>
      <section className="flex flex-row gap-4">
        {applications.map((item) => {
          return (
            <ApplicationCard
              key={item.id}
              application={item}
              handleDelete={handleDelete}
            />
          );
        })}
      </section>
    </div>
  );
};

export default Dashboard;
