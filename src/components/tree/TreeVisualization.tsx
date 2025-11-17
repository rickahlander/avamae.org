'use client';

import { Box, Typography, Avatar, Chip, Paper, IconButton, Tooltip } from '@mui/material';
import { Favorite, AccountCircle, Add, Edit, Settings } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Branch {
  id: string;
  title: string;
  type: string;
  dateOccurred?: string;
  parentBranchId?: string | null;
  description?: string;
  photos?: string[];
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
  allBranches: Branch[];
}

function BranchCard({ branch, treeId, level, allBranches }: BranchCardProps) {
  const router = useRouter();
  const childBranches = allBranches.filter((b) => b.parentBranchId === branch.id);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        my: 0.5,
      }}
    >
      {/* Branch card */}
      <Paper
        data-branch-id={branch.id}
        elevation={1}
        sx={{
          p: 1.5,
          borderRadius: 2,
          minWidth: '180px',
          maxWidth: '180px',
          border: '1.5px solid #8FBC8F',
          bgcolor: 'background.paper',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: 3,
            borderColor: '#6FA76F',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Favorite sx={{ color: '#FF7F50', fontSize: '0.9rem' }} />
            <Chip
              label={branch.type.replace(/_/g, ' ')}
              size="small"
              sx={{
                bgcolor: '#8FBC8F',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.65rem',
                height: '18px',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit branch">
              <IconButton
                size="small"
                onClick={() => router.push(`/trees/${treeId}/edit-branch/${branch.id}`)}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 20,
                  height: 20,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <Edit sx={{ fontSize: '0.75rem' }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add sub-branch">
              <IconButton
                size="small"
                onClick={() => router.push(`/trees/${treeId}/add-branch?parentBranchId=${branch.id}`)}
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  width: 20,
                  height: 20,
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                }}
              >
                <Add sx={{ fontSize: '0.85rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
          {branch.title}
        </Typography>

        {branch.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 0.5,
              fontSize: '0.7rem',
            }}
          >
            {branch.description}
          </Typography>
        )}

        {branch.dateOccurred && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
            {new Date(branch.dateOccurred).toLocaleDateString()}
          </Typography>
        )}

        {childBranches.length > 0 && (
          <Chip
            label={`${childBranches.length} sub-${childBranches.length === 1 ? 'branch' : 'branches'}`}
            size="small"
            sx={{ mt: 0.5, fontSize: '0.6rem', height: '16px' }}
          />
        )}

        {/* Photo thumbnails */}
        {branch.photos && branch.photos.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {branch.photos.slice(0, 3).map((photo, index) => (
              <Box
                key={index}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              >
                <img
                  src={photo}
                  alt={`${branch.title} photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
            {branch.photos.length > 3 && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                +{branch.photos.length - 3}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Child branches - Recursive, stacked vertically */}
      {childBranches.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {childBranches.map((childBranch) => (
            <BranchCard
              key={childBranch.id}
              branch={childBranch}
              treeId={treeId}
              level={level + 1}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const rootCardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [, setUpdateTrigger] = useState(0);
  const branches = tree.branches || [];

  // Get only root-level branches (no parent or parent is null)
  const rootBranches = branches.filter((b) => !b.parentBranchId);

  // Force re-render to update connections
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Update connections after render and on resize
  useEffect(() => {
    const updateConnections = () => {
      setTimeout(forceUpdate, 100);
    };

    updateConnections();
    window.addEventListener('resize', updateConnections);

    return () => {
      window.removeEventListener('resize', updateConnections);
    };
  }, [branches.length, forceUpdate]);

  // Additional update after animations complete
  useEffect(() => {
    const timer = setTimeout(forceUpdate, 500);
    return () => clearTimeout(timer);
  }, [branches.length, forceUpdate]);

  // Draw connection lines using SVG
  const drawConnections = () => {
    if (!containerRef.current || !rootCardRef.current) return null;

    const paths: JSX.Element[] = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    // Build parent-child relationships
    branches.forEach((branch) => {
      if (branch.parentBranchId) {
        const childElement = containerRef.current?.querySelector(`[data-branch-id="${branch.id}"]`) as HTMLElement;
        const parentElement = containerRef.current?.querySelector(`[data-branch-id="${branch.parentBranchId}"]`) as HTMLElement;

        if (childElement && parentElement) {
          const childRect = childElement.getBoundingClientRect();
          const parentRect = parentElement.getBoundingClientRect();

          // Calculate positions relative to container
          // Connect from parent's right edge to child's left edge
          const startX = parentRect.right - containerRect.left;
          const startY = parentRect.top - containerRect.top + parentRect.height / 2;
          const endX = childRect.left - containerRect.left;
          const endY = childRect.top - containerRect.top + childRect.height / 2;

          // Create smooth curve
          const horizontalGap = endX - startX;
          const controlPointOffset = Math.min(horizontalGap * 0.5, 60);

          paths.push(
            <path
              key={`${branch.parentBranchId}-${branch.id}`}
              d={`M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`}
              stroke="#8FBC8F"
              strokeWidth="2"
              fill="none"
            />
          );
        }
      }
    });

    // Draw connections from root card to root branches
    const rootRect = rootCardRef.current.getBoundingClientRect();
    const rootX = rootRect.right - containerRect.left;
    const rootY = rootRect.top - containerRect.top + rootRect.height / 2;

    rootBranches.forEach((branch) => {
      const branchElement = containerRef.current?.querySelector(`[data-branch-id="${branch.id}"]`) as HTMLElement;
      if (branchElement) {
        const branchRect = branchElement.getBoundingClientRect();
        const branchX = branchRect.left - containerRect.left;
        const branchY = branchRect.top - containerRect.top + branchRect.height / 2;

        const horizontalGap = branchX - rootX;
        const controlPointOffset = Math.min(horizontalGap * 0.5, 60);

        paths.push(
          <path
            key={`root-${branch.id}`}
            d={`M ${rootX} ${rootY} C ${rootX + controlPointOffset} ${rootY}, ${branchX - controlPointOffset} ${branchY}, ${branchX} ${branchY}`}
            stroke="#8FBC8F"
            strokeWidth="2"
            fill="none"
          />
        );
      }
    });

    return paths;
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        py: 2,
        px: 2,
        position: 'relative',
        overflowX: 'auto',
      }}
    >
      {/* SVG overlay for connection lines */}
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {drawConnections()}
      </svg>

      {/* Main content wrapper */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2.5,
          zIndex: 2,
        }}
      >
        {/* Root/Trunk - The Person */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          {/* Trunk visual (horizontal now) */}
          <Box
            sx={{
              width: '40px',
              height: '3px',
              background: 'linear-gradient(to right, #8B7355, #6F5A40)',
              borderRadius: '2px',
            }}
          />

          {/* Root Person Card */}
          <Paper
            ref={rootCardRef}
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8962D 100%)',
              color: 'white',
              minWidth: '200px',
              maxWidth: '200px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Tooltip title="Edit tree">
              <IconButton
                size="small"
                onClick={() => router.push(`/trees/${tree.id}/edit-tree`)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  width: 24,
                  height: 24,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                <Settings sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Tooltip>

            <Avatar
              sx={{
                width: 60,
                height: 60,
                margin: '0 auto 8px',
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
              }}
            >
              <AccountCircle sx={{ fontSize: '2.5rem' }} />
            </Avatar>

            <Typography variant="h6" component="h2" gutterBottom fontWeight={600} sx={{ fontSize: '1rem' }}>
              {tree.rootPersonName}
            </Typography>

            {(tree.rootPersonBirthDate || tree.rootPersonDeathDate) && (
              <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5, fontSize: '0.7rem' }}>
                {tree.rootPersonBirthDate && new Date(tree.rootPersonBirthDate).getFullYear()}
                {' - '}
                {tree.rootPersonDeathDate && new Date(tree.rootPersonDeathDate).getFullYear()}
              </Typography>
            )}

            {tree.rootPersonStory && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  p: 1,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderRadius: 1.5,
                  display: 'block',
                  maxHeight: '60px',
                  overflow: 'auto',
                  fontSize: '0.65rem',
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
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {rootBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                treeId={tree.id}
                level={0}
                allBranches={branches}
              />
            ))}
          </Box>
        )}

        {/* Empty state */}
        {branches.length === 0 && (
          <Box
            sx={{
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
    </Box>
  );
}
