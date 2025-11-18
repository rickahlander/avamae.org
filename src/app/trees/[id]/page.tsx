'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function TreeViewPage() {
  const params = useParams();
  const router = useRouter();
  const [tree, setTree] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load tree from localStorage
    const treeId = params.id as string;
    const treeData = localStorage.getItem(`tree-${treeId}`);

    if (treeData) {
      setTree(JSON.parse(treeData));
    } else {
      setError('Tree not found');
    }
    setLoading(false);
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

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push(`/trees/${tree.id}/add-branch`)}
          color="secondary"
        >
          Add Branch
        </Button>
      </Box>

      {/* Tree Title */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" color="primary" gutterBottom>
          {tree.rootPersonName}'s Memorial Tree
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
        <TreeVisualization tree={tree} />
      </Paper>

      {/* Info Box */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Coming soon:</strong> Share this tree, invite others to contribute,
          add stories and memories, and watch the legacy grow.
        </Typography>
      </Box>
    </Container>
  );
}
