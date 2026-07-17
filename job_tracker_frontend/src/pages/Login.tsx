import { type ChangeEvent, useState } from "react";
import instance from "../api/axios.ts";
import InputField from "../components/InputField.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

interface loginData {
  email: string;
  password: string;
}

const Login = () => {
  const [loginData, setLoginData] = useState<loginData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.id;
    setLoginData((prev) => ({ ...prev, [field]: event.target.value.trim() }));
  };

  const handleSubmit = async (data: loginData) => {
    setLoading(true);
    try {
      const response = await instance.post("/auth/login", data);
      const token = response.data.access_token;
      console.log(response, token);
      if (token) {
        login(token);
        navigate("/dashboard");
      }
      console.log(token);
    } catch (error: any) {
      console.log("this is the error", error.response);
      setError("Invalid Credentials, Please try again!!!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-sky-700">
      {error && <div className="text-rose-300 text-sm mt-2">{error}</div>}
      {loading && <div>Loading....</div>}

      <div className="flex flex-col">
        <InputField
          type="text"
          placeholder="Email"
          id="email"
          value={loginData.email}
          handleChange={handleLogin}
        />
        <InputField
          type="text"
          placeholder="Password"
          id="password"
          value={loginData.password}
          handleChange={handleLogin}
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
          onClick={() => handleSubmit(loginData)}
        >
          Submit
        </button>
      </div>

      <div className="text-gray-300 text-sm mt-2">
        New User?{" "}
        <button className="text-sky-500" onClick={() => navigate("/register")}>
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
