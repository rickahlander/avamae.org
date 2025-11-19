import { UserProfile } from '@clerk/nextjs';
import { Container, Typography, Box } from '@mui/material';

export default function ProfilePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" color="primary" gutterBottom textAlign="center">
          Your Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Manage your account settings and preferences
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <UserProfile />
        </Box>
      </Box>
    </Container>
  );
}

