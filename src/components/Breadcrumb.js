'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ 
  selectedLesson, 
  selectedAnuvakam, 
  selectedPanasa, 
  onHomeClick, 
  onLessonClick, 
  onAnuvakamClick 
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 overflow-x-auto pb-2">
      <button onClick={onHomeClick} className="hover:text-orange-600 whitespace-nowrap">
        Home
      </button>
      {selectedLesson && (
        <>
          <ChevronRight className="w-3 h-3" />
          <button onClick={onLessonClick} className="hover:text-orange-600 whitespace-nowrap">
            {selectedLesson.title}
          </button>
        </>
      )}
      {selectedAnuvakam && (
        <>
          <ChevronRight className="w-3 h-3" />
          <button onClick={onAnuvakamClick} className="hover:text-orange-600 whitespace-nowrap">
            {selectedAnuvakam.title}
          </button>
        </>
      )}
      {selectedPanasa && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="text-orange-600 font-medium whitespace-nowrap">{selectedPanasa.title}</span>
        </>
      )}
    </div>
  );
}
