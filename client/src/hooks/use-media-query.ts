import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaMatcher = window.matchMedia(query);
    const handler = () => setMatches(mediaMatcher.matches);

    setMatches(mediaMatcher.matches);
    mediaMatcher.addListener(handler);

    return () => mediaMatcher.removeListener(handler);
  }, [query]);

  return matches;
};
