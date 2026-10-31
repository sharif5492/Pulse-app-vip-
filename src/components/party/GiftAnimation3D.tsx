import React from 'react';
import { Active3DGiftPayload } from '../../types';
import { CinematicGiftPlayer, CinematicGiftPlayerProps } from '../CinematicGiftPlayer';

export const GiftAnimation3D: React.FC<CinematicGiftPlayerProps> = ({
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
