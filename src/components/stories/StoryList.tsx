'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  ImageList,
  ImageListItem,
  Chip,
  Link as MuiLink,
} from '@mui/material';
import { Person, CalendarToday } from '@mui/icons-material';
import { formatNameForDisplay } from '@/utils/privacy';

interface Story {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  approved: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  media?: Array<{
    id: string;
    url: string;
    caption?: string | null;
  }>;
}

interface StoryListProps {
  stories: Story[];
  emptyMessage?: string;
}

export default function StoryList({ stories, emptyMessage = 'No stories yet. Be the first to share a memory!' }: StoryListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Convert URLs in text to clickable links
  const linkifyContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <MuiLink
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'primary.main', textDecoration: 'underline' }}
          >
            {part}
          </MuiLink>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (stories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {stories.map((story) => (
        <Card key={story.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Author info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={story.author.avatarUrl || undefined}
                alt={formatNameForDisplay(story.author.name)}
                sx={{ width: 48, height: 48 }}
              >
                <Person />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatNameForDisplay(story.author.name)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <CalendarToday sx={{ fontSize: 14 }} />
                  <Typography variant="caption">
                    {formatDate(story.createdAt)}
                  </Typography>
                </Box>
              </Box>
              {!story.approved && (
                <Chip label="Pending Approval" size="small" color="warning" />
              )}
            </Box>

            {/* Story title */}
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
              {story.title}
            </Typography>

            {/* Story content */}
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                color: 'text.secondary',
              }}
            >
              {linkifyContent(story.content)}
            </Typography>

            {/* Photos */}
            {story.media && story.media.length > 0 && (
              <ImageList
                cols={story.media.length === 1 ? 1 : story.media.length === 2 ? 2 : 3}
                gap={8}
                sx={{ mt: 2 }}
              >
                {story.media.map((media) => (
                  <ImageListItem key={media.id}>
                    <img
                      src={media.url}
                      alt={media.caption || 'Story photo'}
                      loading="lazy"
                      style={{
                        height: story.media!.length === 1 ? '400px' : '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

