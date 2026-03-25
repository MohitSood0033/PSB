import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Storage } from '@ionic/storage';

interface IdleTimeoutProps {
  timeout: number;
}

const IdleTimeout: React.FC<IdleTimeoutProps> = ({ timeout }) => {
  let timeoutId: NodeJS.Timeout;

  const history = useHistory();

  const resetTimeout = () => {
    clearTimeout(timeoutId);
    startTimeout();
  };

  const startTimeout = async () => {
    const storage = new Storage();
    await storage.create();

    timeoutId = setTimeout(async () => {
      await storage.remove('user_details');
      history.replace('/');
    }, timeout);
  };

  const handleUserActivity = () => {
    resetTimeout();
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    startTimeout();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [timeout, history]);

  return null;
};

export default IdleTimeout;
