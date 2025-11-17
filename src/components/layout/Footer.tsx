'use client';

import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const yearDisplay = currentYear > startYear ? `${startYear}-${currentYear}` : startYear;

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          Copyright © LastingEffect.org {yearDisplay}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
