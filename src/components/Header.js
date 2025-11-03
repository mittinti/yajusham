'use client';

import React from 'react';
import { BookOpen, Home, Menu, X } from 'lucide-react';

export default function Header({ onHomeClick, headerVisible, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <header className={`bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
      headerVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-3 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <button onClick={onHomeClick} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
            <div>
              <h1 className="text-base md:text-xl font-bold">Vedam Tutorials</h1>
            </div>
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav className="hidden md:flex gap-2">
            <button 
              onClick={onHomeClick}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-1.5 text-sm"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-white/20">
            <button 
              onClick={onHomeClick}
              className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
