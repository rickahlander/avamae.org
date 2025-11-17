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

const BRANCH_TYPES = [
  { value: 'organ_donation', label: 'Organ Donation', icon: '❤️' },
  { value: 'healed_relationship', label: 'Healed Relationship', icon: '🤝' },
  { value: 'foundation', label: 'Foundation/Organization', icon: '🏛️' },
  { value: 'charity', label: 'Charity Connection', icon: '🎗️' },
  { value: 'inspired_act', label: 'Inspired Act of Kindness', icon: '✨' },
  { value: 'life_touched', label: 'Life Touched/Changed', icon: '🌟' },
];

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
    dateOccurred: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load tree to get the name and parent branch info
    const treeId = params.id as string;
    const treeData = localStorage.getItem(`tree-${treeId}`);
    if (treeData) {
      const tree = JSON.parse(treeData);
      setTreeName(tree.rootPersonName);

      // If adding to a specific branch, find it
      if (parentBranchId && tree.branches) {
        const parentBranch = tree.branches.find((b: any) => b.id === parentBranchId);
        if (parentBranch) {
          setParentBranchTitle(parentBranch.title);
        }
      }
    }
  }, [params.id, parentBranchId]);

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // TODO (Production): Replace with S3 upload
    // 1. Upload to S3 using presigned URL or direct upload with AWS SDK
    // 2. Store S3 URL in database instead of base64
    // 3. Use CloudFront for CDN delivery
    // 4. Implement image optimization (resize, compress) before upload
    // 5. Add security: signed URLs with expiration for private photos
    //
    // Current (MVP/Local): Base64 encoding for localStorage
    // Limitation: Max 5MB per photo, stored inline (not ideal for production)

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for localStorage
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
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!formData.type) {
      setError('Please select a branch type');
      return;
    }

    // Load existing tree
    const treeId = params.id as string;
    const treeData = localStorage.getItem(`tree-${treeId}`);

    if (!treeData) {
      setError('Tree not found');
      return;
    }

    const tree = JSON.parse(treeData);

    // Create new branch
    const newBranch = {
      id: Date.now().toString(),
      ...formData,
      parentBranchId: parentBranchId || null,
      photos: photos,
      createdAt: new Date().toISOString(),
    };

    // Add branch to tree
    tree.branches = tree.branches || [];
    tree.branches.push(newBranch);

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
                {BRANCH_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
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
