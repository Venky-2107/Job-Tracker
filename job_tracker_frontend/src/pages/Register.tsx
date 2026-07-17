import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField.tsx";
import instance from "../api/axios.ts";

interface userDetails {
  name: string;
  email: string;
  password: string;
}

const Register = () => {
  const [user, setUser] = useState<userDetails>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = (e: any) => {
    const field = e.target.id;
    setUser((prev) => ({ ...prev, [field]: e.target.value.trim() }));
  };

  const handleCreate = async (payload: userDetails) => {
    setLoading(true);
    try {
      const response = await instance.post("/auth/register", payload);
      if (response && response.status === 201) {
        setMessage("User created successfully!!! Redirecting to Login!!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
      console.log(response);
    } catch (error: any) {
      setError("Registration could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
    return payload;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-sky-700">
      {message && <div className="text-green-400 text-sm mt-2">{message}</div>}
      {error && <div className="text-rose-300 text-sm mt-2">{error}</div>}
      {loading && <div>Loading....</div>}

      {!message && (
        <>
          <div className="flex flex-col">
            <InputField
              type="text"
              placeholder="Name"
              id="name"
              value={user.name}
              handleChange={handleRegister}
            />

            <InputField
              type="text"
              placeholder="Email"
              id="email"
              value={user.email}
              handleChange={handleRegister}
            />

            <InputField
              type="text"
              placeholder="Password"
              id="password"
              value={user.password}
              handleChange={handleRegister}
            />
          </div>

          <div>
            <button
              className="
            w-20
            rounded-lg
            bg-cyan-500
            text-slate-900
            font-semibold
            py-2
            transition
            hover:bg-cyan-400
            active:scale-95
            shadow-lg
            shadow-cyan-500/30
            "
              onClick={() => handleCreate(user)}
            >
              Create
            </button>
          </div>
        </>
      )}

      <div className="text-gray-300 text-sm mt-2">
        Already a User?{" "}
        <button className="text-sky-500" onClick={() => navigate("/")}>
          Log in
        </button>
      </div>
    </div>
  );
};

export default Register;
