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
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}/profile`);
        const fetchedUser = res.data.user || {};
        setUser(fetchedUser);

        const formattedPosts = (res.data.posts || []).map(post => ({
          id: post._id,
          username: fetchedUser.name || "Unknown",
          avatarSrc: fetchedUser.profile_photo
            ? fetchedUser.profile_photo.startsWith('http')
              ? fetchedUser.profile_photo
              : `http://localhost:5000${fetchedUser.profile_photo}`
            : "/default-avatar.png",
          time: post.createdAt
            ? new Date(post.createdAt).toLocaleString()
            : post._id
            ? new Date(parseInt(post._id.substring(0, 8), 16) * 1000).toLocaleString()
            : "Unknown",
          content: post.content,
          image: post.media_url
            ? post.media_url.startsWith('http')
              ? post.media_url
              : `http://localhost:5000${post.media_url}`
            : null,
          likes: Array.isArray(post.likes) ? post.likes : [],
          likedByMe: Array.isArray(post.likes)
            ? post.likes.includes(userId)
            : false,
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

  if (!user) return <div>Loading...</div>;

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
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: { xs: 480, lg: '75%' },
            mx: 'auto',
            py: 2,
          }}
        >
          {/* Back Button */}
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>

          {posts.length === 0 && (
            <Box sx={{ textAlign: 'center', color: '#777', mt: 2 }}>
              No posts yet
            </Box>
          )}

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
        circleId={userId}
        onPostCreated={newPost => setPosts(prev => [newPost, ...prev])}
      />

      <BottomNav />
    </>
  );
};

export default UserFeedPage;
