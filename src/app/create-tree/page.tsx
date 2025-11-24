'use client';

import { useActionState, useEffect } from 'react';
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

interface FormState {
  error?: string;
  success?: boolean;
  treeId?: string;
}

async function createTreeAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rootPersonName = formData.get('rootPersonName') as string;
  const rootPersonBirthDate = formData.get('rootPersonBirthDate') as string;
  const rootPersonDeathDate = formData.get('rootPersonDeathDate') as string;
  const rootPersonStory = formData.get('rootPersonStory') as string;

  // Validation
  if (!rootPersonName?.trim()) {
    return { error: 'Please enter a name' };
  }

  try {
    const response = await fetch('/api/trees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rootPersonName,
        rootPersonBirthDate: rootPersonBirthDate || undefined,
        rootPersonDeathDate: rootPersonDeathDate || undefined,
        rootPersonStory: rootPersonStory || undefined,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'Failed to create tree' };
    }

    const tree = await response.json();
    return { success: true, treeId: tree.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to create tree' };
  }
}

export default function CreateTreePage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    createTreeAction,
    {}
  );

  // Check authentication
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Redirect on success
  useEffect(() => {
    if (state.success && state.treeId) {
      router.push(`/trees/${state.treeId}`);
    }
  }, [state.success, state.treeId, router]);

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
        <form action={formAction}>
          <Stack spacing={3}>
            {state.error && (
              <Alert severity="error">
                {state.error}
              </Alert>
            )}

            <TextField
              name="rootPersonName"
              label="Name"
              required
              fullWidth
              disabled={isPending}
              helperText="The name of your loved one"
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="rootPersonBirthDate"
                label="Date of Birth"
                type="date"
                fullWidth
                disabled={isPending}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />

              <TextField
                name="rootPersonDeathDate"
                label="Date of Passing"
                type="date"
                fullWidth
                disabled={isPending}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Box>

            <TextField
              name="rootPersonStory"
              label="Their Story"
              multiline
              rows={6}
              fullWidth
              disabled={isPending}
              helperText="Share what made them special, their passions, personality, and the impact they had"
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/')}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                color="primary"
                disabled={isPending}
              >
                {isPending ? 'Creating...' : 'Create Legacy Tree'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

    </Container>
  );
}
