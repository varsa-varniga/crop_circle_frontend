import React, { useEffect, useState } from "react";
import axios from "axios";

import { Box, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PostCard from "../components/PostCard.jsx";
import AddPostModal from "../components/AddPostModal.jsx"; // import modal

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const storedUser = localStorage.getItem("user");
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = loggedInUser?._id;

  const circleId = "691458e70454e9306bf21990"; // can make dynamic if needed

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/circle/${circleId}`);
      const formattedPosts = res.data.posts.map(p => ({
        ...p,
        media_url: p.media_url ? `http://localhost:5000${p.media_url}` : null
      }));
      setPosts(formattedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Update comments after adding comment/reply
  const updatePostComments = (postId, newComments) => {
    setPosts(prev =>
      prev.map(p => (p._id === postId ? { ...p, comments: newComments } : p))
    );
  };

  // Remove post after deletion
  const deletePostFromState = postId => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  // Add new post to state
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]); // add to top of feed
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", px: 2, pt: 2 }}>
      {posts.map(post => (
        <PostCard
          key={post._id}
          id={post._id}
          username={post.user_id?.name}
          avatarSrc={post.user_id?.profile_photo ? `http://localhost:5000${post.user_id.profile_photo}` : ""}
          content={post.content}
          image={post.media_url}
          likes={post.likes}
          comments={post.comments}
          type={post.type}
          pinned={post.pinned}
          user_id={post.user_id?._id}
          updatePostComments={updatePostComments}
          deletePostFromState={deletePostFromState}
        />
      ))}

      {/* Floating "+" button */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 80, right: 20, zIndex: 999 }}
        onClick={() => setOpenModal(true)}
      >
        <AddIcon />
      </Fab>

      {/* AddPostModal */}
      {openModal && (
  <AddPostModal
    userId={userId}          // <--- pass it here
    circleId={circleId}
    onPostCreated={handlePostCreated}
  />
)}


    </Box>
  );
};

export default FeedPage;
