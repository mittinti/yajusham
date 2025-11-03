'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, Volume2, ChevronLeft } from 'lucide-react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import LessonContent from '../components/LessonContent';
import { loadLessonConfig, loadMainLessonsList } from '../utils/api';

export default function VedamTutorials() {
  const [currentView, setCurrentView] = useState('home');
  const [mainLessons, setMainLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedLessonConfig, setSelectedLessonConfig] = useState(null);
  const [selectedAnuvakam, setSelectedAnuvakam] = useState(null);
  const [selectedPanasa, setSelectedPanasa] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    loadMainLessonsList().then(lessons => {
      setMainLessons(lessons);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  const handleAnuvakamSelect = (anuvakam, shouldAutoPlay = false) => {
    setSelectedAnuvakam(anuvakam);
    setSelectedPanasa(null);
    setCurrentView('anuvakam');
    setAutoPlay(shouldAutoPlay);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePanasaSelect = (panasa) => {
    setSelectedPanasa(panasa);
    setCurrentView('panasa');
    setAutoPlay(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateAnuvakam = (direction) => {
    if (!selectedLessonConfig || !selectedAnuvakam) return;
    
    const currentIndex = selectedLessonConfig.anuvakams.findIndex(a => a.id === selectedAnuvakam.id);
    let nextIndex;
    
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % selectedLessonConfig.anuvakams.length;
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = selectedLessonConfig.anuvakams.length - 1;
    }
    
    handleAnuvakamSelect(selectedLessonConfig.anuvakams[nextIndex], true);
  };

  const handleHome = () => {
    setCurrentView('home');
    setSelectedLesson(null);
    setSelectedLessonConfig(null);
    setSelectedAnuvakam(null);
    setSelectedPanasa(null);
    setMobileMenuOpen(false);
  };

  if (loading && currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header 
        onHomeClick={handleHome}
        headerVisible={headerVisible}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="container mx-auto px-3 py-4 md:py-6">
        {currentView !== 'home' && (
          <Breadcrumb 
            selectedLesson={selectedLesson}
            selectedAnuvakam={selectedAnuvakam}
            selectedPanasa={selectedPanasa}
            onHomeClick={handleHome}
            onLessonClick={() => setCurrentView('lesson')}
            onAnuvakamClick={() => setCurrentView('anuvakam')}
          />
        )}

        {/* Home View */}
        {currentView === 'home' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                Welcome to Vedam Tutorials
              </h2>
              <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
                Learn ancient Vedic wisdom through structured lessons
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {mainLessons.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => handleMainLessonSelect(lesson)}
                  className="bg-white rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-transparent hover:border-orange-500 text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{lesson.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{lesson.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lesson View - List of Anuvakams */}
        {currentView === 'lesson' && selectedLessonConfig && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-1">{selectedLessonConfig.title}</h2>
              <p className="text-xs md:text-sm text-gray-600">{selectedLessonConfig.description}</p>
            </div>

            {selectedLessonConfig.anuvakams && selectedLessonConfig.anuvakams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {selectedLessonConfig.anuvakams.map(anuvakam => (
                  <button
                    key={anuvakam.id}
                    onClick={() => handleAnuvakamSelect(anuvakam)}
                    className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-transparent hover:border-orange-500 text-left"
                  >
                    <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">{anuvakam.title}</h3>
                    {anuvakam.panasas && anuvakam.panasas.length > 0 && (
                      <p className="text-xs text-gray-600 mb-2">
                        {anuvakam.panasas.length} Panasas
                      </p>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Audio
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No anuvakams available</p>
              </div>
            )}
          </div>
        )}

        {/* Direct Lesson View */}
        {currentView === 'direct-lesson' && selectedLessonConfig && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-1">{selectedLessonConfig.title}</h2>
              <p className="text-xs md:text-sm text-gray-600">{selectedLessonConfig.description}</p>
            </div>

            <LessonContent 
              lessonId={selectedLessonConfig.id}
              title={selectedLessonConfig.title}
              autoPlay={autoPlay}
            />
          </div>
        )}

        {/* Anuvakam View */}
        {currentView === 'anuvakam' && selectedAnuvakam && (
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{selectedAnuvakam.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateAnuvakam('prev')}
                    className="p-2 bg-white rounded-lg hover:bg-orange-100 transition-colors shadow-md border border-orange-200"
                    title="Previous Anuvakam"
                  >
                    <ChevronLeft className="w-5 h-5 text-orange-600" />
                  </button>
                  <button
                    onClick={() => navigateAnuvakam('next')}
                    className="p-2 bg-white rounded-lg hover:bg-orange-100 transition-colors shadow-md border border-orange-200"
                    title="Next Anuvakam"
                  >
                    <ChevronRight className="w-5 h-5 text-orange-600" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg p-3 mb-3">
                <h3 className="text-sm md:text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  Complete {selectedAnuvakam.title}
                </h3>
                <LessonContent 
                  lessonId={selectedLessonConfig.id}
                  anuvakamId={selectedAnuvakam.id}
                  title={`${selectedAnuvakam.title} - Full`}
                  autoPlay={autoPlay}
                />
              </div>

              {selectedAnuvakam.panasas && selectedAnuvakam.panasas.length > 0 && (
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">Individual Panasas</h3>
              )}
            </div>

            {selectedAnuvakam.panasas && selectedAnuvakam.panasas.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {selectedAnuvakam.panasas.map(panasa => (
                  <button
                    key={panasa.id}
                    onClick={() => handlePanasaSelect(panasa)}
                    className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-transparent hover:border-orange-500 text-left"
                  >
                    <h4 className="text-sm md:text-base font-bold text-gray-800 mb-1">{panasa.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Volume2 className="w-3 h-3" />
                      <span>Practice</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p className="text-xs">No separate panasas. Practice the complete lesson above.</p>
              </div>
            )}
          </div>
        )}

        {/* Panasa View */}
        {currentView === 'panasa' && selectedPanasa && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">{selectedPanasa.title}</h2>
              <p className="text-xs md:text-sm text-gray-600">Practice this section</p>
            </div>

            <LessonContent 
              lessonId={selectedLessonConfig.id}
              anuvakamId={selectedAnuvakam.id}
              panasaId={selectedPanasa.id}
              title={selectedPanasa.title}
              autoPlay={autoPlay}
            />
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-3 py-4 text-center">
          <p className="text-xs md:text-sm">&copy; 2025 Vedam Tutorials. Preserving ancient wisdom for future generations.</p>
        </div>
      </footer>
    </div>
  );
}
