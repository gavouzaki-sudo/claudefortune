import React from 'react';
import type { Bridge } from '../bridge';
import { SacredJourney9Game } from './SacredJourney9Game';

interface FestivalStageProps {
  bridge: Bridge;
  festivalId: number;
  onToast: (msg: string) => void;
  onLaunchFireworks: (bursts?: number) => void;
}

export const FestivalStage: React.FC<FestivalStageProps> = ({
  onToast,
  onLaunchFireworks,
}) => {
  return (
    <div
      id="tab-festival"
      className="sacred-journey-container"
      role="tabpanel"
      aria-label="ไหว้พระขอพร มหามงคล 9 วัด"
    >
      <SacredJourney9Game
        onToast={onToast}
        onLaunchFireworks={onLaunchFireworks}
      />
    </div>
  );
};
