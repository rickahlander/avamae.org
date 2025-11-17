'use client';

import { Box, Typography, Paper, Chip, Tooltip } from '@mui/material';
import { AccountCircle, Favorite } from '@mui/icons-material';

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

interface IllustrativeTreeProps {
  tree: TreeData;
}

interface TreeNode {
  branch: Branch;
  children: TreeNode[];
  x: number;
  y: number;
  level: number;
}

export default function IllustrativeTree({ tree }: IllustrativeTreeProps) {
  const branches = tree.branches || [];
  const rootBranches = branches.filter((b) => !b.parentBranchId);

  // Build tree structure
  const buildTreeStructure = (parentId: string | null, level: number): TreeNode[] => {
    const children = branches.filter((b) => b.parentBranchId === parentId);
    return children.map((branch) => ({
      branch,
      children: buildTreeStructure(branch.id, level + 1),
      x: 0,
      y: 0,
      level,
    }));
  };

  const treeNodes = buildTreeStructure(null, 0);

  // Calculate positions for branches (simple layout)
  const positionNodes = (nodes: TreeNode[], startX: number, startY: number, width: number): TreeNode[] => {
    if (nodes.length === 0) return [];

    const spacing = width / Math.max(nodes.length, 1);

    return nodes.map((node, index) => {
      const x = startX + (index - (nodes.length - 1) / 2) * spacing;
      const y = startY;
      const positioned = {
        ...node,
        x,
        y,
        children: positionNodes(node.children, x, y + 120, spacing * 0.8),
      };
      return positioned;
    });
  };

  const positionedNodes = positionNodes(treeNodes, 400, 250, 600);

  // Flatten nodes for rendering
  const flattenNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.reduce((acc, node) => {
      return [...acc, node, ...flattenNodes(node.children)];
    }, [] as TreeNode[]);
  };

  const allNodes = flattenNodes(positionedNodes);

  // Draw branch connections
  const renderBranches = () => {
    const lines: JSX.Element[] = [];

    allNodes.forEach((node) => {
      node.children.forEach((child) => {
        // Curved branch line
        const midY = (node.y + child.y) / 2;
        const path = `M ${node.x} ${node.y} Q ${node.x} ${midY}, ${child.x} ${child.y}`;

        lines.push(
          <path
            key={`${node.branch.id}-${child.branch.id}`}
            d={path}
            stroke="#8FBC8F"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      });
    });

    return lines;
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <svg
        width="100%"
        height="800"
        viewBox="0 0 800 800"
        style={{ maxWidth: '1200px' }}
      >
        {/* Tree trunk */}
        <defs>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#6F5A40', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#8B7355', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6F5A40', stopOpacity: 1 }} />
          </linearGradient>

          <linearGradient id="rootGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#B8962D', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Trunk */}
        <rect
          x="380"
          y="100"
          width="40"
          height="100"
          fill="url(#trunkGradient)"
          rx="5"
        />

        {/* Branch connections */}
        {renderBranches()}

        {/* Root person (at base of trunk) */}
        <g transform="translate(400, 80)">
          <circle
            r="60"
            fill="url(#rootGradient)"
            stroke="#B8962D"
            strokeWidth="3"
          />
          <text
            y="8"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="600"
          >
            {tree.rootPersonName}
          </text>
          {tree.rootPersonBirthDate && tree.rootPersonDeathDate && (
            <text
              y="25"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              opacity="0.9"
            >
              {new Date(tree.rootPersonBirthDate).getFullYear()} -{' '}
              {new Date(tree.rootPersonDeathDate).getFullYear()}
            </text>
          )}
        </g>

        {/* Branch nodes */}
        {allNodes.map((node, index) => (
          <g key={node.branch.id} transform={`translate(${node.x}, ${node.y})`}>
            {/* Branch circle (like a leaf cluster) */}
            <circle
              r="30"
              fill="#8FBC8F"
              stroke="#6FA76F"
              strokeWidth="2"
              opacity="0.9"
              style={{
                animation: `growLeaf 0.6s ease-out ${index * 0.1}s both`,
              }}
            />

            {/* Branch icon */}
            <text
              y="-5"
              textAnchor="middle"
              fontSize="16"
            >
              {node.branch.type === 'organ_donation' ? '❤️' :
               node.branch.type === 'healed_relationship' ? '🤝' :
               node.branch.type === 'foundation' ? '🏛️' :
               node.branch.type === 'charity' ? '🎗️' :
               node.branch.type === 'inspired_act' ? '✨' : '🌟'}
            </text>

            {/* Branch title (below circle) */}
            <text
              y="50"
              textAnchor="middle"
              fill="#36454F"
              fontSize="10"
              fontWeight="600"
              style={{ maxWidth: '100px' }}
            >
              {node.branch.title.length > 20
                ? node.branch.title.substring(0, 20) + '...'
                : node.branch.title}
            </text>
          </g>
        ))}
      </svg>

      <style jsx>{`
        @keyframes growLeaf {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 0.9;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Legend */}
      {branches.length === 0 && (
        <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="h6" gutterBottom>
            No branches yet
          </Typography>
          <Typography variant="body2">
            Add branches to watch this tree grow
          </Typography>
        </Box>
      )}
    </Box>
  );
}
