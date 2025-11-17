'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack, Settings, PhotoCamera, Delete } from '@mui/icons-material';

export default function EditTreePage() {
  const params = useParams();
  const router = useRouter();
  const treeId = params.id as string;

  const [formData, setFormData] = useState({
    rootPersonName: '',
    rootPersonBirthDate: '',
    rootPersonDeathDate: '',
    rootPersonStory: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tree data
    const treeData = localStorage.getItem(`tree-${treeId}`);
    if (treeData) {
      const tree = JSON.parse(treeData);
      setFormData({
        rootPersonName: tree.rootPersonName || '',
        rootPersonBirthDate: tree.rootPersonBirthDate || '',
        rootPersonDeathDate: tree.rootPersonDeathDate || '',
        rootPersonStory: tree.rootPersonStory || '',
      });
      setPhotos(tree.rootPersonPhotos || []);
    }
    setLoading(false);
  }, [treeId]);

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.rootPersonName.trim()) {
      setError('Please enter a name');
      return;
    }

    // Load existing tree
    const treeData = localStorage.getItem(`tree-${treeId}`);

    if (!treeData) {
      setError('Tree not found');
      return;
    }

    const tree = JSON.parse(treeData);

    // Update tree with new data
    tree.rootPersonName = formData.rootPersonName;
    tree.rootPersonBirthDate = formData.rootPersonBirthDate;
    tree.rootPersonDeathDate = formData.rootPersonDeathDate;
    tree.rootPersonStory = formData.rootPersonStory;
    tree.rootPersonPhotos = photos;
    tree.updatedAt = new Date().toISOString();

    // Save updated tree
    localStorage.setItem(`tree-${treeId}`, JSON.stringify(tree));

    // Also update in trees list
    const trees = JSON.parse(localStorage.getItem('trees') || '[]');
    const treeIndex = trees.findIndex((t: any) => t.id === treeId);
    if (treeIndex !== -1) {
      trees[treeIndex] = tree;
      localStorage.setItem('trees', JSON.stringify(trees));
    }

    // Redirect back to tree view
    router.push(`/trees/${treeId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => router.push(`/trees/${treeId}`)}
        sx={{ mb: 3 }}
      >
        Back to Tree
      </Button>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Settings color="primary" />
          <Typography variant="h3" component="h1" color="primary">
            Edit Tree
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Update the memorial tree details
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label="Name"
              required
              fullWidth
              value={formData.rootPersonName}
              onChange={handleChange('rootPersonName')}
              helperText="The name of the person this memorial tree honors"
              variant="outlined"
            />

            <TextField
              label="Birth Date"
              type="date"
              fullWidth
              value={formData.rootPersonBirthDate}
              onChange={handleChange('rootPersonBirthDate')}
              InputLabelProps={{ shrink: true }}
              helperText="Optional"
              variant="outlined"
            />

            <TextField
              label="Death Date"
              type="date"
              fullWidth
              value={formData.rootPersonDeathDate}
              onChange={handleChange('rootPersonDeathDate')}
              InputLabelProps={{ shrink: true }}
              helperText="Optional"
              variant="outlined"
            />

            <TextField
              label="Story / Biography"
              multiline
              rows={6}
              fullWidth
              value={formData.rootPersonStory}
              onChange={handleChange('rootPersonStory')}
              helperText="Share the story of this person's life and legacy"
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
                onClick={() => router.push(`/trees/${treeId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                color="primary"
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
