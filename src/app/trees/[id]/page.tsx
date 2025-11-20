'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import TreeVisualization from '@/components/tree/TreeVisualization';
import ShareButton from '@/components/ShareButton';

interface TreeData {
  id: string;
  slug: string;
  rootPersonName: string;
  rootPersonBirthDate?: string;
  rootPersonDeathDate?: string;
  rootPersonStory?: string;
  rootPersonPhotoUrl?: string;
  rootPersonPhotos?: string[];
  branches?: any[];
  members?: any[];
  owner: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

export default function TreeViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [tree, setTree] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch tree from API
    const fetchTree = async () => {
      try {
        const treeId = params.id as string;
        const response = await fetch(`/api/trees/${treeId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Tree not found');
          } else if (response.status === 403) {
            throw new Error('You do not have permission to view this tree');
          } else {
            throw new Error('Failed to load tree');
          }
        }

        const data = await response.json();
        setTree(data);
      } catch (err: any) {
        console.error('Error fetching tree:', err);
        setError(err.message || 'Failed to load tree');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [params.id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !tree) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Tree not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/')}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <ShareButton
            url={`${window.location.origin}/trees/${tree.slug || tree.id}`}
            title={`${tree.rootPersonName}'s Legacy Tree`}
            text={`Explore ${tree.rootPersonName}'s legacy tree on Avamae`}
          />
          {isSignedIn && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push(`/trees/${tree.slug || tree.id}/add-branch`)}
              color="secondary"
            >
              Add Branch
            </Button>
          )}
        </Box>
      </Box>

      {/* Tree Title */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" color="primary" gutterBottom>
          {tree.rootPersonName}'s Legacy Tree
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A living legacy of impact and blessing
        </Typography>
      </Box>

      {/* Tree Visualization */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: 'background.default',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <TreeVisualization tree={tree} canEdit={isSignedIn || false} />
      </Paper>

    </Container>
  );
}
