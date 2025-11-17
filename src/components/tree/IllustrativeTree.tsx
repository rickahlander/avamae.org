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

  const positionedNodes = positionNodes(treeNodes, 400, 180, 600);

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

    // Connect first-level branches to top of trunk
    positionedNodes.forEach((node) => {
      const trunkTopY = 250; // Top of trunk
      const trunkCenterX = 400;
      const midY = (trunkTopY + node.y) / 2;

      // Curved branch from trunk to first node
      const path = `M ${trunkCenterX} ${trunkTopY} Q ${trunkCenterX} ${midY}, ${node.x} ${node.y}`;

      lines.push(
        <path
          key={`trunk-${node.branch.id}`}
          d={path}
          stroke="#8FBC8F"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity={0.8}
        />
      );
    });

    // Connect child branches to their parents
    allNodes.forEach((node) => {
      node.children.forEach((child) => {
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
        minHeight: '700px',
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
        height="900"
        viewBox="0 0 800 900"
        style={{ maxWidth: '1200px' }}
      >
        <defs>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#6F5A40', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#8B7355', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6F5A40', stopOpacity: 1 }} />
          </linearGradient>

          <linearGradient id="rootGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#5C4A33', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#8B7355', stopOpacity: 1 }} />
          </linearGradient>

          <linearGradient id="nameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 0.95 }} />
            <stop offset="100%" style={{ stopColor: '#B8962D', stopOpacity: 0.95 }} />
          </linearGradient>
        </defs>

        {/* Roots - spreading underground */}
        <g opacity="0.6">
          {/* Center root */}
          <path
            d="M 400 680 Q 400 720, 400 750"
            stroke="#5C4A33"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left roots */}
          <path
            d="M 395 690 Q 360 710, 330 740"
            stroke="#5C4A33"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 390 700 Q 340 720, 300 750"
            stroke="#5C4A33"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right roots */}
          <path
            d="M 405 690 Q 440 710, 470 740"
            stroke="#5C4A33"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 410 700 Q 460 720, 500 750"
            stroke="#5C4A33"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Ground line */}
        <line
          x1="250"
          y1="680"
          x2="550"
          y2="680"
          stroke="#8B7355"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Trunk - Ava herself */}
        <rect
          x="360"
          y="250"
          width="80"
          height="430"
          fill="url(#trunkGradient)"
          rx="10"
        />

        {/* Name plate on trunk */}
        <g transform="translate(400, 450)">
          <rect
            x="-90"
            y="-40"
            width="180"
            height="80"
            fill="url(#nameGradient)"
            rx="8"
            opacity="0.95"
          />
          <text
            y="-8"
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontWeight="700"
          >
            {tree.rootPersonName}
          </text>
          {tree.rootPersonBirthDate && tree.rootPersonDeathDate && (
            <text
              y="15"
              textAnchor="middle"
              fill="white"
              fontSize="13"
              opacity="0.95"
            >
              {new Date(tree.rootPersonBirthDate).getFullYear()} -{' '}
              {new Date(tree.rootPersonDeathDate).getFullYear()}
            </text>
          )}
        </g>

        {/* Branch connections - start from trunk top */}
        {renderBranches()}

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
