import { useState, useEffect } from 'react';

export const useMobileHandler = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.cssText = 'position: fixed; width: 100%;';
      return () => document.body.style.cssText = '';
    }
  }, [isOpen, isMobile]);

  return {
    isOpen,
    setIsOpen,
    isMobile
  };
};