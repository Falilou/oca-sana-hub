// Simple theme management without providers or React hooks
// This file provides utility functions for theme management

export function initializeTheme() {
  if (typeof document === 'undefined') return;
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme as 'light' | 'dark');
}

export function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

export function toggleTheme() {
  if (typeof document === 'undefined') return;
  
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
}

export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// Initialize on import
if (typeof document !== 'undefined') {
  initializeTheme();
}
