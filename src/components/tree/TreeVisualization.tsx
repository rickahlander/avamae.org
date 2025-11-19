'use client';

import { Box, Typography, Avatar, Chip, Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { AccountCircle, Add, Edit, Settings, Delete, HelpOutline } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getBranchTypeConfig } from '@/constants/branchTypes';

interface Branch {
  id: string;
  title: string;
  branchType: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  };
  dateOccurred?: string;
  parentBranchId?: string | null;
  description?: string;
  media?: Array<{
    url: string;
    caption?: string | null;
  }>;
}

interface TreeData {
  id: string;
  rootPersonName: string;
  rootPersonBirthDate?: string;
  rootPersonDeathDate?: string;
  rootPersonStory?: string;
  rootPersonProfilePhoto?: string;
  rootPersonPhotos?: string[];
  branches?: Branch[];
}

interface TreeVisualizationProps {
  tree: TreeData;
  canEdit?: boolean;
}

interface BranchCardProps {
  branch: Branch;
  treeId: string;
  level: number;
  allBranches: Branch[];
  onDelete: (branchId: string) => void;
  canEdit?: boolean;
}

function BranchCard({ branch, treeId, level, allBranches, onDelete, canEdit = false }: BranchCardProps) {
  const router = useRouter();
  const childBranches = allBranches.filter((b) => b.parentBranchId === branch.id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get the correct icon for this branch type
  const branchConfig = getBranchTypeConfig(branch.branchType.name);
  const BranchIcon = branchConfig?.icon || HelpOutline;

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(branch.id);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

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
          p: 2,
          borderRadius: 2,
          minWidth: level === 0 ? '220px' : '180px',
          maxWidth: level === 0 ? '220px' : '180px',
          border: '1.5px solid #8FBC8F',
          bgcolor: 'background.paper',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: level === 0 ? 'translateY(-4px)' : 'translateX(4px)',
            boxShadow: 3,
            borderColor: '#6FA76F',
          },
        }}
      >
        {/* Branch Type Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <BranchIcon sx={{ color: '#FF7F50', fontSize: '0.9rem' }} />
          <Chip
            label={branchConfig?.label || branch.branchType.name.replace(/_/g, ' ')}
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

        <Typography variant="body2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
          {branch.title}
        </Typography>

        {branch.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mb: 0.5,
              fontSize: '0.7rem',
              display: 'block',
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
        {branch.media && branch.media.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {branch.media.slice(0, 3).map((mediaItem, index) => (
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
                  src={mediaItem.url}
                  alt={mediaItem.caption || `${branch.title} photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
            {branch.media.length > 3 && (
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
                +{branch.media.length - 3}
              </Box>
            )}
          </Box>
        )}

        {/* Action Buttons - Only show if user can edit */}
        {canEdit && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
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

            <Tooltip title="Delete branch">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  width: 20,
                  height: 20,
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
              >
                <Delete sx={{ fontSize: '0.75rem' }} />
              </IconButton>
            </Tooltip>
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
              onDelete={onDelete}
              canEdit={canEdit}
            />
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Branch?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{branch.title}"?
            {childBranches.length > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 2, color: 'error.main', fontWeight: 600 }}>
                Warning: This branch has {childBranches.length} sub-branch{childBranches.length > 1 ? 'es' : ''}.
                Deleting this branch will also delete all of its sub-branches.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function TreeVisualization({ tree, canEdit = false }: TreeVisualizationProps) {
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

  // Draw connection lines using SVG - Vertical layout
  const drawConnections = () => {
    if (!containerRef.current || !rootCardRef.current) return null;

    const paths: JSX.Element[] = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    // Build parent-child relationships (branch to sub-branch)
    branches.forEach((branch) => {
      if (branch.parentBranchId) {
        const childElement = containerRef.current?.querySelector(`[data-branch-id="${branch.id}"]`) as HTMLElement;
        const parentElement = containerRef.current?.querySelector(`[data-branch-id="${branch.parentBranchId}"]`) as HTMLElement;

        if (childElement && parentElement) {
          const childRect = childElement.getBoundingClientRect();
          const parentRect = parentElement.getBoundingClientRect();

          // Calculate positions relative to container
          // For sub-branches, connect from parent's right edge to child's left edge (horizontal)
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

    // Draw connections from root card to root branches (vertical)
    const rootRect = rootCardRef.current.getBoundingClientRect();
    const rootCenterX = rootRect.left - containerRect.left + rootRect.width / 2;
    const rootBottomY = rootRect.bottom - containerRect.top;

    rootBranches.forEach((branch) => {
      const branchElement = containerRef.current?.querySelector(`[data-branch-id="${branch.id}"]`) as HTMLElement;
      if (branchElement) {
        const branchRect = branchElement.getBoundingClientRect();
        const branchX = branchRect.left - containerRect.left + branchRect.width / 2;
        const branchY = branchRect.top - containerRect.top;

        // Vertical connection with curve
        const verticalGap = branchY - rootBottomY;
        const controlPointOffset = Math.min(verticalGap * 0.5, 40);

        paths.push(
          <path
            key={`root-${branch.id}`}
            d={`M ${rootCenterX} ${rootBottomY} C ${rootCenterX} ${rootBottomY + controlPointOffset}, ${branchX} ${branchY - controlPointOffset}, ${branchX} ${branchY}`}
            stroke="#8FBC8F"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        );
      }
    });

    return paths;
  };

  // Handle branch deletion with recursive child deletion
  const handleDeleteBranch = async (branchId: string) => {
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete branch');
      }

      // Refresh the page to show updated tree
      window.location.reload();
    } catch (err: any) {
      console.error('Error deleting branch:', err);
      alert(err.message || 'Failed to delete branch. Please try again.');
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 2,
        position: 'relative',
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

      {/* Main content wrapper - Vertical layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          zIndex: 2,
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {/* Root/Trunk - The Person (Large prominent card) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          {/* Root Person Card - Large and centered */}
          <Paper
            ref={rootCardRef}
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8962D 100%)',
              color: 'white',
              width: '100%',
              maxWidth: '800px',
              position: 'relative',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: 'center',
            }}
          >
            {canEdit && (
              <Tooltip title="Edit tree">
                <IconButton
                  size="small"
                  onClick={() => router.push(`/trees/${tree.id}/edit-tree`)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  <Settings sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Left section - Photo */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={tree.rootPersonProfilePhoto}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '3rem',
                  border: '4px solid rgba(255,255,255,0.3)',
                }}
              >
                {!tree.rootPersonProfilePhoto && <AccountCircle sx={{ fontSize: '4rem' }} />}
              </Avatar>

              {/* Additional photos */}
              {tree.rootPersonPhotos && tree.rootPersonPhotos.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {tree.rootPersonPhotos.slice(0, 4).map((photo, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.3)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={photo}
                        alt={`${tree.rootPersonName} photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                  {tree.rootPersonPhotos.length > 4 && (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'white',
                      }}
                    >
                      +{tree.rootPersonPhotos.length - 4}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Right section - Details */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                {tree.rootPersonName}
              </Typography>

              {(tree.rootPersonBirthDate || tree.rootPersonDeathDate) && (
                <Typography variant="h6" sx={{ opacity: 0.95, mb: 2, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                  {tree.rootPersonBirthDate && new Date(tree.rootPersonBirthDate).getFullYear()}
                  {' - '}
                  {tree.rootPersonDeathDate && new Date(tree.rootPersonDeathDate).getFullYear()}
                </Typography>
              )}

              {tree.rootPersonStory && (
                <Typography
                  variant="body1"
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: 1.6,
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  {tree.rootPersonStory}
                </Typography>
              )}

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Chip
                  label={`${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                />
                <Chip
                  label={`${rootBranches.length} Direct ${rootBranches.length === 1 ? 'Impact' : 'Impacts'}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Root-level Branches - Horizontal layout */}
        {rootBranches.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {rootBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                treeId={tree.id}
                level={0}
                allBranches={branches}
                onDelete={handleDeleteBranch}
                canEdit={canEdit}
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
