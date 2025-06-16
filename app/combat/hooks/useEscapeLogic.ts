import { useState } from 'react';

export const useEscapeLogic = () => {
  const [canEscape, setCanEscape] = useState(true);
  const [lastEscapeAttempt, setLastEscapeAttempt] = useState(0);
  const [hasEscaped, setHasEscaped] = useState(false);

  const attemptEscape = (onSuccess: () => void, onFailure: () => void) => {
    if (!canEscape) return;

    const escapeChance = Math.random();
    setLastEscapeAttempt(Date.now());

    if (escapeChance <= 0.90) {
      setHasEscaped(true);
      onSuccess();
    } else {
      onFailure();
      setCanEscape(false);
      setTimeout(() => setCanEscape(true), 6000);
    }
  };

  const getEscapeCooldownRemaining = (): number => {
    if (canEscape) return 0;
    return Math.ceil((6000 - (Date.now() - lastEscapeAttempt)) / 1000);
  };

  return {
    canEscape,
    hasEscaped,
    attemptEscape,
    getEscapeCooldownRemaining,
  };
}; 