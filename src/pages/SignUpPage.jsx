import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Box, Typography, TextField, Button, Stack, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const API = "http://localhost:5000/api/auth";

export default function SignUpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) return alert("All fields are required");

    try {
      setLoading(true);
      const res = await axios.post(`${API}/register`, {
        name,
        email,
        password,
        experience_level: experienceLevel,
      });

      const userData = res.data.user;
      login(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect to complete profile to select crop type
      navigate("/complete-profile");
    } catch (err) {
      console.error("Sign-up error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 10, p: 3, bgcolor: "#fafafa", borderRadius: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "#16a34a" }}>Sign Up</Typography>
      <Stack spacing={2}>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />

        <FormControl fullWidth>
          <InputLabel>Experience Level</InputLabel>
          <Select value={experienceLevel} label="Experience Level" onChange={(e) => setExperienceLevel(e.target.value)}>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="expert">Expert</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" sx={{ bgcolor: "#16a34a", fontWeight: 600 }} onClick={handleSignUp} disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </Stack>
    </Box>
  );
}
