import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";

const API_CROP = "http://localhost:5000/api/crop-circle";

export default function CompleteProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [circle, setCircle] = useState(null);

  const [cropName, setCropName] = useState("");
  const [district, setDistrict] = useState("");
  const [experienceLevel, setExperienceLevel] = useState(
    user?.experience_level || "beginner"
  );

  const districts = [
    "Bangalore North",
    "Bangalore South",
    "Bangalore East",
    "Bangalore West",
    "Mysore",
    "Tumkur",
    "Chikkaballapur",
    "Erode",
    "Salem",
    "Tirupur",
  ];

  // ✅ Check if user already joined a crop circle
  useEffect(() => {
    const checkCircle = async () => {
      try {
        const res = await axios.get(`${API_CROP}/get-my-circle`, {
          params: { user_id: user._id },
        });
        if (res.data.alreadyJoined) {
          setAlreadyJoined(true);
          setCircle(res.data.circle);
        }
      } catch (err) {
        console.error("Error fetching circle info:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    checkCircle();
  }, [user._id]);

  const handleSubmit = async () => {
    if (!cropName || !district) return alert("Please select crop type and district");

    try {
      setLoading(true);

      const res = await axios.post(`${API_CROP}/join-or-create`, {
        user_id: user._id,
        crop_name: cropName,
        district,
      });

      const updatedUser = { ...user, crop_name: cropName, district };
      login(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setAlreadyJoined(true);
      setCircle(res.data.circle);
      alert(res.data.message);
    } catch (err) {
      console.error("Error joining/creating circle:", err.response?.data || err.message);
      alert("Failed to join or create crop circle");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (alreadyJoined && circle) {
    return (
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 10,
          p: 3,
          bgcolor: "#fafafa",
          borderRadius: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: "#16a34a" }}>
          Your Crop Circle
        </Typography>
        <Typography>
          Crop: <strong>{circle.crop_name}</strong>
        </Typography>
        <Typography>
          District: <strong>{circle.district}</strong>
        </Typography>
        <Typography>
          Members: <strong>{circle.members.length}</strong>
        </Typography>
        <Typography>
          Mentors: <strong>{circle.mentors.length}</strong>
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: "#16a34a" }}
          onClick={() => navigate("/profile")}
        >
          Go to Profile
        </Button>
      </Box>
    );
  }

  // Form for joining/creating a crop circle
  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 10,
        p: 3,
        bgcolor: "#fafafa",
        borderRadius: 2,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center", color: "#16a34a" }}>
        Complete Your Profile
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Crop Name"
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>District</InputLabel>
          <Select value={district} label="District" onChange={(e) => setDistrict(e.target.value)}>
            {districts.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Experience Level</InputLabel>
          <Select
            value={experienceLevel}
            label="Experience Level"
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="expert">Expert</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          sx={{ bgcolor: "#16a34a", fontWeight: 600 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </Stack>
    </Box>
  );
}
