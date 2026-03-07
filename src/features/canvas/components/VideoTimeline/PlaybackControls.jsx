import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';

const PlaybackControls = ({
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    onSeek
}) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <button onClick={() => onSeek(0)} className="text-gray-400 hover:text-white p-1">
                    <SkipBack size={16} fill="currentColor" />
                </button>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" ml={2} />}
                </button>
                <button onClick={() => onSeek(duration)} className="text-gray-400 hover:text-white p-1">
                    <SkipForward size={16} fill="currentColor" />
                </button>
                <button className="text-gray-400 hover:text-white p-1">
                    <Repeat size={14} />
                </button>
            </div>

            <div className="text-xs font-mono text-gray-300">
                <span className="text-white font-bold">{formatTime(currentTime)}</span>
                <span className="mx-1 text-gray-600">/</span>
                <span className="text-gray-500">{formatTime(duration)}</span>
            </div>
        </div>
    );
};

export default PlaybackControls;
