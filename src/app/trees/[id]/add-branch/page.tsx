'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
} from '@mui/material';
import { ArrowBack, AccountTree, PhotoCamera, Delete } from '@mui/icons-material';
import { BRANCH_TYPES } from '@/constants/branchTypes';

export default function AddBranchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentBranchId = searchParams.get('parentBranchId');

  const [treeName, setTreeName] = useState('');
  const [parentBranchTitle, setParentBranchTitle] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    url: '',
    dateOccurred: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load tree from API to get the name and parent branch info
    const treeId = params.id as string;

    const fetchTree = async () => {
      try {
        const response = await fetch(`/api/trees/${treeId}`);
        if (!response.ok) throw new Error('Failed to load tree');

        const tree = await response.json();
        setTreeName(tree.rootPersonName);

        // If adding to a specific branch, find it
        if (parentBranchId && tree.branches) {
          const parentBranch = tree.branches.find((b: any) => b.id === parentBranchId);
          if (parentBranch) {
            setParentBranchTitle(parentBranch.title);
          }
        }
      } catch (err) {
        console.error('Error loading tree:', err);
        setError('Failed to load tree');
      }
    };

    fetchTree();
  }, [params.id, parentBranchId]);

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(''); // Clear any previous errors
    setLoading(true);

    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('Photo size must be less than 10MB');
          continue;
        }

        // Upload to server (Vercel Blob in production, local in dev)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'branches');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload photo');
        }

        const data = await response.json();
        setPhotos(prev => [...prev, data.url]);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title');
      setLoading(false);
      return;
    }
    if (!formData.type) {
      setError('Please select a branch type');
      setLoading(false);
      return;
    }

    const treeId = params.id as string;

    try {
      // Create new branch via API
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          treeId,
          title: formData.title,
          branchTypeId: formData.type,
          description: formData.description || null,
          url: formData.url || null,
          dateOccurred: formData.dateOccurred || null,
          parentBranchId: parentBranchId || null,
          photos: photos,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create branch');
      }

      // Redirect back to tree view
      router.push(`/trees/${treeId}`);
    } catch (err) {
      console.error('Error creating branch:', err);
      setError(err instanceof Error ? err.message : 'Failed to save branch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => router.push(`/trees/${params.id}`)}
        sx={{ mb: 3 }}
      >
        Back to Tree
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Add a Branch
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {treeName ? `Add to ${treeName}'s tree` : 'Share how this life has blessed others'}
        </Typography>

        {parentBranchTitle && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <AccountTree color="secondary" />
            <Typography variant="body2">
              Adding a sub-branch to:
            </Typography>
            <Chip
              label={parentBranchTitle}
              color="secondary"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        )}
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth required>
              <InputLabel>Branch Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Branch Type"
              >
                {BRANCH_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ fontSize: '1.2rem' }} />
                        <span>{type.label}</span>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              label="Title"
              required
              fullWidth
              value={formData.title}
              onChange={handleChange('title')}
              helperText="E.g., 'Heart recipient - gave life to John Smith' or 'Relationship healed with sister'"
              variant="outlined"
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleChange('description')}
              helperText="Share the story of this impact"
              variant="outlined"
            />

            <TextField
              label="Website URL"
              type="url"
              fullWidth
              value={formData.url}
              onChange={handleChange('url')}
              placeholder="https://example.com"
              helperText="Link to organization, obituary, or related website"
              variant="outlined"
            />

            <TextField
              label="Date"
              type="date"
              fullWidth
              value={formData.dateOccurred}
              onChange={handleChange('dateOccurred')}
              InputLabelProps={{ shrink: true }}
              helperText="When did this impact occur?"
              variant="outlined"
            />

            {/* Photo Upload */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
                Photos (optional)
              </Typography>

              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mb: 2 }}
              >
                Upload Photos
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                />
              </Button>

              {photos.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {photos.map((photo, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemovePhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.8)',
                          },
                        }}
                      >
                        <Delete sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push(`/trees/${params.id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                color="secondary"
              >
                Add Branch
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Coming soon:</strong> Add photos, videos, links to donation pages,
          and create sub-branches to show how impact continues to grow.
        </Typography>
      </Box>
    </Container>
  );
}
