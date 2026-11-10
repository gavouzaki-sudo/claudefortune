import React from 'react';
import { clamp } from '../utils/formatters';

interface ScoreItem {
  key: string;
  label: string;
  score: number;
}

interface ScoreBarsProps {
  scores: ScoreItem[];
  maxScore?: number;
}

export const ScoreBars: React.FC<ScoreBarsProps> = ({ scores, maxScore = 5 }) => {
  return (
    <div className="bars">
      {scores.map(({ key, label, score }) => {
        const percentage = clamp((score / maxScore) * 100, 0, 100);
        return (
          <div key={key} className="bar">
            <span>{label}</span>
            <div className="track">
              <div className="fill" style={{ width: `${percentage}%` }} />
            </div>
            <b>{score}</b>
          </div>
        );
      })}
    </div>
  );
};
