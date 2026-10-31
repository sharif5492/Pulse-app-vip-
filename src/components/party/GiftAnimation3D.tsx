import React from 'react';
import { Active3DGiftPayload } from '../../types';
import { CinematicGiftPlayer } from '../CinematicGiftPlayer';

interface GiftAnimation3DProps {
  payload: Active3DGiftPayload | null;
  onComplete: () => void;
  onPhaseChange?: (phase: 'box_3d' | 'box_flash' | 'reveal_grid' | 'cinematic_video') => void;
}

export const GiftAnimation3D: React.FC<GiftAnimation3DProps> = ({
  payload,
  onComplete,
  onPhaseChange,
}) => {
  return (
    <CinematicGiftPlayer
      payload={payload}
      onComplete={onComplete}
      onPhaseChange={onPhaseChange}
    />
  );
};
