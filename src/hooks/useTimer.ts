import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerProps {
  initialTime: number;
  onTimeUp: () => void;
  autoStart?: boolean;
}

export const useTimer = ({ initialTime, onTimeUp, autoStart = false }: UseTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(newTime ?? initialTime);
  }, [initialTime]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, onTimeUp]);

  const progress = ((initialTime - timeRemaining) / initialTime) * 100;

  return {
    timeRemaining,
    isRunning,
    isPaused,
    progress,
    start,
    pause,
    reset,
    stop,
  };
};