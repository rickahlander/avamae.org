'use client';

import { Box, Typography, Avatar, Chip, Paper } from '@mui/material';
import { Favorite, AccountCircle } from '@mui/icons-material';

interface Branch {
  id: string;
  title: string;
  type: string;
  dateOccurred?: string;
}

interface TreeData {
  id: string;
  rootPersonName: string;
  rootPersonBirthDate?: string;
  rootPersonDeathDate?: string;
  rootPersonStory?: string;
  branches?: Branch[];
}

interface TreeVisualizationProps {
  tree: TreeData;
}

export default function TreeVisualization({ tree }: TreeVisualizationProps) {
  const branches = tree.branches || [];

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        position: 'relative',
      }}
    >
      {/* Root/Trunk - The Person */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          zIndex: 2,
        }}
      >
        {/* Trunk visual */}
        <Box
          sx={{
            width: '4px',
            height: '60px',
            background: 'linear-gradient(to bottom, #8B7355, #6F5A40)',
            borderRadius: '2px',
          }}
        />

        {/* Root Person Card */}
        <Paper
          elevation={4}
          sx={{
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8962D 100%)',
            color: 'white',
            minWidth: '300px',
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto 16px',
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '3rem',
            }}
          >
            <AccountCircle sx={{ fontSize: '4rem' }} />
          </Avatar>

          <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
            {tree.rootPersonName}
          </Typography>

          {(tree.rootPersonBirthDate || tree.rootPersonDeathDate) && (
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              {tree.rootPersonBirthDate && new Date(tree.rootPersonBirthDate).getFullYear()}
              {' - '}
              {tree.rootPersonDeathDate && new Date(tree.rootPersonDeathDate).getFullYear()}
            </Typography>
          )}

          {tree.rootPersonStory && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                maxHeight: '100px',
                overflow: 'auto',
              }}
            >
              {tree.rootPersonStory}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Branches */}
      {branches.length > 0 && (
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            maxWidth: '900px',
          }}
        >
          {branches.map((branch, index) => (
            <Box
              key={branch.id}
              sx={{
                position: 'relative',
                animation: `growBranch 0.6s ease-out ${index * 0.1}s both`,
                '@keyframes growBranch': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-20px) scale(0.8)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                  },
                },
              }}
            >
              {/* Branch line */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  width: '2px',
                  height: '40px',
                  bgcolor: '#8FBC8F',
                  transform: 'translateX(-50%)',
                }}
              />

              {/* Branch card */}
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  minWidth: '200px',
                  maxWidth: '250px',
                  border: '2px solid #8FBC8F',
                  bgcolor: 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: '#6FA76F',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Favorite sx={{ color: '#FF7F50', fontSize: '1.2rem' }} />
                  <Chip
                    label={branch.type}
                    size="small"
                    sx={{
                      bgcolor: '#8FBC8F',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                </Box>

                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {branch.title}
                </Typography>

                {branch.dateOccurred && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(branch.dateOccurred).toLocaleDateString()}
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {/* Empty state */}
      {branches.length === 0 && (
        <Box
          sx={{
            mt: 4,
            p: 4,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" gutterBottom>
            No branches yet
          </Typography>
          <Typography variant="body2">
            Add branches to show how this life continues to bless others
          </Typography>
        </Box>
      )}
    </Box>
  );
}
