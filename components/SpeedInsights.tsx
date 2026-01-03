import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * SpeedInsights component wrapper
 * Integrates Vercel Speed Insights for performance monitoring
 * See: https://vercel.com/docs/speed-insights
 */
const SpeedInsightsComponent: React.FC = () => {
  return <SpeedInsights />;
};

export default SpeedInsightsComponent;
