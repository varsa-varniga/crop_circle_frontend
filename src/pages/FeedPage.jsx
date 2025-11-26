import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Fab,
  IconButton,
  Badge,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PostCard from "../components/PostCard.jsx";
import AddPostModal from "../components/AddPostModal.jsx";
import { useNavigate } from "react-router-dom";



const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [circles, setCircles] = useState([]);
  const [activeCircle, setActiveCircle] = useState(null);
  const [role, setRole] = useState("");

  const storedUser = localStorage.getItem("user");
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = loggedInUser?._id;

  const navigate = useNavigate();

  // --- Fetch user's circles ---
  const fetchUserCircles = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/crop-circle/get-my-circles?user_id=${userId}`
      );
      const userCircles = res.data.circles || [];
      setCircles(userCircles);

      if (userCircles.length > 0) {
        setActiveCircle(userCircles[0]);
        const activeRole = userCircles[0].mentors.includes(userId)
          ? "Mentor"
          : "Learner";
        setRole(activeRole);
      }
    } catch (err) {
      console.error("Error fetching user circles:", err);
    }
  };

  // --- Fetch posts for active circle ---
  const fetchPosts = async (circleId) => {
    if (!circleId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts/circle/${circleId}`
      );
      const formattedPosts = res.data.posts.map((p) => ({
        ...p,
        media_url: p.media_url ? `http://localhost:5000${p.media_url}` : null,
      }));
      setPosts(formattedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  // --- Fetch notifications ---
  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/notifications/${userId}`
      );
      const sorted = res.data.notifications.sort((a, b) => {
        if (a.type === "MENTOR_QUESTION" && a.isActive && !(b.type === "MENTOR_QUESTION" && b.isActive)) return -1;
        if (!(a.type === "MENTOR_QUESTION" && a.isActive) && b.type === "MENTOR_QUESTION" && b.isActive) return 1;
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setNotifications(sorted);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Poll notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fetch circles on load
  useEffect(() => {
    fetchUserCircles();
  }, [userId]);

  // Fetch posts whenever active circle changes
  useEffect(() => {
    if (activeCircle) fetchPosts(activeCircle._id);
  }, [activeCircle]);

  // --- Update post comments and handle mentor replies ---
const updatePostComments = async (postId, newComments) => {
  try {
    const mentorAnswered = newComments.some(
      (c) => c.user_id && activeCircle.mentors.includes(c.user_id._id)
    );

    if (mentorAnswered) {
      // Call backend to permanently unpin
      await axios.put(`http://localhost:5000/api/posts/unpin/${postId}`);
    }

    // Update local state
    setPosts((prev) => {
      const updatedPosts = prev.map((p) => {
        if (p._id === postId) {
          return { ...p, comments: newComments, pinned: p.pinned && !mentorAnswered };
        }
        return p;
      });

      return updatedPosts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });
  } catch (err) {
    console.error("[UPDATE POST COMMENTS] Error:", err);
  }
};


  const deletePostFromState = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", px: 2, pt: 0 }}>
      {/* Top App Bar */}
      <AppBar position="sticky" sx={{ bgcolor: "primary.main" }} elevation={3}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Circle selector */}
          {circles.length > 0 ? (
            <select
              value={activeCircle?._id || ""}
              onChange={(e) => {
                const selected = circles.find((c) => c._id === e.target.value);
                setActiveCircle(selected);
                setRole(selected.mentors.includes(userId) ? "Mentor" : "Learner");
              }}
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                background: "transparent",
                border: "none",
                color: "white",
              }}
            >
              {circles.map((circle) => (
                <option key={circle._id} value={circle._id}>
                  {circle.name || `${circle.crop_name} - ${circle.district}`}
                </option>
              ))}
            </select>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              CropCircle Feed
            </Typography>
          )}

          <IconButton
            onClick={() => navigate("/notifications")}
            color="inherit"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Posts */}
      {activeCircle ? (
        posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              id={post._id}
              username={post.user_id?.name}
              avatarSrc={
                post.user_id?.profile_photo
                  ? `http://localhost:5000${post.user_id.profile_photo}`
                  : ""
              }
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
          ))
        ) : (
          <Typography sx={{ mt: 2 }}>No posts in this circle yet.</Typography>
        )
      ) : (
        <Typography sx={{ mt: 2 }}>
          You are not part of any circle. Join a circle to see posts.
        </Typography>
      )}

      {/* Floating "+" button */}
      {activeCircle && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 80, right: 20, zIndex: 999 }}
          onClick={() => setOpenModal(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* AddPostModal */}
      {openModal && activeCircle && (
        <AddPostModal
          userId={userId}
          circleId={activeCircle._id}
          onPostCreated={handlePostCreated}
        />
      )}
    </Box>
  );
};

export default FeedPage;
