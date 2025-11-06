import { useState, useCallback, useRef } from 'react';
import { getSortedElementsForExport, drawElementToCanvas as drawElementToCanvasUtil } from '../../../utils/canvasExport';

/**
 * Custom hook for handling canvas recording functionality
 * Manages video recording, image preloading, and browser compatibility checks
 * 
 * @param {Object} params - Hook parameters
 * @param {Function} params.getCurrentPageElements - Get current page elements
 * @param {Object} params.canvasSize - Canvas dimensions {width, height}
 * @param {number} params.recordingDuration - Recording duration in seconds
 * @param {string} params.videoQuality - Quality setting ('low', 'medium', 'high')
 * @param {string} params.videoFormat - Format ('webm', 'mp4', 'gif')
 * @param {Object} params.imageEffects - Image effects configuration
 * @returns {Object} Recording state and handlers
 */
export const useRecording = ({
  getCurrentPageElements,
  canvasSize,
  recordingDuration,
  videoQuality,
  videoFormat,
  imageEffects
}) => {
  // Recording state
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingTimeElapsed, setRecordingTimeElapsed] = useState(0);
  const recordingIntervalRef = useRef(null);

  // Preload images for recording
  const preloadImages = useCallback(() => {
    const currentElements = getCurrentPageElements();
    const imageElements = currentElements.filter(el => el.type === 'image');
    
    return Promise.all(
      imageElements.map(element => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = element.src;
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );
  }, [getCurrentPageElements]);

  // Wrapper for drawElementToCanvas from canvasExport utility with imageEffects
  const drawElementToCanvas = useCallback((ctx, element, time, elementIndex) => {
    return drawElementToCanvasUtil(ctx, element, time, elementIndex, imageEffects);
  }, [imageEffects]);

  // Browser compatibility check
  const checkRecordingCompatibility = useCallback(() => {
    if (typeof MediaRecorder === 'undefined') {
      alert('Your browser does not support video recording. Please try Chrome, Firefox, or Edge.');
      return false;
    }
    
    const canvas = document.createElement('canvas');
    if (typeof canvas.captureStream !== 'function') {
      alert('Your browser does not support canvas recording. Please try Chrome or Firefox.');
      return false;
    }
    
    return true;
  }, []);

  // Enhanced startRecording function with MP4 support
  const startRecording = useCallback(async () => {
    try {
      if (recording) {
        console.log('Recording already in progress');
        return;
      }

      if (!checkRecordingCompatibility()) return;
      
      await preloadImages();
      
      setRecording(true);
      setRecordingStartTime(Date.now());
      setRecordingTimeElapsed(0);
      
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      let stream;
      try {
        stream = canvas.captureStream(30);
      } catch (error) {
        console.error('Error capturing stream:', error);
        alert('Your browser does not support canvas recording. Please try Chrome or Firefox.');
        setRecording(false);
        setRecordingStartTime(null);
        return;
      }
      
      // Enhanced MIME type detection with MP4 support
      const getSupportedMimeType = () => {
        const mimeTypes = [
          // MP4/H.264 options (try these first if MP4 is selected)
          'video/mp4;codecs=h264',
          'video/mp4;codecs=avc1.42E01E',
          'video/mp4;codecs=avc1.42801E',
          
          // WebM options (fallback)
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm'
        ];
        
        // If user selected MP4, prioritize MP4 codecs
        const preferredTypes = videoFormat === 'mp4' 
          ? mimeTypes.filter(type => type.includes('mp4'))
          : mimeTypes.filter(type => type.includes('webm'));
        
        // Add fallback types
        const allTypes = [...preferredTypes, ...mimeTypes];
        
        for (let mimeType of allTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            console.log('Supported MIME type:', mimeType);
            return mimeType;
          }
        }
        
        return null;
      };
      
      const mimeType = getSupportedMimeType();
      
      if (!mimeType) {
        alert('Your browser does not support any video recording formats. Please try Chrome.');
        setRecording(false);
        setRecordingStartTime(null);
        return;
      }
      
      const options = { mimeType };
      
      // Set bitrate based on quality
      switch(videoQuality) {
        case 'low':
          options.videoBitsPerSecond = 1000000;
          break;
        case 'medium':
          options.videoBitsPerSecond = 2500000;
          break;
        case 'high':
        default:
          options.videoBitsPerSecond = 5000000;
          break;
      }
      
      const recorder = new MediaRecorder(stream, options);
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        try {
          if (chunks.length === 0) {
            console.warn('No data recorded');
            return;
          }

          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          
          // Determine correct file extension
          let extension = 'webm';
          if (mimeType.includes('mp4')) {
            extension = 'mp4';
          } else if (videoFormat === 'gif') {
            extension = 'gif';
          }
          
          a.download = `sowntra-animation-${new Date().getTime()}.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('Recording saved successfully');
        } catch (error) {
          console.error('Error creating download:', error);
          alert('Error creating video file. Please try again.');
        } finally {
          setRecording(false);
          setRecordingStartTime(null);
          setRecordingTimeElapsed(0);
          setMediaRecorder(null);
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
        }
      };
      
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        alert('Error during recording: ' + event.error.message);
        setRecording(false);
        setRecordingStartTime(null);
        setRecordingTimeElapsed(0);
        setMediaRecorder(null);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      
      // Elapsed time counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimeElapsed(prev => prev + 1);
      }, 1000);
      
      let startTime = null;
      const frameDuration = 1000 / 30;
      let lastFrameTime = 0;
      // eslint-disable-next-line no-unused-vars
      let animationId;
      
      const drawAnimationFrame = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (recorder.state === 'recording') {
          if (timestamp - lastFrameTime >= frameDuration) {
            lastFrameTime = timestamp;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Use proper zIndex sorting for recording
            const sortedElements = getSortedElementsForExport(getCurrentPageElements());
            
            sortedElements.forEach((element, index) => {
              // Use recordingDuration for animation loop timing
              const animationProgress = (elapsed / 1000) % recordingDuration;
              drawElementToCanvas(ctx, element, animationProgress, index);
            });
          }
          
          animationId = requestAnimationFrame(drawAnimationFrame);
        }
      };
      
      animationId = requestAnimationFrame(drawAnimationFrame);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error starting recording: ' + error.message);
      setRecording(false);
      setRecordingStartTime(null);
      setRecordingTimeElapsed(0);
      setMediaRecorder(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [recording, canvasSize, drawElementToCanvas, recordingDuration, videoQuality, checkRecordingCompatibility, preloadImages, videoFormat, getCurrentPageElements]);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log('Stop recording called, state:', mediaRecorder?.state);
    
    if (!recording) {
      console.log('Not currently recording');
      return;
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Stopping media recorder');
      mediaRecorder.stop();
      // State cleanup is handled in recorder.onstop callback
    } else {
      // Cleanup if recorder is in invalid state
      setRecording(false);
      setRecordingStartTime(null);
      setRecordingTimeElapsed(0);
      setMediaRecorder(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [mediaRecorder, recording]);

  return {
    // State
    recording,
    mediaRecorder,
    recordingStartTime,
    recordingTimeElapsed,
    
    // Handlers
    startRecording,
    stopRecording,
    preloadImages,
    checkRecordingCompatibility,
    drawElementToCanvas
  };
};
