'use client';

import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function TestLogin() {
  const { login } = useAuth();
  const [status, setStatus] = useState('');

  useEffect(() => {
    const testLogin = async () => {
      try {
        setStatus('Testing login...');
        const result = await login('dsr@tnpolice.gov.in', 'dsr123');
        setStatus(`Login result: ${JSON.stringify(result)}`);
      } catch (error) {
        setStatus(`Login error: ${error.message}`);
      }
    };
    testLogin();
  }, [login]);

  return (
    <div className="p-4">
      <h1>Login Test</h1>
      <pre>{status}</pre>
    </div>
  );
} 