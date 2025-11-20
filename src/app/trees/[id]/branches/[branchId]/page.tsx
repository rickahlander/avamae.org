'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Skeleton,
} from '@mui/material';
import { ArrowBack, Edit, CalendarToday, Link as LinkIcon } from '@mui/icons-material';
import { getBranchTypeConfig } from '@/constants/branchTypes';

interface Branch {
  id: string;
  title: string;
  description?: string;
  url?: string;
  dateOccurred?: string;
  branchType: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  };
  media?: Array<{
    id: string;
    url: string;
    caption?: string | null;
  }>;
  createdBy: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
}

interface Tree {
  id: string;
  rootPersonName: string;
}

export default function BranchViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const treeId = params.id as string;
        const branchId = params.branchId as string;

        // Fetch tree data
        const treeResponse = await fetch(`/api/trees/${treeId}`);
        if (!treeResponse.ok) throw new Error('Failed to load tree');
        const treeData = await treeResponse.json();
        setTree(treeData);

        // Fetch branch data
        const branchResponse = await fetch(`/api/branches/${branchId}`);
        if (!branchResponse.ok) throw new Error('Failed to load branch');
        const branchData = await branchResponse.json();
        setBranch(branchData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load branch details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.branchId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (error || !branch || !tree) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">{error || 'Branch not found'}</Typography>
          <Button onClick={() => router.back()} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const branchTypeConfig = getBranchTypeConfig(branch.branchType.name);
  const iconString = branch.branchType.icon; // String emoji from DB
  const IconComponent = branchTypeConfig?.icon; // React component from config
  const color = branch.branchType.color || '#8FBC8F';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.push(`/trees/${params.id}`)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {tree.rootPersonName}'s Impact Tree
          </Typography>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {branch.title}
          </Typography>
        </Box>
        {isSignedIn && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => router.push(`/trees/${params.id}/edit-branch/${branch.id}`)}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Branch Type */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={branchTypeConfig?.label || 'Impact'}
                icon={
                  iconString ? (
                    <span style={{ fontSize: '1.2rem' }}>{iconString}</span>
                  ) : IconComponent ? (
                    <IconComponent sx={{ fontSize: '1.2rem' }} />
                  ) : undefined
                }
                sx={{
                  bgcolor: color + '20',
                  color: color,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 1,
                }}
              />
            </Box>

            {/* Description */}
            {branch.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Story
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                    color: 'text.secondary',
                  }}
                >
                  {branch.description}
                </Typography>
              </Box>
            )}

            {/* URL */}
            {branch.url && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Link
                </Typography>
                <Button
                  href={branch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkIcon />}
                  variant="outlined"
                  sx={{ textTransform: 'none' }}
                >
                  Visit Website
                </Button>
              </Box>
            )}

            {/* Photos */}
            {branch.media && branch.media.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Photos
                </Typography>
                <ImageList cols={2} gap={12}>
                  {branch.media.map((photo) => (
                    <ImageListItem key={photo.id}>
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Branch photo'}
                        loading="lazy"
                        style={{
                          borderRadius: '8px',
                          objectFit: 'cover',
                          width: '100%',
                          height: '250px',
                        }}
                      />
                      {photo.caption && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          {photo.caption}
                        </Typography>
                      )}
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Details
            </Typography>

            {/* Date */}
            {branch.dateOccurred && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarToday sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Date
                  </Typography>
                  <Typography variant="body2">
                    {new Date(branch.dateOccurred).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Created By */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Added by
              </Typography>
              <Typography variant="body2">
                {branch.createdBy.name || 'Unknown'}
              </Typography>
            </Box>

            {/* Created At */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Added on
              </Typography>
              <Typography variant="body2">
                {new Date(branch.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push(`/trees/${params.id}`)}
            sx={{ mb: 2 }}
          >
            Back to Tree
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

