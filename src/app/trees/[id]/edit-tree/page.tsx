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
import { ArrowBack, Settings, PhotoCamera, Delete, Add, Link as LinkIcon } from '@mui/icons-material';

export default function EditTreePage() {
  const params = useParams();
  const router = useRouter();
  const treeId = params.id as string;

  const [formData, setFormData] = useState({
    rootPersonName: '',
    rootPersonBirthDate: '',
    rootPersonDeathDate: '',
    rootPersonStory: '',
    url: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [links, setLinks] = useState<Array<{ label?: string; url: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tree data from API
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/trees/${treeId}`);
        if (!response.ok) throw new Error('Failed to load tree');
        const tree = await response.json();
        
        setFormData({
          rootPersonName: tree.rootPersonName || '',
          rootPersonBirthDate: tree.rootPersonBirthDate ? tree.rootPersonBirthDate.split('T')[0] : '',
          rootPersonDeathDate: tree.rootPersonDeathDate ? tree.rootPersonDeathDate.split('T')[0] : '',
          rootPersonStory: tree.rootPersonStory || '',
          url: tree.url || '',
        });
        setProfilePhoto(tree.rootPersonProfilePhoto || tree.rootPersonPhotoUrl || '');
        // Use transformed photos array
        setPhotos(tree.rootPersonPhotos || []);
        // Load links
        setLinks(tree.links || []);
      } catch (err) {
        console.error('Error loading tree:', err);
        setError('Failed to load tree data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [treeId]);

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

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(''); // Clear any previous errors
    setLoading(true);

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Photo size must be less than 10MB');
      setLoading(false);
      return;
    }

    try {
      // Upload to server (S3 in production, local in dev)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'trees');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();
      setProfilePhoto(data.url);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
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

        // Upload to server (S3 in production, local in dev)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'trees');

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

    // Validation
    if (!formData.rootPersonName.trim()) {
      setError('Please enter a name');
      return;
    }

    try {
      // Update tree via API
      const response = await fetch(`/api/trees/${treeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rootPersonPhotoUrl: profilePhoto,
          rootPersonPhotos: photos, // Additional photos stored in TreeMedia
          links: links, // Social media and web links
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tree');
      }

      // Redirect back to tree view
      router.push(`/trees/${treeId}`);
    } catch (err) {
      console.error('Error saving tree:', err);
      setError(err instanceof Error ? err.message : 'Failed to save tree. Please try again.');
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
          <Settings color="primary" />
          <Typography variant="h3" component="h1" color="primary">
            Edit Tree
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Update the legacy tree details
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
              helperText="The name of the person this legacy tree honors"
              variant="outlined"
            />

            {/* Profile Photo */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
                Profile Photo (optional)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                This photo will be displayed as the main profile image in the tree
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {profilePhoto ? (
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setProfilePhoto('')}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'error.dark',
                        },
                      }}
                    >
                      <Delete sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                )}

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                  />
                </Button>
              </Box>
            </Box>

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

            <TextField
              label="Website URL"
              type="url"
              fullWidth
              value={formData.url}
              onChange={handleChange('url')}
              placeholder="https://example.com"
              helperText="Link to obituary, memorial page, or related website"
              variant="outlined"
            />

            {/* Social Media & Web Links */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
                Social Media & Other Links (optional)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Add Facebook, Instagram, Twitter/X, LinkedIn, YouTube, or any other web links
              </Typography>

              {links.map((link, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Label (optional)"
                    placeholder="Facebook, Instagram, etc."
                    value={link.label || ''}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = { ...newLinks[index], label: e.target.value };
                      setLinks(newLinks);
                    }}
                    sx={{ flex: '0 0 200px' }}
                    size="small"
                  />
                  <TextField
                    label="URL"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = { ...newLinks[index], url: e.target.value };
                      setLinks(newLinks);
                    }}
                    sx={{ flex: 1 }}
                    size="small"
                    required
                  />
                  <IconButton
                    onClick={() => {
                      const newLinks = links.filter((_, i) => i !== index);
                      setLinks(newLinks);
                    }}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}

              <Button
                startIcon={<Add />}
                onClick={() => setLinks([...links, { label: '', url: '' }])}
                variant="outlined"
                size="small"
              >
                Add Link
              </Button>
            </Box>

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
