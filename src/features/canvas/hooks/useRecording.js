import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing canvas recording
 * @param {HTMLCanvasElement} canvasRef - Reference to the canvas element
 * @returns {object} - Recording state and control functions
 */
const useRecording = (canvasRef) => {
  const [recording, setRecording] = useState(false);
  const [recordingTimeElapsed, setRecordingTimeElapsed] = useState(0);
  const [videoFormat, setVideoFormat] = useState('webm');
  const [videoQuality, setVideoQuality] = useState('high');
  const [recordingDuration, setRecordingDuration] = useState(10);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const recordingStartTimeRef = useRef(null);

  // Get MIME type based on format and quality
  const getMimeType = useCallback(() => {
    const qualityMap = {
      low: 2500000,    // 2.5 Mbps
      medium: 5000000, // 5 Mbps
      high: 8000000,   // 8 Mbps
    };

    const videoBitrate = qualityMap[videoQuality] || qualityMap.high;

    switch (videoFormat) {
      case 'webm':
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          return { mimeType: 'video/webm;codecs=vp9', videoBitrate };
        }
        return { mimeType: 'video/webm;codecs=vp8', videoBitrate };
      case 'mp4':
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
          return { mimeType: 'video/mp4;codecs=h264', videoBitrate };
        }
        if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
          return { mimeType: 'video/webm;codecs=h264', videoBitrate };
        }
        // Fallback to webm if mp4 not supported
        return { mimeType: 'video/webm;codecs=vp9', videoBitrate };
      case 'gif':
        // Note: MediaRecorder doesn't natively support GIF
        // This would require post-processing with a library like gif.js
        return { mimeType: 'video/webm;codecs=vp9', videoBitrate };
      default:
        return { mimeType: 'video/webm;codecs=vp9', videoBitrate };
    }
  }, [videoFormat, videoQuality]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!canvasRef || !canvasRef.current) {
      console.error('Canvas reference not available');
      return;
    }

    try {
      // Get canvas stream
      const stream = canvasRef.current.captureStream(30); // 30 FPS

      // Get MIME type and bitrate
      const { mimeType, videoBitrate } = getMimeType();

      // Create MediaRecorder
      const options = {
        mimeType,
        videoBitsPerSecond: videoBitrate,
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: mimeType,
        });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${Date.now()}.${videoFormat === 'mp4' ? 'mp4' : 'webm'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset
        recordedChunksRef.current = [];
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setRecording(true);
      recordingStartTimeRef.current = Date.now();
      setRecordingTimeElapsed(0);

      // Update elapsed time
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingTimeElapsed(elapsed);

        // Auto-stop at max duration
        if (elapsed >= recordingDuration) {
          stopRecording();
        }
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check browser compatibility.');
    }
  }, [canvasRef, getMimeType, videoFormat, recordingDuration]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setRecordingTimeElapsed(0);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [recording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [recording]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      recordingStartTimeRef.current = Date.now() - recordingTimeElapsed * 1000;
      
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingTimeElapsed(elapsed);

        if (elapsed >= recordingDuration) {
          stopRecording();
        }
      }, 100);
    }
  }, [recording, recordingTimeElapsed, recordingDuration, stopRecording]);

  // Update video format
  const updateVideoFormat = useCallback((format) => {
    if (!recording) {
      setVideoFormat(format);
    }
  }, [recording]);

  // Update video quality
  const updateVideoQuality = useCallback((quality) => {
    if (!recording) {
      setVideoQuality(quality);
    }
  }, [recording]);

  // Update recording duration
  const updateRecordingDuration = useCallback((duration) => {
    if (!recording) {
      setRecordingDuration(duration);
    }
  }, [recording]);

  // Check if recording is supported
  const isRecordingSupported = useCallback(() => {
    return !!(window.MediaRecorder && canvasRef?.current?.captureStream);
  }, [canvasRef]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (recording) {
      stopRecording();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, [recording, stopRecording]);

  return {
    // Recording state
    recording,
    recordingTimeElapsed,
    videoFormat,
    videoQuality,
    recordingDuration,

    // Recording controls
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,

    // Settings
    updateVideoFormat,
    updateVideoQuality,
    updateRecordingDuration,

    // Utilities
    isRecordingSupported,
    cleanup,
  };
};

export default useRecording;
