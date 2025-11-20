import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  YouTube,
  Language,
  Link as LinkIcon,
  GitHub,
  Email,
  Phone,
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

// TikTok doesn't have an MUI icon, so we'll use a custom one or emoji
const TikTokIcon = (props: SvgIconProps) => (
  <span style={{ fontSize: props.fontSize || '24px' }}>🎵</span>
);

const SnapchatIcon = (props: SvgIconProps) => (
  <span style={{ fontSize: props.fontSize || '24px' }}>👻</span>
);

const PinterestIcon = (props: SvgIconProps) => (
  <span style={{ fontSize: props.fontSize || '24px' }}>📌</span>
);

export interface SocialPlatform {
  name: string;
  icon: React.ComponentType<SvgIconProps>;
  color: string;
  patterns: string[]; // URL patterns to match
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    patterns: ['facebook.com', 'fb.com', 'fb.me'],
  },
  {
    name: 'Twitter/X',
    icon: Twitter,
    color: '#000000',
    patterns: ['twitter.com', 'x.com', 't.co'],
  },
  {
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    patterns: ['instagram.com', 'instagr.am'],
  },
  {
    name: 'LinkedIn',
    icon: LinkedIn,
    color: '#0A66C2',
    patterns: ['linkedin.com', 'lnkd.in'],
  },
  {
    name: 'YouTube',
    icon: YouTube,
    color: '#FF0000',
    patterns: ['youtube.com', 'youtu.be'],
  },
  {
    name: 'TikTok',
    icon: TikTokIcon,
    color: '#000000',
    patterns: ['tiktok.com', 'vm.tiktok.com'],
  },
  {
    name: 'GitHub',
    icon: GitHub,
    color: '#181717',
    patterns: ['github.com', 'github.io'],
  },
  {
    name: 'Snapchat',
    icon: SnapchatIcon,
    color: '#FFFC00',
    patterns: ['snapchat.com', 'snap.com'],
  },
  {
    name: 'Pinterest',
    icon: PinterestIcon,
    color: '#E60023',
    patterns: ['pinterest.com', 'pin.it'],
  },
];

/**
 * Detect the social platform from a URL
 */
export function detectPlatformFromUrl(url: string): SocialPlatform {
  const lowerUrl = url.toLowerCase();
  
  // Check for email
  if (url.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) {
    return {
      name: 'Email',
      icon: Email,
      color: '#EA4335',
      patterns: ['mailto:'],
    };
  }
  
  // Check for phone
  if (url.startsWith('tel:') || /^[\d\s\-\+\(\)]+$/.test(url)) {
    return {
      name: 'Phone',
      icon: Phone,
      color: '#34A853',
      patterns: ['tel:'],
    };
  }
  
  // Check each platform
  for (const platform of SOCIAL_PLATFORMS) {
    if (platform.patterns.some(pattern => lowerUrl.includes(pattern))) {
      return platform;
    }
  }
  
  // Default to generic website icon
  return {
    name: 'Website',
    icon: Language,
    color: '#5F6368',
    patterns: [],
  };
}

/**
 * Get the display label for a URL (tries to extract username or domain)
 */
export function getDisplayLabelFromUrl(url: string): string {
  try {
    // Handle email
    if (url.startsWith('mailto:')) {
      return url.replace('mailto:', '');
    }
    
    // Handle phone
    if (url.startsWith('tel:')) {
      return url.replace('tel:', '');
    }
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname;
    
    // For social media, try to extract username
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      const username = pathname.split('/').filter(Boolean)[0];
      return username ? `Facebook - ${username}` : 'Facebook';
    }
    
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      const username = pathname.split('/').filter(Boolean)[0];
      return username ? `@${username}` : 'Twitter/X';
    }
    
    if (hostname.includes('instagram.com')) {
      const username = pathname.split('/').filter(Boolean)[0];
      return username ? `@${username}` : 'Instagram';
    }
    
    if (hostname.includes('linkedin.com')) {
      if (pathname.includes('/in/')) {
        const username = pathname.split('/in/')[1]?.split('/')[0];
        return username ? `LinkedIn - ${username}` : 'LinkedIn';
      }
      return 'LinkedIn';
    }
    
    if (hostname.includes('youtube.com')) {
      if (pathname.includes('/@')) {
        const username = pathname.split('/@')[1]?.split('/')[0];
        return username ? `YouTube - ${username}` : 'YouTube';
      }
      if (pathname.includes('/channel/') || pathname.includes('/c/')) {
        return 'YouTube Channel';
      }
      return 'YouTube';
    }
    
    if (hostname.includes('tiktok.com')) {
      const username = pathname.split('/@')[1]?.split('/')[0];
      return username ? `TikTok - ${username}` : 'TikTok';
    }
    
    if (hostname.includes('github.com')) {
      const username = pathname.split('/').filter(Boolean)[0];
      return username ? `GitHub - ${username}` : 'GitHub';
    }
    
    // For other sites, just return the domain
    return hostname;
  } catch {
    return url;
  }
}

