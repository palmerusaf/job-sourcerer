import { useEffect, useState } from 'react';

export interface SidebarState {
  menu: string;
  submenu: string;
}

export function useSidebarState(defaultState: SidebarState): SidebarState {
  const [state, setState] = useState<SidebarState>(() => {
    try {
      const saved = localStorage.getItem('sidebarState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarState', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [state]);

  return state;
}

