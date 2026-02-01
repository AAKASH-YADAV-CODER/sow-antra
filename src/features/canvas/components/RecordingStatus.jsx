import React from 'react';

const RecordingStatus = ({ recording, recordingTimeElapsed }) => {
  if (!recording) return null;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };
  
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 
                    md:top-4 md:right-4 
                    sm:top-2 sm:right-2 sm:px-2 sm:py-1 sm:text-sm">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse sm:w-2 sm:h-2 sm:mr-1"></div>
        <span className="font-medium">Recording... {formatTime(recordingTimeElapsed)}</span>
      </div>
    </div>
  );
};

export default RecordingStatus;
