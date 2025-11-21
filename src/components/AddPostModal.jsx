import React, { useState } from "react";
import { Fab, Modal, Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const AddPostModal = ({ circleId, onPostCreated }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [type, setType] = useState("update");
  const [loading, setLoading] = useState(false);

  const storedUser = localStorage.getItem("user");
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = loggedInUser?._id;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!userId || !circleId) return alert("User or Circle ID missing!");
    if (!content && !imageFile) return alert("Post cannot be empty");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("circle_id", circleId);
      formData.append("content", content);
      formData.append("type", type);
      if (imageFile) formData.append("image", imageFile);

      // Debug: log all formData entries
      for (let pair of formData.entries()) console.log(pair[0], pair[1]);

      const res = await axios.post(
        "http://localhost:5000/api/posts/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const post = res.data.post;

      const newPost = {
        id: post._id,
        username: post.user_id?.name || "Unknown",
        avatarSrc: post.user_id?.profile_photo ? `http://localhost:5000${post.user_id.profile_photo}` : "/default-avatar.png",
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

      setContent("");
      setImageFile(null);
      setImagePreview("");
      setType("update");
      setOpen(false);
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
      alert("Failed to create post. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <>
      <Fab color="primary" sx={{ position: "fixed", bottom: 80, right: 20 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 400, bgcolor: "background.paper", p: 3, borderRadius: 2, mx: "auto", mt: "20vh", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="What's on your mind?" multiline rows={3} fullWidth value={content} onChange={(e) => setContent(e.target.value)} />

          <Button variant="outlined" component="label">
            Upload Image
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Button>

          {imagePreview && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">Preview:</Typography>
              <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 6 }} />
            </Box>
          )}

          <FormControl fullWidth>
            <InputLabel>Post Type</InputLabel>
            <Select value={type} label="Post Type" onChange={(e) => setType(e.target.value)}>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="tip">Tip</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="question">Question</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handlePost} disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default AddPostModal;
