import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

const API_URL = '';

const BlogList = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/blogs`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch blogs');
        return res.json();
      })
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading blogs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          mb: 2,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Legal Insights & Updates
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ mb: 6, textAlign: 'center' }}
      >
        Stay informed with our latest articles on Lawyers and justice
      </Typography>

      <Grid container spacing={4}>
        {blogs.map((post) => (
          <Grid item xs={12} sm={6} md={6} key={post._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={post.image || 'https://via.placeholder.com/800x600?text=Legal+Insights'}
                  alt={post.title}
                  sx={{
                    objectFit: 'cover',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x600?text=Legal+Insights';
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(post.categories || []).map((category: string) => (
                      <Chip
                        key={category}
                        label={category}
                        size="small"
                        color="primary"
                        sx={{
                          background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
                        }}
                      />
                    ))}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      minHeight: 64,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.content?.slice(0, 120) || post.excerpt || ''}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 'auto',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={post.author?.avatar || 'https://via.placeholder.com/100x100?text=Author'}
                        alt={post.author?.name || 'Author'}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: 'primary.main',
                        }}
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100?text=Author';
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{post.author?.name || 'Unknown'}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {post.readTime || ''}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
            px: 4,
          }}
        >
          Load More Articles
        </Button>
      </Box>
    </Container>
  );
};

export default BlogList;
