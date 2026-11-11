import React from 'react';
import type { Bridge } from '../bridge';
import { SacredJourney9Game } from './SacredJourney9Game';
import type { CardData } from '../utils/luckyCardCanvas';

interface FestivalStageProps {
  bridge: Bridge;
  festivalId: number;
  onToast: (msg: string) => void;
  onLaunchFireworks: (bursts?: number) => void;
  onOpenCard?: (card: CardData) => void;
}

export const FestivalStage: React.FC<FestivalStageProps> = ({
  onToast,
  onLaunchFireworks,
  onOpenCard,
}) => {
  return (
    <div
      id="sj9-stage-root"
      className="sacred-journey-container"
      role="tabpanel"
      aria-label="ไหว้พระขอพร มหามงคล 9 วัด"
    >
      <SacredJourney9Game
        onToast={onToast}
        onLaunchFireworks={onLaunchFireworks}
        onOpenCard={onOpenCard}
      />
    </div>
  );
};

