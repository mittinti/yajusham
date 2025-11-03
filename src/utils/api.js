// API utility functions for loading lesson data

export const loadLessonConfig = async (lessonId) => {
  try {
    const response = await fetch(`/lessons/${lessonId}/config.json`);
    if (!response.ok) throw new Error('Config not found');
    return await response.json();
  } catch (error) {
    console.error('Error loading lesson config:', error);
    return null;
  }
};

export const loadMainLessonsList = async () => {
  try {
    const response = await fetch('/lessons/index.json');
    if (!response.ok) throw new Error('Index not found');
    return await response.json();
  } catch (error) {
    console.error('Error loading lessons index:', error);
    return [];
  }
};
