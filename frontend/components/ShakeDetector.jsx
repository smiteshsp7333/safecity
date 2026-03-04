'use client';
import { useEffect, useRef } from 'react';

export default function ShakeDetector({ onShake }) {
  const lastX = useRef(null);
  const lastY = useRef(null);
  const lastZ = useRef(null);
  const shakeCount = useRef(0);
  const lastShakeTime = useRef(0);

  useEffect(() => {
    const handleMotion = (event) => {
      const { x, y, z } = event.accelerationIncludingGravity;

      if (lastX.current === null) {
        lastX.current = x;
        lastY.current = y;
        lastZ.current = z;
        return;
      }

      const deltaX = Math.abs(x - lastX.current);
      const deltaY = Math.abs(y - lastY.current);
      const deltaZ = Math.abs(z - lastZ.current);

      if (deltaX + deltaY + deltaZ > 30) {
        const now = Date.now();
        if (now - lastShakeTime.current > 500) {
          shakeCount.current += 1;
          lastShakeTime.current = now;

          if (shakeCount.current >= 3) {
            shakeCount.current = 0;
            onShake();
          }
        }
      }

      lastX.current = x;
      lastY.current = y;
      lastZ.current = z;
    };

    if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
      // iOS 13+ requires permission
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permission => {
            if (permission === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [onShake]);

  return null;
}