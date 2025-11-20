'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close, Delete, PhotoCamera } from '@mui/icons-material';

interface StorySubmissionFormProps {
  open: boolean;
  onClose: () => void;
  treeId: string;
  treeName: string;
  onSuccess?: () => void;
}

export default function StorySubmissionForm({
  open,
  onClose,
  treeId,
  treeName,
  onSuccess,
}: StorySubmissionFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError('');
    setLoading(true);

    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setError('Photo size must be less than 10MB');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'stories');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload photo');
        }

        const data = await response.json();
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title.trim()) {
      setError('Please enter a title');
      setLoading(false);
      return;
    }

    if (!content.trim()) {
      setError('Please enter your story');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          treeId,
          title: title.trim(),
          content: content.trim(),
          photos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit story');
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error submitting story:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setPhotos([]);
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
        Share a Story about {treeName}
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Story submitted successfully! It will appear after moderator approval.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Story Title"
              required
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., A memory from our college days"
              disabled={loading || success}
            />

            <TextField
              label="Your Story"
              required
              fullWidth
              multiline
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your memory, how this person impacted your life, or a meaningful moment you shared together..."
              helperText="You can include URLs by typing them directly in your story (e.g., https://example.com)"
              disabled={loading || success}
            />

            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
                Photos (optional)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={loading || success}
              >
                Add Photos
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Max 10MB per photo
              </Typography>
            </Box>

            {photos.length > 0 && (
              <ImageList cols={3} gap={8} sx={{ mt: 1 }}>
                {photos.map((photo, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      loading="lazy"
                      style={{
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                    <ImageListItemBar
                      sx={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        borderRadius: '8px 8px 0 0',
                      }}
                      position="top"
                      actionIcon={
                        <IconButton
                          onClick={() => handleRemovePhoto(index)}
                          sx={{ color: 'white' }}
                          disabled={loading || success}
                        >
                          <Delete />
                        </IconButton>
                      }
                      actionPosition="right"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Your story will be reviewed by the memorial moderators before it appears publicly.
                You'll receive an email notification once it's approved.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || success || !title.trim() || !content.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Story'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

