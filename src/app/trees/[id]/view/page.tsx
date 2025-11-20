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
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Skeleton,
  Avatar,
  Divider,
} from '@mui/material';
import { ArrowBack, Edit, CalendarToday, Link as LinkIcon, AccountCircle, CreateOutlined } from '@mui/icons-material';
import { detectPlatformFromUrl, getDisplayLabelFromUrl } from '@/utils/socialIcons';
import StorySubmissionForm from '@/components/stories/StorySubmissionForm';
import StoryList from '@/components/stories/StoryList';
import PendingStoriesPanel from '@/components/stories/PendingStoriesPanel';

interface Tree {
  id: string;
  rootPersonName: string;
  rootPersonBirthDate?: string;
  rootPersonDeathDate?: string;
  rootPersonStory?: string;
  url?: string;
  rootPersonProfilePhoto?: string;
  rootPersonPhotos?: string[];
  links?: Array<{
    id: string;
    label?: string | null;
    url: string;
  }>;
  owner: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  branches?: any[];
}

export default function TreeViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stories, setStories] = useState<any[]>([]);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [canViewPending, setCanViewPending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const treeId = params.id as string;

        // Fetch tree data
        const response = await fetch(`/api/trees/${treeId}`);
        if (!response.ok) throw new Error('Failed to load tree');
        const treeData = await response.json();
        setTree(treeData);

        // Fetch stories
        const storiesResponse = await fetch(`/api/stories?treeId=${treeId}&includePending=true`);
        if (storiesResponse.ok) {
          const storiesData = await storiesResponse.json();
          setStories(storiesData);
          
          // Check if user can view pending stories (if there are any pending)
          const hasPending = storiesData.some((s: any) => !s.approved);
          if (hasPending && isSignedIn) {
            setCanViewPending(true);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load tree details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, isSignedIn]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (error || !tree) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">{error || 'Tree not found'}</Typography>
          <Button onClick={() => router.back()} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const allPhotos = [
    ...(tree.rootPersonProfilePhoto ? [tree.rootPersonProfilePhoto] : []),
    ...(tree.rootPersonPhotos || []),
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.push(`/trees/${params.id}`)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Impact Tree
          </Typography>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {tree.rootPersonName}
          </Typography>
        </Box>
        {isSignedIn && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => router.push(`/trees/${params.id}/edit-tree`)}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Profile Photo */}
            {tree.rootPersonProfilePhoto && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  src={tree.rootPersonProfilePhoto}
                  alt={tree.rootPersonName}
                  sx={{
                    width: 200,
                    height: 200,
                    border: '4px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <AccountCircle sx={{ fontSize: 120 }} />
                </Avatar>
              </Box>
            )}

            {/* Life Dates */}
            {(tree.rootPersonBirthDate || tree.rootPersonDeathDate) && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  {tree.rootPersonBirthDate &&
                    new Date(tree.rootPersonBirthDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  {tree.rootPersonBirthDate && tree.rootPersonDeathDate && ' - '}
                  {tree.rootPersonDeathDate &&
                    new Date(tree.rootPersonDeathDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                </Typography>
              </Box>
            )}

            {/* Story/Biography */}
            {tree.rootPersonStory && (
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
                  {tree.rootPersonStory}
                </Typography>
              </Box>
            )}

            {/* URL */}
            {tree.url && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Memorial Link
                </Typography>
                <Button
                  href={tree.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkIcon />}
                  variant="outlined"
                  sx={{ textTransform: 'none' }}
                >
                  View Obituary / Memorial
                </Button>
              </Box>
            )}

            {/* Social Media & Web Links */}
            {tree.links && tree.links.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Links
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tree.links.map((link) => {
                    const platform = detectPlatformFromUrl(link.url);
                    const PlatformIcon = platform.icon;
                    const displayLabel = link.label || getDisplayLabelFromUrl(link.url);

                    return (
                      <Button
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<PlatformIcon sx={{ color: platform.color }} />}
                        variant="outlined"
                        sx={{
                          textTransform: 'none',
                          borderColor: platform.color + '40',
                          '&:hover': {
                            borderColor: platform.color,
                            bgcolor: platform.color + '10',
                          },
                        }}
                      >
                        {displayLabel}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Share a Story Button */}
            {isSignedIn && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CreateOutlined />}
                  onClick={() => setShowStoryForm(true)}
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Share a Story
                </Button>
              </Box>
            )}

            {/* Additional Photos */}
            {tree.rootPersonPhotos && tree.rootPersonPhotos.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Photos
                </Typography>
                <ImageList cols={2} gap={12}>
                  {tree.rootPersonPhotos.map((photo, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={photo}
                        alt={`${tree.rootPersonName} photo ${index + 1}`}
                        loading="lazy"
                        style={{
                          borderRadius: '8px',
                          objectFit: 'cover',
                          width: '100%',
                          height: '250px',
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Paper>

          {/* Pending Stories Panel (for moderators) */}
          {canViewPending && stories.some((s) => !s.approved) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <PendingStoriesPanel
                stories={stories}
                onApprove={async (storyId) => {
                  await fetch(`/api/stories/${storyId}/approve`, { method: 'POST' });
                  // Refresh stories
                  const storiesResponse = await fetch(`/api/stories?treeId=${params.id}&includePending=true`);
                  if (storiesResponse.ok) {
                    setStories(await storiesResponse.json());
                  }
                }}
                onReject={async (storyId, reason) => {
                  await fetch(`/api/stories/${storyId}/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason }),
                  });
                  // Refresh stories
                  const storiesResponse = await fetch(`/api/stories?treeId=${params.id}&includePending=true`);
                  if (storiesResponse.ok) {
                    setStories(await storiesResponse.json());
                  }
                }}
              />
            </Paper>
          )}

          {/* Stories Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Stories & Memories
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <StoryList stories={stories.filter((s) => s.approved)} />
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Impact Tree
            </Typography>

            {/* Branch Count - Info Pill */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-block',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid',
                  borderColor: 'primary.main',
                }}
              >
                {tree.branches?.length || 0} {tree.branches?.length === 1 ? 'Branch' : 'Branches'}
              </Box>
            </Box>

            {/* Created By */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Created by
              </Typography>
              <Typography variant="body2">
                {tree.owner.name || 'Unknown'}
              </Typography>
            </Box>

            {/* Created At */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Created on
              </Typography>
              <Typography variant="body2">
                {new Date(tree.createdAt).toLocaleDateString('en-US', {
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

      {/* Story Submission Form */}
      <StorySubmissionForm
        open={showStoryForm}
        onClose={() => setShowStoryForm(false)}
        treeId={params.id as string}
        treeName={tree.rootPersonName}
        onSuccess={async () => {
          // Refresh stories
          const storiesResponse = await fetch(`/api/stories?treeId=${params.id}&includePending=true`);
          if (storiesResponse.ok) {
            setStories(await storiesResponse.json());
          }
        }}
      />
    </Container>
  );
}

