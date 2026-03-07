import React from 'react';
import {
  Box,
  IconButton,
  ToggleButton,
  Tooltip,
  Divider,
  Typography,
} from '@mui/material';
import AbcIcon from '@mui/icons-material/Abc';
import NumbersIcon from '@mui/icons-material/Numbers';
import LayersIcon from '@mui/icons-material/Layers';

interface SfgToolbarProps {
  symbolicFlag: boolean;
  onToggleSymbolic: () => void;
  showOverlay: boolean;
  onToggleOverlay: () => void;
}

export default function SfgToolbar({
  symbolicFlag,
  onToggleSymbolic,
  showOverlay,
  onToggleOverlay,
}: SfgToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 42,
      }}
    >
      <Tooltip title={symbolicFlag ? 'Switch to numeric view' : 'Switch to symbolic view'}>
        <ToggleButton
          size="small"
          value="symbolic"
          selected={symbolicFlag}
          onChange={onToggleSymbolic}
          sx={{ border: 'none', textTransform: 'none', px: 1, gap: 0.5 }}
        >
          {symbolicFlag ? <AbcIcon fontSize="small" /> : <NumbersIcon fontSize="small" />}
          <Typography variant="caption">{symbolicFlag ? 'Symbolic' : 'Numeric'}</Typography>
        </ToggleButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title={showOverlay ? 'Hide schematic overlay' : 'Show schematic overlay'}>
        <IconButton size="small" onClick={onToggleOverlay}>
          <LayersIcon fontSize="small" color={showOverlay ? 'primary' : 'inherit'} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
