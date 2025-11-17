'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Paper,
} from '@mui/material';
import { AccountCircle, ArrowForward, Add } from '@mui/icons-material';
import Link from 'next/link';

interface TreeData {
  id: string;
  slug: string;
  rootPersonName: string;
  rootPersonBirthDate?: string;
  rootPersonDeathDate?: string;
  rootPersonStory?: string;
  branches?: any[];
  createdAt: string;
}

export default function TreesPage() {
  const router = useRouter();
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all trees from localStorage
    const treesData = localStorage.getItem('trees');
    if (treesData) {
      const parsedTrees = JSON.parse(treesData);
      setTrees(parsedTrees);
    }
    setLoading(false);
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const getBranchCount = (tree: TreeData) => {
    return tree.branches?.length || 0;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" color="primary" gutterBottom>
          Explore Memorial Trees
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Discover how lives continue to bless others for generations
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          href="/create-tree"
          size="large"
        >
          Create Your Tree
        </Button>
      </Box>

      {/* Trees Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading trees...</Typography>
        </Box>
      ) : trees.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: 'background.default',
            borderRadius: 4,
          }}
        >
          <AccountCircle sx={{ fontSize: 80, color: 'primary.light', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No memorial trees yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Be the first to create a memorial tree and celebrate a life that continues to bless others
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            href="/create-tree"
            size="large"
          >
            Create the First Tree
          </Button>
        </Paper>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 4 }}>
            Showing {trees.length} memorial {trees.length === 1 ? 'tree' : 'trees'}
          </Alert>

          <Grid container spacing={3}>
            {trees.map((tree) => (
              <Grid item xs={12} sm={6} md={4} key={tree.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Card Header with Gold Gradient */}
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #B8962D 100%)',
                      p: 3,
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    <AccountCircle sx={{ fontSize: 60, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h5" component="h2" fontWeight={600}>
                      {tree.rootPersonName}
                    </Typography>
                    {(tree.rootPersonBirthDate || tree.rootPersonDeathDate) && (
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        {formatDate(tree.rootPersonBirthDate)} - {formatDate(tree.rootPersonDeathDate)}
                      </Typography>
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    {/* Story Preview */}
                    {tree.rootPersonStory && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {tree.rootPersonStory}
                      </Typography>
                    )}

                    {/* Branch Count */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${getBranchCount(tree)} ${getBranchCount(tree) === 1 ? 'branch' : 'branches'}`}
                        color="secondary"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Public"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => router.push(`/trees/${tree.id}`)}
                    >
                      View Tree
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Info Box */}
      <Box sx={{ mt: 6, p: 3, bgcolor: 'secondary.light', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Coming soon:</strong> Search and filter trees, follow updates, connect with community members,
          and see impact statistics across all memorial trees.
        </Typography>
      </Box>
    </Container>
  );
}
