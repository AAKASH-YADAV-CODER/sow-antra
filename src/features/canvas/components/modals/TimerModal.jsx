import React from 'react';
import { X, Play, Pause, RotateCcw, Music, Volume2, VolumeX } from 'lucide-react';

const TimerModal = ({
    isOpen,
    onClose,
    time,
    setTime,
    isRunning,
    setIsRunning,
    selectedMusicId,
    onSelectMusic,
    musicTracks,
    isMusicMuted,
    setIsMusicMuted
}) => {
    if (!isOpen) return null;

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={18} className="text-purple-600" />
                        Design Timer
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row">
                    {/* Timer Panel */}
                    <div className="flex-1 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                        <div className="text-5xl font-mono font-bold text-gray-800 mb-8 tracking-tighter">
                            {formatTime(time)}
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                className={`flex items-center justify-center w-16 h-16 rounded-full transition-all ${isRunning
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                                    }`}
                            >
                                {isRunning ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                            </button>

                            <button
                                onClick={() => { setTime(0); setIsRunning(false); }}
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                                title="Reset"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>

                        <p className="mt-6 text-xs text-gray-400 font-medium italic">
                            {isRunning ? 'Enjoy the creative flow...' : 'Take a deep breath and start'}
                        </p>
                    </div>

                    {/* Music Panel */}
                    <div className="flex-1 p-6 bg-white min-w-[200px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Music size={16} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Focus Music</span>
                            </div>
                            {selectedMusicId && (
                                <button
                                    onClick={() => setIsMusicMuted(!isMusicMuted)}
                                    className={`p-1.5 rounded-lg transition-colors ${isMusicMuted ? 'text-red-500 bg-red-50' : 'text-purple-600 bg-purple-50 hover:bg-purple-100'}`}
                                    title={isMusicMuted ? "Unmute" : "Mute"}
                                >
                                    {isMusicMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                            {musicTracks.map(track => (
                                <button
                                    key={track.id}
                                    onClick={() => onSelectMusic(track.id)}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${selectedMusicId === track.id
                                        ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100'
                                        : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{track.name}</span>
                                    {selectedMusicId === track.id && isRunning && (
                                        <div className="flex gap-0.5">
                                            <div className="w-0.5 h-3 bg-purple-400 animate-pulse" />
                                            <div className="w-0.5 h-3 bg-purple-400 animate-pulse delay-75" />
                                            <div className="w-0.5 h-3 bg-purple-400 animate-pulse delay-150" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => onSelectMusic(null)}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${!selectedMusicId
                                    ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-200'
                                    : 'hover:bg-gray-50 text-gray-400'
                                    }`}
                            >
                                <span className="text-sm font-medium italic">None</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Antigravity Workspace Experience</p>
                </div>
            </div>
        </div>
    );
};

const Clock = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export default TimerModal;
