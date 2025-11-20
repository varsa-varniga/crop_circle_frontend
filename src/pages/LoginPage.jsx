import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { googleSignIn } from "../firebase"; // Firebase helper

const API = "http://localhost:5000/api/auth";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user]);

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleEmailLogin = async () => {
    if (!validate()) return; // stop if validation fails

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "User not found. Please sign up.") {
          setError(data.error);
        } else if (data.error === "This account uses Google login. Please login with Google.") {
          setError(data.error);
        } else {
          setError(data.error || "Login failed");
        }
        return;
      }

      login(data.user);
      navigate("/profile");
    } catch (err) {
      console.error("Email login error:", err);
      setError("Server error, try again later.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const { idToken } = await googleSignIn();

      const res = await fetch(`${API}/login-google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google login failed");
        return;
      }

      login(data.user);
      navigate("/profile");
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          {error} 
          {error === "User not found. Please sign up." && (
            <button
              style={{ marginLeft: "1rem", padding: "0.3rem 0.6rem" }}
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          )}
        </div>
      )}

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
          cursor: "pointer"
        }}
        onClick={handleGoogleLogin}
      >
        Login with Google
      </button>
    </div>
  );
}
