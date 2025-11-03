'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Repeat, Repeat1, Volume2, Gauge } from 'lucide-react';

export default function AudioPlayer({ audioSrc, title, autoPlay = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState('none');
  const [playCount, setPlayCount] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (loopMode === 'infinite') {
        audio.currentTime = 0;
        audio.play();
      } else if (loopMode === '5times') {
        if (playCount < 4) {
          setPlayCount(prev => prev + 1);
          audio.currentTime = 0;
          audio.play();
        } else {
          setIsPlaying(false);
          setPlayCount(0);
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [loopMode, playCount]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log('Autoplay prevented:', err));
    }
  }, [autoPlay, audioSrc]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (loopMode === '5times' && playCount === 0) {
        setPlayCount(1);
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    audioRef.current.currentTime = 0;
    if (loopMode === '5times') {
      setPlayCount(1);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const cycleLoopMode = () => {
    const modes = ['none', 'infinite', '5times'];
    const currentIndex = modes.indexOf(loopMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setLoopMode(nextMode);
    setPlayCount(0);
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLoopIcon = () => {
    if (loopMode === 'infinite') return <Repeat className="w-4 h-4" />;
    if (loopMode === '5times') return <Repeat1 className="w-4 h-4" />;
    return <Repeat className="w-4 h-4 opacity-40" />;
  };

  const getSpeedColor = () => {
    if (playbackRate < 1) return 'text-blue-600';
    if (playbackRate > 1) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 shadow-md border border-orange-200">
      <audio ref={audioRef} src={audioSrc} />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Volume2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div 
        className="w-full h-1.5 bg-orange-200 rounded-full cursor-pointer mb-3 overflow-hidden"
        onClick={handleSeek}
      >
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-100"
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={handleRestart}
            className="p-1.5 bg-white rounded-lg hover:bg-orange-100 transition-colors shadow-sm"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4 text-orange-600" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={cycleLoopMode}
            className={`p-1.5 rounded-lg transition-all shadow-sm relative ${
              loopMode !== 'none' 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-white text-orange-600 hover:bg-orange-100'
            }`}
            title={loopMode === 'infinite' ? 'Loop: ∞' : loopMode === '5times' ? `Loop: 5× (${playCount}/5)` : 'Loop: Off'}
          >
            {getLoopIcon()}
            {loopMode === '5times' && playCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                {playCount}
              </span>
            )}
          </button>

          <button
            onClick={cycleSpeed}
            className="p-1.5 bg-white rounded-lg hover:bg-orange-100 transition-colors shadow-sm flex items-center gap-1"
            title={`Speed: ${playbackRate}×`}
          >
            <Gauge className={`w-4 h-4 ${getSpeedColor()}`} />
            <span className={`text-xs font-bold ${getSpeedColor()}`}>{playbackRate}×</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs">
          {loopMode === '5times' && (
            <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full font-medium">
              {playCount}/5
            </span>
          )}
          {loopMode === 'infinite' && (
            <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full font-medium">
              ∞
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
