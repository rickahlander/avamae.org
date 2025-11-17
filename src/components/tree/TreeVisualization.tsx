'use client';

import { Box, Typography, Avatar, Chip, Paper, IconButton, Tooltip } from '@mui/material';
import { Favorite, AccountCircle, Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  title: string;
  type: string;
  dateOccurred?: string;
  parentBranchId?: string | null;
  description?: string;
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

interface BranchCardProps {
  branch: Branch;
  treeId: string;
  level: number;
  index: number;
  allBranches: Branch[];
}

function BranchCard({ branch, treeId, level, index, allBranches }: BranchCardProps) {
  const router = useRouter();
  const childBranches = allBranches.filter((b) => b.parentBranchId === branch.id);

  return (
    <Box
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
      {/* Branch line connecting to parent */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          width: '2px',
          height: level === 0 ? '40px' : '30px',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Favorite sx={{ color: '#FF7F50', fontSize: '1.2rem' }} />
            <Chip
              label={branch.type.replace(/_/g, ' ')}
              size="small"
              sx={{
                bgcolor: '#8FBC8F',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.7rem',
              }}
            />
          </Box>

          <Tooltip title="Add sub-branch">
            <IconButton
              size="small"
              onClick={() => router.push(`/trees/${treeId}/add-branch?parentBranchId=${branch.id}`)}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                width: 24,
                height: 24,
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              <Add sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="body1" fontWeight={600} gutterBottom>
          {branch.title}
        </Typography>

        {branch.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1,
            }}
          >
            {branch.description}
          </Typography>
        )}

        {branch.dateOccurred && (
          <Typography variant="caption" color="text.secondary" display="block">
            {new Date(branch.dateOccurred).toLocaleDateString()}
          </Typography>
        )}

        {childBranches.length > 0 && (
          <Chip
            label={`${childBranches.length} sub-${childBranches.length === 1 ? 'branch' : 'branches'}`}
            size="small"
            sx={{ mt: 1, fontSize: '0.65rem' }}
          />
        )}
      </Paper>

      {/* Child branches - Recursive */}
      {childBranches.length > 0 && (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            pl: level > 0 ? 2 : 0,
          }}
        >
          {childBranches.map((childBranch, childIndex) => (
            <BranchCard
              key={childBranch.id}
              branch={childBranch}
              treeId={treeId}
              level={level + 1}
              index={childIndex}
              allBranches={allBranches}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function TreeVisualization({ tree }: TreeVisualizationProps) {
  const router = useRouter();
  const branches = tree.branches || [];

  // Get only root-level branches (no parent or parent is null)
  const rootBranches = branches.filter((b) => !b.parentBranchId);

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

      {/* Root-level Branches */}
      {rootBranches.length > 0 && (
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            maxWidth: '1200px',
          }}
        >
          {rootBranches.map((branch, index) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              treeId={tree.id}
              level={0}
              index={index}
              allBranches={branches}
            />
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
