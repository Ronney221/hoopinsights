import React, { useState, useEffect, useRef } from 'react';
import { STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';
import Shotify from './Shotify';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';

const Shared = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [game, setGame] = useState(null);
  const { error: showError } = useNotification();
  const { currentUser } = useAuth();
  const shareIdRef = useRef(window.location.pathname.split('/shared/')[1]);
  const controllerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    controllerRef.current = new AbortController();

    const fetchSharedGame = async () => {
      try {
        const shareId = shareIdRef.current;
        if (!shareId) {
          throw new Error('No share ID provided');
        }

        console.log('Fetching shared game with ID:', shareId);
        const endpoint = STATS_V2_ENDPOINTS.GET_SHARED_GAME(shareId);
        console.log('API Endpoint:', endpoint);

        const headers = await createApiHeaders(currentUser);
        console.log('Request headers:', {
          ...headers,
          Authorization: headers.Authorization ? '[REDACTED]' : undefined
        });

        const response = await fetch(endpoint, { 
          method: 'GET',
          headers: {
            ...headers,
            'Accept': 'application/json'
          },
          signal: controllerRef.current.signal
        });
          
        console.log('Response received:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()])
        });

        if (!isMounted) return;

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!isMounted) return;

        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed data:', data);
        } catch (e) {
          console.error('JSON parse error:', e);
          throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
          throw new Error(data.message || data.error || `Failed to load shared game (${response.status})`);
        }

        if (!data || !data.game) {
          throw new Error('Invalid game data format - missing game object');
        }

        if (!isMounted) return;

        setGame(data.game);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchSharedGame:', err);
        if (isMounted) {
          setError(err.message);
          showError(err.message);
          setLoading(false);
        }
      }
    };

    fetchSharedGame();

    return () => {
      isMounted = false;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [currentUser, showError]);

  console.log('Render state:', { loading, error, hasGame: !!game });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h2 className="text-xl font-medium">Loading shared game...</h2>
          <p className="text-sm opacity-60 mt-2">Fetching game data...</p>
          <p className="text-xs opacity-40 mt-1">From: {STATS_V2_ENDPOINTS.GET_SHARED_GAME(shareIdRef.current)}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="card bg-base-100 shadow-xl max-w-md mx-auto">
          <div className="card-body text-center">
            <div className="text-error text-5xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Game Not Found</h2>
            <p className="mb-6">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </button>
              <button
                className="btn btn-outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return game ? <Shotify sharedGame={game} setCurrentPage={() => {}} /> : null;
};

export default Shared; 