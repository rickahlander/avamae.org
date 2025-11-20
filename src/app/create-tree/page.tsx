'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function CreateTreePage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [formData, setFormData] = useState({
    rootPersonName: '',
    rootPersonBirthDate: '',
    rootPersonDeathDate: '',
    rootPersonStory: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check authentication
    if (!isLoaded || !userId) {
      setError('You must be signed in to create a tree');
      router.push('/sign-in');
      return;
    }

    // Validation
    if (!formData.rootPersonName.trim()) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tree');
      }

      const tree = await response.json();
      router.push(`/trees/${tree.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create tree');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Create a Legacy Tree
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Honor your loved one by creating a living memorial that celebrates their life and the legacy they continue to create.
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
              helperText="The name of your loved one"
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                value={formData.rootPersonBirthDate}
                onChange={handleChange('rootPersonBirthDate')}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />

              <TextField
                label="Date of Passing"
                type="date"
                fullWidth
                value={formData.rootPersonDeathDate}
                onChange={handleChange('rootPersonDeathDate')}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Box>

            <TextField
              label="Their Story"
              multiline
              rows={6}
              fullWidth
              value={formData.rootPersonStory}
              onChange={handleChange('rootPersonStory')}
              helperText="Share what made them special, their passions, personality, and the impact they had"
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Legacy Tree'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

    </Container>
  );
}
