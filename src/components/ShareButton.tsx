'use client';

import { useState } from 'react';
import { Button, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { Share, ContentCopy, Check } from '@mui/icons-material';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  variant?: 'button' | 'icon';
  size?: 'small' | 'medium' | 'large';
}

export default function ShareButton({ 
  url, 
  title, 
  text, 
  variant = 'button',
  size = 'medium' 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleShare = async () => {
    // Try Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // User canceled or share failed, fall back to copy
        console.log('Share canceled or failed:', err);
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowSnackbar(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title="Share">
          <IconButton onClick={handleShare} size={size}>
            {copied ? <Check color="success" /> : <Share />}
          </IconButton>
        </Tooltip>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
            Link copied to clipboard!
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={copied ? <Check /> : <ContentCopy />}
        onClick={handleShare}
        size={size}
      >
        {copied ? 'Copied!' : 'Share'}
      </Button>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}

