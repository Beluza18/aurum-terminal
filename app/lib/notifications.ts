import { toast } from 'sonner';

export const showVolatilityAlert = (zone: string) => {
  if (zone === 'EXTREME_CHOP') {
    toast.error('️ EXTREME VOLATILITY DETECTED', {
      description: 'Market conditions are dangerous. Consider reducing position size or stepping away.',
      duration: 10000,
    });
  } else if (zone === 'DEAD_ZONE') {
    toast.warning('⚠️ LOW VOLATILITY', {
      description: 'Market is ranging tightly. Breakouts may be fake. Wait for confirmation.',
      duration: 5000,
    });
  } else if (zone === 'OPTIMAL') {
    toast.success('✓ OPTIMAL TRADING CONDITIONS', {
      description: 'Volatility is within normal ranges. Good conditions for trading.',
      duration: 3000,
    });
  }
};

export const showMacroWarning = (event: string, timeUntil: string) => {
  toast.warning(` HIGH IMPACT EVENT: ${event}`, {
    description: `Releasing in ${timeUntil}. Historical data shows 300% volatility spike. Reduce position size.`,
    duration: 15000,
  });
};

export const showRiskCheckWarning = (message: string) => {
  toast.error('⚠️ RISK CHECK FAILED', {
    description: message,
    duration: 8000,
  });
};