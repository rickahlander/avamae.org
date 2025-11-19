'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountTree,
  Login,
  PersonAdd,
  Home,
} from '@mui/icons-material';

export default function Header() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isSignedIn } = useAuth();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const navigationLinks = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Trees', path: '/trees', icon: <AccountTree /> },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={2}
      sx={{ 
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo / Brand */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4,
            }}
          >
            <AccountTree sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: 'var(--font-playfair)',
                fontWeight: 700,
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Ava Mae
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              {navigationLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  href={link.path}
                  startIcon={link.icon}
                  sx={{ color: 'text.primary' }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Spacer for mobile */}
          {isMobile && <Box sx={{ flexGrow: 1 }} />}

          {/* Auth Buttons - Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <>
                  <Button
                    component={Link}
                    href="/sign-in"
                    startIcon={<Login />}
                    variant="outlined"
                  >
                    Sign In
                  </Button>
                  <Button
                    component={Link}
                    href="/sign-up"
                    startIcon={<PersonAdd />}
                    variant="contained"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {navigationLinks.map((link) => (
          <MenuItem
            key={link.path}
            component={Link}
            href={link.path}
            onClick={handleMobileMenuClose}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {link.icon}
              {link.label}
            </Box>
          </MenuItem>
        ))}
        
        {!isSignedIn && [
          <MenuItem
            key="sign-in"
            component={Link}
            href="/sign-in"
            onClick={handleMobileMenuClose}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Login />
              Sign In
            </Box>
          </MenuItem>,
          <MenuItem
            key="sign-up"
            component={Link}
            href="/sign-up"
            onClick={handleMobileMenuClose}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAdd />
              Sign Up
            </Box>
          </MenuItem>
        ]}
      </Menu>
    </AppBar>
  );
}

