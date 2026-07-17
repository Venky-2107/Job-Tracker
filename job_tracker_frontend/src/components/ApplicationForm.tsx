import { type ChangeEvent, useState, useEffect } from "react";
import InputField from "./InputField.tsx";
import instance from "../api/axios.ts";
import { useParams, useNavigate } from "react-router-dom";

interface applicationDataType {
  company_name: string;
  role: string;
  application_status: string;
  portal: string;
  date_of_interview: string;
}

const ApplicationForm = () => {
  const [applicationData, setApplicationData] = useState<applicationDataType>({
    company_name: "",
    role: "",
    application_status: "",
    portal: "",
    date_of_interview: "",
  });
  const [error, setError] = useState<string | null>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const fetchApplicationDetails = async (id: number) => {
    try {
      const response = await instance.get(`/application/${id}`);
      const application_data = response.data;

      setApplicationData({
        company_name: application_data.company_name ?? "",
        role: application_data.role ?? "",
        application_status: application_data.application_status ?? "",
        portal: application_data.portal ?? "",
        date_of_interview: application_data.date_of_interview ?? "",
      });
      console.log(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError(
          "The application with specfic ID doesnot exist!! \n Redirecting to dashboard",
        );
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      }
      console.log("error while fetching details", error.response);
    }
  };

  useEffect(() => {
    if (isEdit) {
      console.log("is edit is true here");
      fetchApplicationDetails(Number(id));
    }
  }, [id]);

  const handleFormData = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const field = event.target.id;
    setApplicationData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmitOrCreate = async (data: applicationDataType) => {
    const payload = {
      company_name: data.company_name ?? "",
      role: data.role ?? "",
      application_status: data.application_status ?? "",
      portal: data.portal ?? "",
      date_of_interview: data.date_of_interview ?? "",
    };
    setLoading(true);
    try {
      if (isEdit && id) {
        // edit mode → PUT
        await instance.put(`/application/${id}`, payload);
      } else {
        // create mode → POST
        await instance.post("/application/", payload);
      }
      navigate("/dashboard");
    } catch (error: any) {
      console.log(
        "SOmething went wrong here",
        error.response?.data?.detail || error.message,
      );
      setError("something went wrong while submittiting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="flex flex-col bg-gray-900 min-h-screen justify-center items-center">
        {loading && <span>Submitting....</span>}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {!error && (
          <>
            <InputField
              type="text"
              placeholder="Company Name"
              id="company_name"
              value={applicationData.company_name}
              handleChange={handleFormData}
            />

            <InputField
              type="text"
              placeholder="Role"
              id="role"
              value={applicationData.role}
              handleChange={handleFormData}
            />

            <select
              value={applicationData.application_status}
              id="application_status"
              className="w-60 rounded-lg bg-white/10 border border-white/20
            text-white
            placeholder:text-slate-300
            px-4
            py-3
            m-2
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-2
            focus:ring-cyan-400/40"
              onChange={handleFormData}
              required
            >
              <option value="" disabled selected hidden>
                Select status...
              </option>
              <option value="applied">📨 applied</option>
              <option value="in_review">🔍 in review</option>
              <option value="interview">🎯 interview</option>
              <option value="selected">✅ selected</option>
              <option value="rejected">❌ rejected</option>
              <option value="on_hold">⏸️ on_hold</option>
            </select>

            <InputField
              type="text"
              placeholder="Portal..."
              id="portal"
              value={applicationData.portal}
              handleChange={handleFormData}
            />

            <InputField
              type="date"
              placeholder="Date of Interview"
              id="date_of_interview"
              value={applicationData.date_of_interview}
              handleChange={handleFormData}
              min={new Date().toISOString().split("T")[0]}
            />
            <button
              className="text-white text-sm font-semibold bg-linear-to-b from-orange-300 to-rose-500 m-2 p-2 rounded-2xl min-w-40 hover:from-orange-400 hover:to-rose-600"
              onClick={() => handleSubmitOrCreate(applicationData)}
            >
              {isEdit ? "Submit" : "Create"}
            </button>
            <button
              className="text-white text-sm font-semibold p-2 rounded-2xl min-w-40 hover:from-orange-400 hover:to-rose-600"
              onClick={() => handleSubmitOrCreate(applicationData)}
            >
              &larr; Back to DashBoard
            </button>
          </>
        )}
      </section>
    </>
  );
};

export default ApplicationForm;
