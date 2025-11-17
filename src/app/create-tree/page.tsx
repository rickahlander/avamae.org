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

export default function CreateTreePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    rootPersonName: '',
    rootPersonBirthDate: '',
    rootPersonDeathDate: '',
    rootPersonStory: '',
  });
  const [error, setError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.rootPersonName.trim()) {
      setError('Please enter a name');
      return;
    }

    // For now, store in localStorage (temporary until we have auth/database)
    const treeId = Date.now().toString();
    const tree = {
      id: treeId,
      slug: formData.rootPersonName.toLowerCase().replace(/\s+/g, '-'),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(`tree-${treeId}`, JSON.stringify(tree));

    // Also save to a list of all trees
    const trees = JSON.parse(localStorage.getItem('trees') || '[]');
    trees.push(tree);
    localStorage.setItem('trees', JSON.stringify(trees));

    // Redirect to the tree view
    router.push(`/trees/${treeId}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Create a Memorial Tree
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                color="primary"
              >
                Create Tree
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> This is a development version. Your tree will be stored temporarily in your browser.
          In the full version, trees will be securely saved and accessible from any device.
        </Typography>
      </Box>
    </Container>
  );
}
