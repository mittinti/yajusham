'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Repeat, Repeat1, ChevronRight, BookOpen, Volume2, Home, Menu, X } from 'lucide-react';

// Load lesson configuration from JSON
const loadLessonConfig = async (lessonId) => {
  try {
    const response = await fetch(`/lessons/${lessonId}/config.json`);
    if (!response.ok) throw new Error('Config not found');
    return await response.json();
  } catch (error) {
    console.error('Error loading lesson config:', error);
    return null;
  }
};

// Load list of available main lessons
const loadMainLessonsList = async () => {
  try {
    const response = await fetch('/lessons/index.json');
    if (!response.ok) throw new Error('Index not found');
    return await response.json();
  } catch (error) {
    console.error('Error loading lessons index:', error);
    return [];
  }
};

// Audio Player Component
const AudioPlayer = ({ audioSrc, title }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState('none');
  const [playCount, setPlayCount] = useState(0);

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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLoopIcon = () => {
    if (loopMode === 'infinite') return <Repeat className="w-5 h-5" />;
    if (loopMode === '5times') return <Repeat1 className="w-5 h-5" />;
    return <Repeat className="w-5 h-5 opacity-40" />;
  };

  return (
    <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 md:p-6 shadow-lg border border-orange-200">
      <audio ref={audioRef} src={audioSrc} />
      
      <div className="flex items-center gap-3 mb-4">
        <Volume2 className="w-5 h-5 text-orange-600" />
        <span className="text-sm md:text-base font-medium text-gray-700 truncate">{title}</span>
      </div>

      <div 
        className="w-full h-2 bg-orange-200 rounded-full cursor-pointer mb-3 overflow-hidden"
        onClick={handleSeek}
      >
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-100"
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
      </div>

      <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2 text-xs md:text-sm">
        <span className="text-gray-600">Loop Mode:</span>
        <span className={`px-3 py-1 rounded-full font-medium ${
          loopMode === 'infinite' ? 'bg-orange-500 text-white' :
          loopMode === '5times' ? 'bg-amber-500 text-white' :
          'bg-gray-200 text-gray-600'
        }`}>
          {loopMode === 'infinite' ? '∞ Infinite' : loopMode === '5times' ? `5× Times (${playCount}/5)` : 'Off'}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 md:gap-4">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleRestart}
            className="p-2 md:p-3 bg-white rounded-full hover:bg-orange-100 transition-colors shadow-md"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          </button>
          <span className="text-xs text-gray-600 hidden md:block">Restart</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={togglePlay}
            className="p-4 md:p-5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 md:w-8 md:h-8 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-1" />
            )}
          </button>
          <span className="text-xs text-gray-600 hidden md:block">{isPlaying ? 'Pause' : 'Play'}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={cycleLoopMode}
            className={`p-2 md:p-3 rounded-full transition-all shadow-md relative ${
              loopMode !== 'none' 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-white text-orange-600 hover:bg-orange-100'
            }`}
            title={loopMode === 'infinite' ? 'Loop: Infinite' : loopMode === '5times' ? 'Loop: 5 Times' : 'Loop: Off'}
          >
            {getLoopIcon()}
            {loopMode === '5times' && playCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                {playCount}
              </span>
            )}
          </button>
          <span className="text-xs text-gray-600 hidden md:block">Loop</span>
        </div>
      </div>
    </div>
  );
};

// Lesson Content Component
const LessonContent = ({ lessonId, anuvakamId, panasaId, title }) => {
  const getImagePath = () => {
    if (panasaId && anuvakamId) {
      return `/lessons/${lessonId}/${anuvakamId}/${panasaId}/image.png`;
    }
    if (anuvakamId) {
      return `/lessons/${lessonId}/${anuvakamId}/image.png`;
    }
    return `/lessons/${lessonId}/image.png`;
  };

  const getAudioPath = () => {
    if (panasaId && anuvakamId) {
      return `/lessons/${lessonId}/${anuvakamId}/${panasaId}/audio.mp3`;
    }
    if (anuvakamId) {
      return `/lessons/${lessonId}/${anuvakamId}/audio.mp3`;
    }
    return `/lessons/${lessonId}/audio.mp3`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <img 
          src={getImagePath()} 
          alt={title}
          className="w-full h-auto"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f0f0f0" width="800" height="400"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24"%3ELesson Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      
      <AudioPlayer audioSrc={getAudioPath()} title={title} />
    </div>
  );
};

// Main App Component
export default function VedamTutorials() {
  const [currentView, setCurrentView] = useState('home');
  const [mainLessons, setMainLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedLessonConfig, setSelectedLessonConfig] = useState(null);
  const [selectedAnuvakam, setSelectedAnuvakam] = useState(null);
  const [selectedPanasa, setSelectedPanasa] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMainLessonsList().then(lessons => {
      setMainLessons(lessons);
      setLoading(false);
    });
  }, []);

  const handleMainLessonSelect = async (lesson) => {
    setLoading(true);
    const config = await loadLessonConfig(lesson.id);
    setSelectedLesson(lesson);
    setSelectedLessonConfig(config);
    setSelectedAnuvakam(null);
    setSelectedPanasa(null);
    
    if (!config.anuvakams || config.anuvakams.length === 0) {
      setCurrentView('direct-lesson');
    } else {
      setCurrentView('lesson');
    }
    
    setMobileMenuOpen(false);
    setLoading(false);
  };

  const handleAnuvakamSelect = (anuvakam) => {
    setSelectedAnuvakam(anuvakam);
    setSelectedPanasa(null);
    setCurrentView('anuvakam');
  };

  const handlePanasaSelect = (panasa) => {
    setSelectedPanasa(panasa);
    setCurrentView('panasa');
  };

  const handleBack = () => {
    if (currentView === 'panasa') {
      setCurrentView('anuvakam');
      setSelectedPanasa(null);
    } else if (currentView === 'anuvakam') {
      setCurrentView('lesson');
      setSelectedAnuvakam(null);
    } else if (currentView === 'lesson' || currentView === 'direct-lesson') {
      setCurrentView('home');
      setSelectedLesson(null);
      setSelectedLessonConfig(null);
    }
  };

  const handleHome = () => {
    setCurrentView('home');
    setSelectedLesson(null);
    setSelectedLessonConfig(null);
    setSelectedAnuvakam(null);
    setSelectedPanasa(null);
    setMobileMenuOpen(false);
  };

  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 overflow-x-auto pb-2">
      <button onClick={handleHome} className="hover:text-orange-600 whitespace-nowrap">
        Home
      </button>
      {selectedLesson && (
        <>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => setCurrentView('lesson')} className="hover:text-orange-600 whitespace-nowrap">
            {selectedLesson.title}
          </button>
        </>
      )}
      {selectedAnuvakam && (
        <>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => setCurrentView('anuvakam')} className="hover:text-orange-600 whitespace-nowrap">
            {selectedAnuvakam.title}
          </button>
        </>
      )}
      {selectedPanasa && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-orange-600 font-medium whitespace-nowrap">{selectedPanasa.title}</span>
        </>
      )}
    </div>
  );

  if (loading && currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <button onClick={handleHome} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold">Vedam Tutorials</h1>
                <p className="text-xs md:text-sm text-orange-100 hidden md:block">Traditional Learning Platform</p>
              </div>
            </button>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden md:flex gap-4">
              <button 
                onClick={handleHome}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </nav>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-white/20">
              <button 
                onClick={handleHome}
                className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12">
        {currentView !== 'home' && <Breadcrumb />}

        {currentView === 'home' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
                Welcome to Vedam Tutorials
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Learn ancient Vedic wisdom through structured lessons, anuvakams, and panasas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainLessons.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => handleMainLessonSelect(lesson)}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-orange-500 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{lesson.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentView === 'lesson' && selectedLessonConfig && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{selectedLessonConfig.title}</h2>
              <p className="text-gray-600">{selectedLessonConfig.description}</p>
            </div>

            {selectedLessonConfig.anuvakams && selectedLessonConfig.anuvakams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedLessonConfig.anuvakams.map(anuvakam => (
                  <button
                    key={anuvakam.id}
                    onClick={() => handleAnuvakamSelect(anuvakam)}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-orange-500 text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">{anuvakam.title}</h3>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                    {anuvakam.panasas && anuvakam.panasas.length > 0 && (
                      <p className="text-sm text-gray-600 mb-3">
                        {anuvakam.panasas.length} Panasas
                      </p>
                    )}
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Full Lesson
                      </span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Audio + Text
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No anuvakams available for this lesson</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'direct-lesson' && selectedLessonConfig && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{selectedLessonConfig.title}</h2>
              <p className="text-gray-600">{selectedLessonConfig.description}</p>
            </div>

            <LessonContent 
              lessonId={selectedLessonConfig.id}
              title={selectedLessonConfig.title}
            />
          </div>
        )}

        {currentView === 'anuvakam' && selectedAnuvakam && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{selectedAnuvakam.title}</h2>
              
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-4 md:p-6 mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                  Complete {selectedAnuvakam.title}
                </h3>
                <LessonContent 
                  lessonId={selectedLessonConfig.id}
                  anuvakamId={selectedAnuvakam.id}
                  title={`${selectedAnuvakam.title} - Full`}
                />
              </div>

              {selectedAnuvakam.panasas && selectedAnuvakam.panasas.length > 0 && (
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Individual Panasas</h3>
              )}
            </div>

            {selectedAnuvakam.panasas && selectedAnuvakam.panasas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedAnuvakam.panasas.map(panasa => (
                  <button
                    key={panasa.id}
                    onClick={() => handlePanasaSelect(panasa)}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-orange-500 text-left"
                  >
                    <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-3">{panasa.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Volume2 className="w-4 h-4" />
                      <span>Practice Section</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">This anuvakam has no separate panasas. Practice the complete lesson above.</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'panasa' && selectedPanasa && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{selectedPanasa.title}</h2>
              <p className="text-gray-600">Practice this section</p>
            </div>

            <LessonContent 
              lessonId={selectedLessonConfig.id}
              anuvakamId={selectedAnuvakam.id}
              panasaId={selectedPanasa.id}
              title={selectedPanasa.title}
            />
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm md:text-base">&copy; 2025 Vedam Tutorials. Preserving ancient wisdom for future generations.</p>
        </div>
      </footer>
    </div>
  );
}