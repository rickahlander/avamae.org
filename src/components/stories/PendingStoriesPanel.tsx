'use client';

import React, { useState, useOptimistic } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  ImageList,
  ImageListItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Person, CalendarToday, Check, Close } from '@mui/icons-material';

interface Story {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  approved: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  media?: Array<{
    id: string;
    url: string;
    caption?: string | null;
  }>;
}

interface PendingStoriesPanelProps {
  stories: Story[];
  onApprove: (storyId: string) => Promise<void>;
  onReject: (storyId: string, reason?: string) => Promise<void>;
}

export default function PendingStoriesPanel({ stories, onApprove, onReject }: PendingStoriesPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // React 19: Optimistic UI for instant feedback
  const [optimisticStories, removeOptimisticStory] = useOptimistic(
    stories,
    (currentStories, removedStoryId: string) =>
      currentStories.filter((story) => story.id !== removedStoryId)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleApprove = async (storyId: string) => {
    setError('');
    setLoading(storyId);
    
    // Optimistically remove from UI immediately
    removeOptimisticStory(storyId);
    
    try {
      await onApprove(storyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve story');
    } finally {
      setLoading(null);
    }
  };

  const handleRejectClick = (storyId: string) => {
    setSelectedStoryId(storyId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedStoryId) return;

    setError('');
    setLoading(selectedStoryId);
    
    // Optimistically remove from UI immediately
    removeOptimisticStory(selectedStoryId);
    
    try {
      await onReject(selectedStoryId, rejectionReason.trim() || undefined);
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedStoryId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject story');
    } finally {
      setLoading(null);
    }
  };

  const pendingStories = optimisticStories.filter((story) => !story.approved);

  if (pendingStories.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 1, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No pending stories to review
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Pending Stories
        </Typography>
        <Chip label={pendingStories.length} size="small" color="warning" />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {pendingStories.map((story) => (
          <Card key={story.id} sx={{ borderRadius: 2, boxShadow: 2, border: '2px solid #ff9800' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Author info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={story.author.avatarUrl || undefined}
                  alt={story.author.name}
                  sx={{ width: 48, height: 48 }}
                >
                  <Person />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {story.author.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <CalendarToday sx={{ fontSize: 14 }} />
                    <Typography variant="caption">
                      {formatDate(story.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Chip label="Pending Review" size="small" color="warning" />
              </Box>

              {/* Story title */}
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                {story.title}
              </Typography>

              {/* Story content */}
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.7,
                  color: 'text.secondary',
                }}
              >
                {story.content}
              </Typography>

              {/* Photos */}
              {story.media && story.media.length > 0 && (
                <ImageList
                  cols={story.media.length === 1 ? 1 : story.media.length === 2 ? 2 : 3}
                  gap={8}
                  sx={{ mt: 2, mb: 2 }}
                >
                  {story.media.map((media) => (
                    <ImageListItem key={media.id}>
                      <img
                        src={media.url}
                        alt={media.caption || 'Story photo'}
                        loading="lazy"
                        style={{
                          height: story.media!.length === 1 ? '300px' : '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={loading === story.id ? <CircularProgress size={16} color="inherit" /> : <Check />}
                  onClick={() => handleApprove(story.id)}
                  disabled={loading !== null}
                  fullWidth
                >
                  Approve Story
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={loading === story.id ? <CircularProgress size={16} color="inherit" /> : <Close />}
                  onClick={() => handleRejectClick(story.id)}
                  disabled={loading !== null}
                  fullWidth
                >
                  Reject Story
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Rejection dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Story</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to reject this story? The author will be notified.
          </Typography>
          <TextField
            label="Reason for rejection (optional)"
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Let the author know why the story wasn't approved..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            variant="contained"
            disabled={loading !== null}
          >
            Reject Story
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

