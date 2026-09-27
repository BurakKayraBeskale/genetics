'use client';
import { useEffect, useState } from 'react';

// Keep the scene mounted; suspend only rendering when it cannot be seen.
export default function useSceneVisibility(ref) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { rootMargin: '80px' });
    if (ref.current) observer?.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [ref]);
  return visible;
}
