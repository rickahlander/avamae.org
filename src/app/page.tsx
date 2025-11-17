import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h1" component="h1" color="primary">
          Ava Mae
        </Typography>

        <Typography variant="h5" component="h2" color="text.secondary" sx={{ maxWidth: '800px' }}>
          Honoring lives, growing legacies. A living memorial where one life continues to bless others for generations.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/create-tree"
          >
            Create a Tree
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={Link}
            href="/trees"
          >
            Explore Trees
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Platform in development - Coming Soon
        </Typography>
      </Box>
    </Container>
  );
}
