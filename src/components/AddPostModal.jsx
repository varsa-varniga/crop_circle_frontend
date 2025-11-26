import React, { useState, useEffect } from "react";
import {
  Fab,
  Modal,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const AddPostModal = ({ circleId: propCircleId, onPostCreated }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [type, setType] = useState("update");
  const [loading, setLoading] = useState(false);
  const [activeCircleId, setActiveCircleId] = useState(propCircleId || null);
  const [userCircles, setUserCircles] = useState([]);
  const [fetchingCircles, setFetchingCircles] = useState(false);

  const storedUser = localStorage.getItem("user");
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = loggedInUser?._id;

  const isMobile = useMediaQuery("(max-width:600px)");

  // Fetch user's joined circles
  useEffect(() => {
    const fetchJoinedCircles = async () => {
      if (!userId) return;
      setFetchingCircles(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/crop-circle/get-my-circles?user_id=${userId}`
        );
        if (res.data.circles?.length > 0) {
          setUserCircles(res.data.circles);
          if (!propCircleId) setActiveCircleId(res.data.circles[0]._id);
        } else {
          alert("You need to join a crop circle before posting!");
        }
      } catch (err) {
        console.error("Error fetching user circles:", err.response?.data || err.message);
      } finally {
        setFetchingCircles(false);
      }
    };
    fetchJoinedCircles();
  }, [userId, propCircleId]);

  // Handle image selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Create post
  const handlePost = async () => {
    if (!userId) return alert("User not logged in!");
    if (!activeCircleId) return alert("Select a circle before posting!");
    if (!title && !content && !imageFile) return alert("Post cannot be empty!");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("circle_id", activeCircleId); // ✅ always correct active circle
      formData.append("title", title);
      formData.append("content", content);
      formData.append("type", type);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post("http://localhost:5000/api/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const post = res.data.post;

      const newPost = {
        id: post._id,
        title: post.title,
        username: loggedInUser?.name || "Unknown",
        avatarSrc: loggedInUser?.profile_photo
          ? loggedInUser.profile_photo.startsWith("http")
            ? loggedInUser.profile_photo
            : `http://localhost:5000${loggedInUser.profile_photo}`
          : "/default-avatar.png",
        time: post.createdAt ? new Date(post.createdAt).toLocaleString("en-IN") : "Unknown",
        content: post.content,
        image: post.media_url ? `http://localhost:5000${post.media_url}` : null,
        likes: post.likes || [],
        likedByMe: post.likes?.includes(userId),
        comments: post.comments || [],
        type: post.type,
        pinned: post.pinned,
      };

      onPostCreated(newPost);

      // Reset modal
      setTitle("");
      setContent("");
      setImageFile(null);
      setImagePreview("");
      setType("update");
      setOpen(false);
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
      alert("Failed to create post. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 80, right: 20, zIndex: 1000 }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: isMobile ? "90%" : 400,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            mx: "auto",
            mt: isMobile ? "10vh" : "20vh",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "relative",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </IconButton>

          {/* Circle Selector */}
          {userCircles.length > 1 && (
            <FormControl fullWidth>
              <InputLabel>Select Circle</InputLabel>
              <Select
                value={activeCircleId}
                label="Select Circle"
                onChange={(e) => setActiveCircleId(e.target.value)}
              >
                {userCircles.map((circle) => (
                  <MenuItem key={circle._id} value={circle._id}>
                    {circle.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Title */}
          <TextField
            label="Post Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Content */}
          <TextField
            label="What's on your mind?"
            multiline
            rows={3}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Image Upload */}
          <Button variant="outlined" component="label">
            Upload Image
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Button>

          {imagePreview && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">Preview:</Typography>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 6 }}
              />
            </Box>
          )}

          {/* Post Type */}
          <FormControl fullWidth>
            <InputLabel>Post Type</InputLabel>
            <Select value={type} label="Post Type" onChange={(e) => setType(e.target.value)}>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="tip">Tip</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="question">Question</MenuItem>
            </Select>
          </FormControl>

          {/* Submit */}
          <Button
            variant="contained"
            onClick={handlePost}
            disabled={loading || fetchingCircles || !activeCircleId}
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default AddPostModal;
