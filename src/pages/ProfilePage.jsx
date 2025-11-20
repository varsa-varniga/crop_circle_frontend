import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import AddPostModal from '../components/AddPostModal';
import { Box, Typography, Button, Avatar, TextField, TextareaAutosize, Stack, useMediaQuery, Modal } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user: loggedInUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');

  const userId = loggedInUser?._id;
  const circleId = "691458e70454e9306bf21990";

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();

  // Fetch profile once userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}/profile`);
        setUser(res.data.user);
        setPosts(res.data.posts);
        setExperienceLevel(res.data.user.experience_level || 'beginner');
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleEditClick = () => {
    setProfilePhoto(user.profile_photo || '');
    setBio(user.bio || '');
    setDob(user.date_of_birth ? user.date_of_birth.slice(0, 10) : '');
    setExperienceLevel(user.experience_level || 'beginner');
    setEditMode(true);
  };

  if (!user) return <Typography>Loading profile...</Typography>;

  return (
    <>
      <TopBar />
      <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#fafafa', minHeight: '100vh', pb: '80px' }}>
        <Box sx={{ width: '100%', maxWidth: isLargeScreen ? '75%' : 480, mx: 'auto' }}>

          {/* Profile Header */}
          <Box sx={{ backgroundColor: 'white', p: isLargeScreen ? 4 : 3, borderBottom: '1px solid #e0e0e0', my: 2, borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <Stack direction="row" spacing={3} alignItems="center">
  <Avatar
  src={
    profilePhoto
      ? typeof profilePhoto === "string"
        ? `http://localhost:5000${profilePhoto}`
        : URL.createObjectURL(profilePhoto)
      : user.profile_photo
        ? `http://localhost:5000${user.profile_photo}`
        : '/default-avatar.png'
  }
  sx={{
    width: isLargeScreen ? 180 : 120,
    height: isLargeScreen ? 180 : 120,
    border: '2px solid #e0e0e0',
    borderRadius: '50%',
    objectFit: 'cover',
    objectPosition: 'center center' // ⚡ center the photo perfectly
  }}
/>


              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: isLargeScreen ? '2.5rem' : '1.7rem', fontWeight: 600, color: '#16a34a', mb: 0.5 }}>
                  {user.name}
                </Typography>
               <Typography sx={{ fontSize: isLargeScreen ? '1.2rem' : '1rem' }}>
  {experienceLevel}
</Typography>

                {user.date_of_birth && (
                  <Typography sx={{ fontSize: isLargeScreen ? '1.2rem' : '1rem' }}>
                    DOB: {new Date(user.date_of_birth).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Typography sx={{ mt: 2, fontSize: isLargeScreen ? '1.3rem' : '1rem', lineHeight: 1.5, color: '#555' }}>
              {user.bio || "No bio yet"}
            </Typography>

            <Stack direction="row" spacing={1} mt={2}>
              <Button fullWidth variant="contained" sx={{
                background: 'linear-gradient(90deg, #f59e0b, #facc15)',
                fontWeight: 600,
                fontSize: isLargeScreen ? '1.3rem' : '1rem',
                py: isLargeScreen ? 1.5 : 0.7
              }} onClick={handleEditClick}>
                Edit Profile
              </Button>
              <Button fullWidth variant="contained" sx={{
                backgroundColor: '#16a34a',
                fontWeight: 600,
                fontSize: isLargeScreen ? '1.3rem' : '1rem',
                py: isLargeScreen ? 1.5 : 0.7
              }}>
                Posts: {posts.length}
              </Button>
            </Stack>

            <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={() => {
              logout();
              navigate("/login");
            }}>
              Logout
            </Button>
          </Box>

          {/* Posts Grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: isLargeScreen ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: 1,
            mt: 2
          }}>
            {posts.length === 0 && (
              <Typography sx={{ textAlign: 'center', color: '#777', mt: 2 }}>No posts yet</Typography>
            )}
            {posts.map(post => (
              <Box key={post._id} sx={{
                width: '100%',
                pb: '100%',
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: post.media_url ? 'transparent' : '#e0ffe0',
              }} onClick={() => navigate(`/profile/${user._id}/feed`)}>
                {post.media_url ? (
                  <Box component="img" src={post.media_url} alt="Post"
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : post.content ? (
                  <Box sx={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    p: 1, overflow: 'hidden',
                  }}>
                    <Typography sx={{
                      color: '#555',
                      fontSize: '0.95rem',
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                    }}>{post.content}</Typography>
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>

        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal open={editMode} onClose={() => setEditMode(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          bgcolor: 'white', p: 4, borderRadius: 2, width: '90%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 2
        }}>
          <Typography variant="h6">Edit Profile</Typography>

          {/* Avatar Preview */}
          {profilePhoto && (
            <Avatar
              src={typeof profilePhoto === "string" ? `http://localhost:5000${profilePhoto}` : URL.createObjectURL(profilePhoto)}
              sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%', mb: 1, mx: 'auto' }}
            />
          )}

          {/* Upload */}
          <Button variant="outlined" component="label" sx={{ mb: 1 }}>
            Upload Profile Photo
            <input type="file" accept="image/*" hidden onChange={e => setProfilePhoto(e.target.files[0])} />
          </Button>

          <TextareaAutosize
            minRows={4}
            placeholder="Bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            style={{ width: '100%', borderRadius: 8, borderColor: '#ccc', padding: '0.6rem', fontSize: '1rem' }}
          />

          <TextField type="date" label="Date of Birth" value={dob} onChange={e => setDob(e.target.value)}
            fullWidth InputLabelProps={{ shrink: true }} />

          <TextField select label="Experience Level" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}
            SelectProps={{ native: true }} fullWidth>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </TextField>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="contained" sx={{ bgcolor: '#16a34a' }} onClick={async () => {
              try {
                const formData = new FormData();
                if (profilePhoto && typeof profilePhoto !== "string") formData.append("profile_photo", profilePhoto);
                formData.append("bio", bio);
                formData.append("date_of_birth", dob || "");
                formData.append("experience_level", experienceLevel);

                const res = await axios.patch(
                  `http://localhost:5000/api/users/${userId}/profile`,
                  formData,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );

               setUser(res.data.user);
setProfilePhoto(res.data.user.profile_photo);
setExperienceLevel(res.data.user.experience_level || 'beginner');
setEditMode(false);

              } catch (err) {
                console.error("Error updating profile:", err.response?.data || err.message);
              }
            }}>Save</Button>
            <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
          </Stack>
        </Box>
      </Modal>

      <AddPostModal userId={user._id} circleId={circleId} onPostCreated={newPost => setPosts(prev => [newPost, ...prev])} />

      <BottomNav />
    </>
  );
};

export default ProfilePage;
