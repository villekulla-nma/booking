import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaMatcher = window.matchMedia(query);
    const handler = () => setMatches(mediaMatcher.matches);

    setMatches(mediaMatcher.matches);
    mediaMatcher.addEventListener('change', handler);

    return () => mediaMatcher.removeEventListener('change', handler);
  }, [query]);

  return matches;
};
