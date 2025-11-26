import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  List,
  Paper,
  Avatar,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const NotificationsPage = ({ selectedCircleProp }) => {
  const [notifications, setNotifications] = useState([]);
  const [userCircles, setUserCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(selectedCircleProp || null);

  const storedUser = localStorage.getItem("user");
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = loggedInUser?._id;

  // Fetch user's joined circles
  const fetchUserCircles = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/crop-circle/get-my-circles?user_id=${userId}`
      );
      setUserCircles(res.data.circles || []);
      if (!selectedCircleProp && res.data.circles.length > 0) {
        setSelectedCircle(res.data.circles[0]._id);
      }
    } catch (err) {
      console.error("Error fetching user circles:", err);
    }
  };

  // Fetch notifications & sort active first
  const fetchNotifications = async (circleId) => {
    if (!userId || !circleId) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/notifications/${userId}?circle_id=${circleId}`
      );

      const mapped = (res.data.notifications || []).map((n) => ({
        ...n,
        displayMessage:
          n.type === "LIKE" || n.type === "COMMENT"
            ? n.post_id?.title
              ? `${n.sender?.name || "Someone"} ${
                  n.type === "LIKE" ? "liked" : "commented on"
                } your post: "${n.post_id.title}"`
              : n.message
            : n.message,
      }));

      // Sort active first
      mapped.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return 0;
      });

      setNotifications(mapped);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Deactivate mentor question (optimistic update)
  const deactivateMentorQuestion = async (postId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/deactivate/${postId}`);

      // Update state and sort active first
      setNotifications((prev) =>
        prev
          .map((notif) =>
            notif.post_id?._id === postId
              ? { ...notif, isActive: false }
              : notif
          )
          .sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return 0;
          })
      );
    } catch (err) {
      console.error("Error deactivating mentor question:", err);
    }
  };

  // Fetch circles once
  useEffect(() => {
    fetchUserCircles();
  }, [userId]);

  // Fetch notifications periodically
  useEffect(() => {
    if (!selectedCircle) return;
    fetchNotifications(selectedCircle);
    const interval = setInterval(() => fetchNotifications(selectedCircle), 5000);
    return () => clearInterval(interval);
  }, [userId, selectedCircle]);

  // Update selected circle if parent changes it
  useEffect(() => {
    if (selectedCircleProp) setSelectedCircle(selectedCircleProp);
  }, [selectedCircleProp]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Notifications
      </Typography>

      {/* Circle selector */}
      {userCircles.length > 1 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Circle</InputLabel>
          <Select
            value={selectedCircle || ""}
            label="Select Circle"
            onChange={(e) => setSelectedCircle(e.target.value)}
          >
            {userCircles.map((circle) => (
              <MenuItem key={circle._id} value={circle._id}>
                {circle.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {notifications.length === 0 ? (
        <Typography>No notifications yet.</Typography>
      ) : (
        <List>
          {notifications.map((notif) => (
            <Paper
              key={notif._id}
              elevation={notif.isRead ? 1 : 4}
              sx={{
                mb: 1,
                p: 1,
                bgcolor: notif.isRead ? "background.paper" : "rgba(0, 150, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                borderLeft: notif.isActive ? "4px solid #00f" : "none",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={notif.sender?.profile_photo ? `http://localhost:5000${notif.sender.profile_photo}` : ""}
                  alt={notif.sender?.name || "User"}
                />
              </ListItemAvatar>
              <ListItemText
                primary={notif.displayMessage}
                secondary={new Date(notif.createdAt).toLocaleString("en-IN")}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                {!notif.isRead && (
                  <Button size="small" variant="outlined" onClick={() => markAsRead(notif._id)}>
                    Mark read
                  </Button>
                )}
                {notif.type === "MENTOR_QUESTION" && notif.isActive && (
                  <IconButton color="success" onClick={() => deactivateMentorQuestion(notif.post_id?._id)}>
                    <CheckCircleIcon />
                  </IconButton>
                )}
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default NotificationsPage;
