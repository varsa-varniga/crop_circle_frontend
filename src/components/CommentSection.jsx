import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton, Avatar, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Comment = ({ comment, setReplyToCommentId, depth = 0 }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [visibleReplyCount, setVisibleReplyCount] = useState(2);

  const replies = comment.replies || [];
  const hasMoreReplies = replies.length > visibleReplyCount;

  return (
    <Box sx={{ mb: 1, ml: depth * 3 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', p: 1, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Avatar src={comment.user_id?.profile_photo || '/default-avatar.png'}
                sx={{ width: depth === 0 ? 30 : 25, height: depth === 0 ? 30 : 25 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: depth === 0 ? '0.9rem' : '0.85rem' }}>
            {comment.user_id?.name || 'Unknown'}
          </Typography>
          <Typography sx={{ fontSize: depth === 0 ? '0.85rem' : '0.8rem', color: '#555' }}>
            {comment.text}
          </Typography>

          {/* Reply button */}
          <Button
            onClick={() => setReplyToCommentId(comment._id.toString())}
            sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#555', p: 0, mt: 0.5 }}
          >
            Reply
          </Button>

          {/* Replies */}
          {replies.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {showReplies &&
                replies.slice(0, visibleReplyCount).map((reply) => (
                  <Comment key={reply._id} comment={reply} setReplyToCommentId={setReplyToCommentId} depth={depth + 1} />
                ))}

              {!showReplies && (
                <Button onClick={() => setShowReplies(true)}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#555', p: 0.5 }}>
                  View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}

              {showReplies && hasMoreReplies && (
                <Button onClick={() => setVisibleReplyCount(prev => prev + 2)}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#555', p: 0.5 }}>
                  View more replies
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const CommentSection = ({ comments = [], commentText, setCommentText, handleCommentSubmit, setReplyToCommentId, replyToCommentId }) => {
  const [showAllComments, setShowAllComments] = useState(false);

  const visibleComments = showAllComments ? comments : comments.slice(-3);

  return (
    <Box>
      {comments.length > 3 && !showAllComments && (
        <Button onClick={() => setShowAllComments(true)}
                sx={{ textTransform: 'none', mb: 1, fontSize: '0.85rem', color: '#555' }}>
          View {comments.length - 3} more comment{comments.length - 3 > 1 ? 's' : ''}
        </Button>
      )}

      {visibleComments.map((comment) => (
        <Comment key={comment._id} comment={comment} setReplyToCommentId={setReplyToCommentId} />
      ))}

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={replyToCommentId ? 'Replying...' : 'Add a comment...'}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: '#fafafa' } }}
        />
        <IconButton
          color="primary"
          onClick={handleCommentSubmit}
          sx={{ backgroundColor: '#16a085', '&:hover': { backgroundColor: '#138d75' }, color: '#fff' }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CommentSection;
