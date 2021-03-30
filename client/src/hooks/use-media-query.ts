import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const mediaMatcher = window.matchMedia(query);
  const [matches, setMatches] = useState<boolean>(mediaMatcher.matches);

  useEffect(() => {
    const handler = () => setMatches(mediaMatcher.matches);

    mediaMatcher.addEventListener('change', handler);

    return () => mediaMatcher.removeEventListener('change', handler);
  }, [query, mediaMatcher]);

  return matches;
};
