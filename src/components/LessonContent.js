'use client';

import React from 'react';
import AudioPlayer from './AudioPlayer';

export default function LessonContent({ lessonId, anuvakamId, panasaId, title, autoPlay }) {
  const getImagePath = () => {
    if (panasaId && anuvakamId) {
      return `/lessons/${lessonId}/${anuvakamId}/${panasaId}/image.jpg`;
    }
    if (anuvakamId) {
      return `/lessons/${lessonId}/${anuvakamId}/image.jpg`;
    }
    return `/lessons/${lessonId}/image.jpg`;
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
    <div className="space-y-3">
      <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
        <img 
          src={getImagePath()} 
          alt={title}
          className="w-full h-auto"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f0f0f0" width="800" height="400"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24"%3ELesson Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      
      <AudioPlayer audioSrc={getAudioPath()} title={title} autoPlay={autoPlay} />
    </div>
  );
}
