import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import AddPostModal from '../components/AddPostModal';
import { Box, Button } from '@mui/material';

const UserFeedPage = () => {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}/profile`);
        const fetchedUser = res.data.user || {};
        setUser(fetchedUser);

        const formattedPosts = (res.data.posts || []).map(post => ({
          id: post._id,
          username: fetchedUser.name || "Unknown",
          avatarSrc: fetchedUser.profile_photo || "/default-avatar.png",
          time: post.createdAt
            ? new Date(post.createdAt).toLocaleString()
            : post._id
            ? new Date(parseInt(post._id.substring(0, 8), 16) * 1000).toLocaleString()
            : "Unknown",
          content: post.content,
          image: post.media_url,
          likes: post.likes?.length || 0,
          likedByMe: post.likes?.includes("6914b2543b0c318f5db0ae38") || false,
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
  }, [userId]);

  const updatePostComments = (postId, newComments) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, comments: newComments } : p))
    );
  };

  if (!user) return null;

  return (
    <>
      <TopBar />
      <Box sx={{ display: "flex", justifyContent: "center", backgroundColor: "#fafafa", minHeight: "100vh", pb: "80px" }}>
        <Box sx={{ width: "100%", maxWidth: { xs: 480, lg: "75%" }, mx: "auto", py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          
          {/* Back to Profile Button */}
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Back to Profile
          </Button>

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
      <AddPostModal circleId={userId} onPostCreated={newPost => setPosts(prev => [newPost, ...prev])} />
      <BottomNav />
    </>
  );
};

export default UserFeedPage;
