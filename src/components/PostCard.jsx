import React, { useState } from 'react';
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

const hasImage = (url) => url && url.trim() && url !== 'null' && url !== 'undefined';

const PostCard = ({
  id,
  username,
  time,
  avatarSrc,
  content,
  image,
  likes,
  comments,
  type,
  pinned,
  user_id,
  updatePostComments,
  deletePostFromState
}) => {
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [liked, setLiked] = useState(false);
  const [commentList, setCommentList] = useState(comments || []);
  const [commentText, setCommentText] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showImage, setShowImage] = useState(hasImage(image));

  const userId = "6914a40b3d9abd7785f81ac5";

  const handleLike = async () => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/posts/${id}/like`, { user_id: userId });
      setLiked(res.data.post.likes.includes(userId));
      setLikeCount(res.data.post.likes.length);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

const handleCommentSubmit = async () => {
  if (!commentText.trim()) return;

  try {
    let res;

    console.log("Submitting comment/reply:", { postId: id, replyToCommentId, text: commentText });

    if (replyToCommentId) {
      // reply to a comment
      res = await axios.post(
        `http://localhost:5000/api/posts/${id}/comment/${replyToCommentId}/reply`,
        { user_id: userId, text: commentText }
      );
    } else {
      // new comment
      res = await axios.post(
        `http://localhost:5000/api/posts/${id}/comment`,
        { user_id: userId, text: commentText }
      );
    }

    setCommentList(res.data.post.comments);
    updatePostComments(id, res.data.post.comments);
    setReplyToCommentId(null);
    setCommentText('');
  } catch (err) {
    console.error("Error submitting comment:", err);
  }
};


  const handleDeletePost = async () => {
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
        title={<Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>{username}</Typography>}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>{time}</Typography>
            {pinned && <Chip label="Pinned" size="small" color="primary" />}
          </Box>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        {content && <Typography sx={{ fontSize: '0.95rem', color: '#333' }}>{content}</Typography>}
        {showImage && (
          <CardMedia
            component="img"
            image={image}
            alt="Post"
            onError={() => setShowImage(false)}
            sx={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 2, mt: 1 }}
          />
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
          />
        </CardContent>
      )}
    </Card>
  );
};

export default PostCard;
