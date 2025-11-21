import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { googleSignIn } from "../firebase";

const API = "http://localhost:5000/api/auth";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (!user.crop_name || !user.experience_level) {
        navigate("/complete-profile");
      } else {
        navigate("/profile");
      }
    }
  }, [user]);

  const validate = () => {
    if (!email) return setError("Email is required") && false;
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Invalid email format") && false;
    if (!password) return setError("Password is required") && false;
    setError("");
    return true;
  };

  const handleEmailLogin = async () => {
    if (!validate()) return;

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");

      login(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (!data.user.crop_name || !data.user.experience_level) {
        navigate("/complete-profile");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error("Email login error:", err);
      setError("Server error, try again later.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { idToken } = await googleSignIn();
      const res = await fetch(`${API}/login-google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Google login failed");

      login(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (!data.user.crop_name || !data.user.experience_level) {
        navigate("/complete-profile");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />

      <button onClick={handleEmailLogin}>Login</button>
      <hr />
      <button
        style={{
          background: "#4285F4",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleGoogleLogin}
      >
        Login with Google
      </button>
    </div>
  );
}
