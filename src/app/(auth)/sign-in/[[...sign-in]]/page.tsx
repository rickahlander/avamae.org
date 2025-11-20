import { SignIn } from '@clerk/nextjs';
import { Box, Container, Typography } from '@mui/material';

export default function SignInPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Typography variant="h3" component="h1" color="primary" gutterBottom textAlign="center">
          Welcome to Avamae
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Sign in to create and manage legacy trees
        </Typography>
        <SignIn />
      </Box>
    </Container>
  );
}

