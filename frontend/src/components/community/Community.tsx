import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  anonymous: boolean;
}

interface Comment {
  id: string;
  content: string;
  timestamp: Date;
  anonymous: boolean;
}

const CATEGORIES = [
  'Legal Advice',
  'Personal Experience',
  'Court Proceedings',
  'Rights & Regulations',
  'Success Stories',
  'General Discussion'
];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    anonymous: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/community`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleNewPost = async () => {
    const postData = {
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      anonymous: newPost.anonymous,
    };
    try {
      const res = await fetch(`${API_URL}/api/community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!res.ok) throw new Error('Failed to create post');
      const created = await res.json();
      setPosts((prev) => [created, ...prev]);
      setOpenNewPost(false);
      setNewPost({ title: '', content: '', category: '', anonymous: true });
    } catch (err) {
      alert('Error creating post');
      console.error(err);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Legal Community Forum
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Share experiences, seek advice, and connect with others - anonymously if you prefer
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search discussions..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewPost(true)}
          sx={{
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
            whiteSpace: 'nowrap',
          }}
        >
          New Post
        </Button>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            color={selectedCategory === category ? 'primary' : 'default'}
            sx={{ '&.MuiChip-root': { cursor: 'pointer' } }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredPosts.map((post) => (
          <Card key={post.id} sx={{ bgcolor: '#f8fafc' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Avatar sx={{ bgcolor: post.anonymous ? '#64748b' : '#2563eb' }}>
                  {post.anonymous ? 'A' : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {post.anonymous ? 'Anonymous User' : 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.timestamp.toLocaleString()}
                  </Typography>
                </Box>
                <Chip
                  label={post.category}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                {post.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {post.content}
              </Typography>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  size="small"
                  startIcon={<ThumbUpIcon />}
                  onClick={() => {}}
                >
                  {post.likes}
                </Button>
                <Button
                  size="small"
                  startIcon={<CommentIcon />}
                  onClick={() => {}}
                >
                  {post.comments.length}
                </Button>
              </Box>
              <IconButton size="small" onClick={() => {}}>
                <ShareIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Dialog
        open={openNewPost}
        onClose={() => setOpenNewPost(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            />
            <TextField
              select
              label="Category"
              fullWidth
              value={newPost.category}
              onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </TextField>
            <Button
              variant="outlined"
              onClick={() => setNewPost(prev => ({ ...prev, anonymous: !prev.anonymous }))}
              sx={{ alignSelf: 'flex-start' }}
            >
              {newPost.anonymous ? 'Post Anonymously' : 'Post with Username'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewPost(false)}>Cancel</Button>
          <Button
            onClick={handleNewPost}
            variant="contained"
            disabled={!newPost.title || !newPost.content || !newPost.category}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Community;
