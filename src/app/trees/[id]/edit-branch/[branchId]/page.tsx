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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
} from '@mui/material';
import { ArrowBack, Edit as EditIcon, PhotoCamera, Delete } from '@mui/icons-material';
import { BRANCH_TYPES } from '@/constants/branchTypes';

export default function EditBranchPage() {
  const params = useParams();
  const router = useRouter();
  const treeId = params.id as string;
  const branchId = params.branchId as string;

  const [treeName, setTreeName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    dateOccurred: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tree and branch data from API
    const fetchData = async () => {
      try {
        // Fetch tree data
        const treeRes = await fetch(`/api/trees/${treeId}`);
        if (!treeRes.ok) throw new Error('Failed to load tree');
        const tree = await treeRes.json();
        setTreeName(tree.rootPersonName);

        // Fetch branch data
        const branchRes = await fetch(`/api/branches/${branchId}`);
        if (!branchRes.ok) throw new Error('Failed to load branch');
        const branch = await branchRes.json();
        
        setFormData({
          title: branch.title || '',
          type: branch.branchTypeId || '',
          description: branch.description || '',
          dateOccurred: branch.dateOccurred ? branch.dateOccurred.split('T')[0] : '',
        });
        // Convert media array to photos URL array
        setPhotos(branch.media ? branch.media.map((m: any) => m.url) : []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load branch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [treeId, branchId]);

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Resize to max 800px width/height while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(''); // Clear any previous errors

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit before compression
        setError('Photo size must be less than 10MB');
        continue;
      }

      try {
        const compressedPhoto = await compressImage(file);
        setPhotos(prev => [...prev, compressedPhoto]);
      } catch (err) {
        console.error('Error compressing image:', err);
        setError('Failed to process image. Please try a different photo.');
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!formData.type) {
      setError('Please select a branch type');
      return;
    }

    try {
      // Update branch via API
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          dateOccurred: formData.dateOccurred,
          branchTypeId: formData.type,
          photos: photos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update branch');
      }

      // Redirect back to tree view
      router.push(`/trees/${treeId}`);
    } catch (err) {
      console.error('Error saving branch:', err);
      setError(err instanceof Error ? err.message : 'Failed to save branch. Please try again.');
    }
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
          <EditIcon color="primary" />
          <Typography variant="h3" component="h1" color="primary">
            Edit Branch
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {treeName ? `Editing branch in ${treeName}'s tree` : 'Update branch details'}
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
