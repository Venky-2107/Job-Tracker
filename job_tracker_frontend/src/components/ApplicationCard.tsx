import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "./Modal.tsx";
import type { Application } from "../types";

interface cardProps {
  application: Application;
  handleDelete: (id: number) => void;
}

const ApplicationCard = (props: cardProps) => {
  const navigate = useNavigate();
  const [isModal, setIsModal] = useState(false);
  const statusEmoji: Record<string, string> = {
    applied: "📨",
    in_review: "🔍",
    interview: "🎯",
    selected: "✅",
    rejected: "❌",
    on_hold: "⏸️",
  };

  const onClose = () => {
    setIsModal(false);
  };

  return (
    <div className="flex flex-col w-64 mt-4 rounded-2xl p-4 shadow-lg bg-white border border-gray-100 hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3
          className="text-base font-bold text-gray-800 truncate max-w-[160px]"
          title={props.application.company_name}
        >
          🏢 {props.application.company_name}
        </h3>
        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-medium">
          {props.application.portal}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1 text-sm text-gray-600">
        <span>🏷️ {props.application.role}</span>
        <span>
          {statusEmoji[props.application.application_status] ?? "📋"}{" "}
          {props.application.application_status}
        </span>
        <span>📅 {props.application.date_applied}</span>
        {props.application.date_of_interview !== "N/A" && (
          <span>🗓️ Interview: {props.application.date_of_interview}</span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-1 mt-4">
        <button
          onClick={() => navigate(`/application/${props.application.id}/edit`)}
          className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors"
        >
          Edit 📝
        </button>
        <button
          onClick={() => props.handleDelete(props.application.id)}
          className="flex-1 text-sm bg-cyan-500 hover:bg-cyan-600 text-white py-1.5 rounded-lg transition-colors"
        >
          Delete 🗑️
        </button>
        <button
          onClick={() => setIsModal(true)}
          className="flex-1 text-sm bg-cyan-500 hover:bg-cyan-600 text-white py-1.5 rounded-lg transition-colors"
        >
          View
        </button>
      </div>
      {isModal && (
        <Modal
          application={props.application}
          onClose={onClose}
          statusEmoji={statusEmoji}
        />
      )}
    </div>
  );
};

export default ApplicationCard;

// ✅ ❌ ⚠️ based on the status, add these emoojis
