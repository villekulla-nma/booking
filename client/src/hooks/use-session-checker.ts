import { useState, useEffect } from 'react';

import { verifySession } from '../api';

export const useSessionChecker = (): boolean | undefined => {
  const [validSession, setValidSession] = useState<boolean>();

  useEffect(() => {
    verifySession().then((result) => setValidSession(result));
  }, []);

  return validSession;
};
