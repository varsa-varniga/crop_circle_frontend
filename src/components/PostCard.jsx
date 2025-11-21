import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Avatar,
  Typography,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentSection from './CommentSection';
import axios from 'axios';

const PostCard = ({
  id,
  username,
  time,
  avatarSrc,
  content,
  image,
  likes = [],
  comments = [],
  pinned,
  user_id,
  updatePostComments,
  deletePostFromState,
}) => {
  // Fetch user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id || null;

  const [likeCount, setLikeCount] = useState(likes.length);
  const [liked, setLiked] = useState(userId ? likes.includes(userId) : false);
  const [commentList, setCommentList] = useState(comments);
  const [commentText, setCommentText] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // Image preview handler
  useEffect(() => {
    if (!image) return;

    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof image === "string") {
      setImagePreview(image);
    }
  }, [image]);

  // Optimistic Like handler
  const handleLike = async () => {
    if (!userId) return alert("You must be logged in to like posts.");
    if (likeLoading) return;

    setLikeLoading(true);

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const res = await axios.patch(`http://localhost:5000/api/posts/${id}/like`, { user_id: userId });
      setLiked(res.data.post.likes.includes(userId));
      setLikeCount(res.data.post.likes.length);
    } catch (err) {
      console.error("Error liking post:", err);
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    } finally {
      setLikeLoading(false);
    }
  };

  // Optimistic Comment / Reply handler
  const handleCommentSubmit = async () => {
    if (!userId) return alert("You must be logged in to comment.");
    if (!commentText.trim() || commentLoading) return;

    setCommentLoading(true);

    const tempComment = {
      _id: Math.random().toString(36).substr(2, 9), // temporary ID
      user_id: userId,
      username: user.name,
      text: commentText,
      replies: [],
    };

    setCommentList(prev => [...prev, tempComment]);
    setCommentText('');

    try {
      const url = replyToCommentId
        ? `http://localhost:5000/api/posts/${id}/comment/${replyToCommentId}/reply`
        : `http://localhost:5000/api/posts/${id}/comment`;

      const res = await axios.post(url, { user_id: userId, text: tempComment.text });

      setCommentList(res.data.post.comments);
      updatePostComments(id, res.data.post.comments);
      setReplyToCommentId(null);
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Failed to submit comment. Rolling back.");
      setCommentList(prev => prev.filter(c => c._id !== tempComment._id));
    } finally {
      setCommentLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!userId) return alert("You must be logged in to delete posts.");

    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`, { data: { user_id: userId } });
      deletePostFromState(id);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, width: '100%', maxWidth: '1000px', margin: '1rem auto' }}>
      <CardHeader
        avatar={<Avatar src={avatarSrc} sx={{ width: 55, height: 55 }} />}
        action={userId === user_id && (
          <IconButton onClick={handleDeletePost}><DeleteIcon /></IconButton>
        )}
        title={<Typography sx={{ fontWeight: 600 }}>{username}</Typography>}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>{time}</Typography>
            {pinned && <Chip label="Pinned" size="small" color="primary" />}
          </Box>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        {content && <Typography sx={{ fontSize: '0.95rem' }}>{content}</Typography>}
        {imagePreview && (
          <CardMedia component="img" image={imagePreview} alt="Post" />
        )}
      </CardContent>

      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={handleLike} color={liked ? 'error' : 'default'}>
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography>{likeCount}</Typography>

        <IconButton onClick={() => setShowComments(prev => !prev)} sx={{ ml: 2 }}>
          <ChatBubbleOutlineIcon />
        </IconButton>
        <Typography>{commentList.length}</Typography>
      </CardContent>

      {showComments && (
        <CardContent sx={{ maxHeight: 400, overflowY: 'auto', pt: 0 }}>
          <CommentSection
            comments={commentList}
            commentText={commentText}
            setCommentText={setCommentText}
            handleCommentSubmit={handleCommentSubmit}
            setReplyToCommentId={setReplyToCommentId}
            replyToCommentId={replyToCommentId}
            loading={commentLoading}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default PostCard;
