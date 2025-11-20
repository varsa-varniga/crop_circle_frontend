import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import AddPostModal from "../components/AddPostModal";
import PostCard from "../components/PostCard";
import { Box } from "@mui/material";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const circleId = "691458e70454e9306bf21990"; // your circle ID
  const userId = "6914b2543b0c318f5db0ae38"; // current logged-in user ID

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/circle/${circleId}`);
        const formattedPosts = res.data.posts.map(post => ({
          id: post._id,
          username: post.user_id?.name || "Unknown",
          avatarSrc: post.user_id?.profile_photo || "/default-avatar.png",
          time: post.createdAt
  ? new Date(post.createdAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  : "Unknown",


          content: post.content,
          image: post.media_url,
          likes: post.likes.length,
          likedByMe: post.likes.includes(userId),
          comments: post.comments || [],
          type: post.type,
          pinned: post.pinned,
        }));
        setPosts(formattedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err.response?.data || err.message);
      }
    };

    fetchPosts();
  }, [circleId]);

  // Update a post's comments in state
  const updatePostComments = (postId, newComments) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, comments: newComments } : p))
    );
  };

  return (
    <>
      <TopBar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          pb: "80px"
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: 480, lg: "75%" },
            mx: "auto",
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          {posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              username={post.username}
              avatarSrc={post.avatarSrc}
              time={post.time}
              content={post.content}
              image={post.image}
              likes={post.likes}
              likedByMe={post.likedByMe}
              comments={post.comments}
              type={post.type}
              pinned={post.pinned}
              updatePostComments={updatePostComments}
            />
          ))}
        </Box>
      </Box>

     <AddPostModal
  userId={userId}          // ✅ pass userId
  circleId={circleId}
  onPostCreated={newPost => setPosts(prev => [newPost, ...prev])}
/>

      <BottomNav />
    </>
  );
};

export default FeedPage;
