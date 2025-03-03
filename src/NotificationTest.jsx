import React from 'react';
import { useNotification } from './contexts/NotificationContext';

const NotificationTest = () => {
  const { success, error, warning, info } = useNotification();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Notification System Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Success Notifications</h2>
          <button 
            className="btn btn-success"
            onClick={() => success('This is a success notification')}
          >
            Show Success
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Error Notifications</h2>
          <button 
            className="btn btn-error"
            onClick={() => error('This is an error notification')}
          >
            Show Error
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Warning Notifications</h2>
          <button 
            className="btn btn-warning"
            onClick={() => warning('This is a warning notification')}
          >
            Show Warning
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Info Notifications</h2>
          <button 
            className="btn btn-info"
            onClick={() => info('This is an info notification')}
          >
            Show Info
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Custom Duration</h2>
          <button 
            className="btn btn-primary"
            onClick={() => success('This notification will last for 10 seconds', 10000)}
          >
            Long Duration (10s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest; 