import React, { useState } from 'react';
import { Fab, Modal, Box, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const AddPostModal = ({ userId, circleId, onPostCreated }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [type, setType] = useState('update');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content && !mediaUrl) return alert("Post cannot be empty");

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/posts/create', {
        user_id: userId,
        circle_id: circleId,
        content,
        media_url: mediaUrl || null, // ✅ send null if empty
        type,
      });

      console.log("Post created:", res.data);
      onPostCreated({
        id: res.data.post._id,
        username: res.data.post.user_id?.name || "Unknown",
        avatarSrc: res.data.post.user_id?.profile_photo || "/default-avatar.png",
        time: new Date(res.data.post.created_at).toLocaleString(),
        content: res.data.post.content,
        image: res.data.post.media_url || null,
        likes: res.data.post.likes.length,
        likedByMe: res.data.post.likes.includes(userId),
        comments: res.data.post.comments || [],
        type: res.data.post.type,
        pinned: res.data.post.pinned,
      });

      setContent('');
      setMediaUrl('');
      setType('update');
      setOpen(false);
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
      alert("Failed to create post");
    }
    setLoading(false);
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 20 }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 400,
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2,
            mx: 'auto',
            mt: '20vh',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            label="What's on your mind?"
            multiline
            rows={3}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <TextField
            label="Media URL (optional)"
            fullWidth
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Post Type</InputLabel>
            <Select value={type} label="Post Type" onChange={(e) => setType(e.target.value)}>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="tip">Tip</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="question">Question</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePost}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default AddPostModal;
