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
} from '@mui/material';
import { ArrowBack, Edit as EditIcon } from '@mui/icons-material';

const BRANCH_TYPES = [
  { value: 'organ_donation', label: 'Organ Donation', icon: '❤️' },
  { value: 'healed_relationship', label: 'Healed Relationship', icon: '🤝' },
  { value: 'foundation', label: 'Foundation/Organization', icon: '🏛️' },
  { value: 'charity', label: 'Charity Connection', icon: '🎗️' },
  { value: 'inspired_act', label: 'Inspired Act of Kindness', icon: '✨' },
  { value: 'life_touched', label: 'Life Touched/Changed', icon: '🌟' },
];

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tree and branch data
    const treeData = localStorage.getItem(`tree-${treeId}`);
    if (treeData) {
      const tree = JSON.parse(treeData);
      setTreeName(tree.rootPersonName);

      // Find the branch to edit
      if (tree.branches) {
        const branch = tree.branches.find((b: any) => b.id === branchId);
        if (branch) {
          setFormData({
            title: branch.title || '',
            type: branch.type || '',
            description: branch.description || '',
            dateOccurred: branch.dateOccurred || '',
          });
        }
      }
    }
    setLoading(false);
  }, [treeId, branchId]);

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
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
    const treeData = localStorage.getItem(`tree-${treeId}`);

    if (!treeData) {
      setError('Tree not found');
      return;
    }

    const tree = JSON.parse(treeData);

    // Find and update the branch
    if (tree.branches) {
      const branchIndex = tree.branches.findIndex((b: any) => b.id === branchId);
      if (branchIndex !== -1) {
        tree.branches[branchIndex] = {
          ...tree.branches[branchIndex],
          ...formData,
          updatedAt: new Date().toISOString(),
        };

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
      } else {
        setError('Branch not found');
      }
    } else {
      setError('No branches found');
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
