"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface BackgroundVideoProps {
  dayVideoSrc: string;
  nightVideoSrc: string;
  posterImage?: string;
  isActive: boolean;
}

export const BackgroundVideo = ({ dayVideoSrc, nightVideoSrc, posterImage, isActive }: BackgroundVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const [currentSrc, setCurrentSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Track video loading

  useEffect(() => {
    const effectiveTheme = resolvedTheme || theme;
    // console.log(`[BackgroundVideo] Theme changed: ${effectiveTheme}`);
    if (effectiveTheme === 'dark') {
      setCurrentSrc(nightVideoSrc);
    } else {
      setCurrentSrc(dayVideoSrc);
    }
    setIsLoading(true); // Reset loading state when src changes
  }, [theme, resolvedTheme, dayVideoSrc, nightVideoSrc]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleLoadedData = () => setIsLoading(false);
      const handleError = () => {
        setIsLoading(false);
        // Log the full error object and its code for more details
        console.error("Error loading video. Full error object:", videoElement.error);
        console.error("Error loading video. Code:", videoElement.error?.code); 
      };

      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);
      
      if (isActive && currentSrc) {
        if (videoElement.src !== currentSrc) {
          // console.log(`[BackgroundVideo] Setting src: ${currentSrc}`);
          videoElement.src = currentSrc;
          videoElement.load(); 
        }
        videoElement.play().catch(error => {
          // console.warn("[BackgroundVideo] Video play was prevented:", error);
        });
      } else {
        videoElement.pause();
        // To truly unload, you might set src to '' but this can cause flashes if not handled carefully
        // if (videoElement.src) { videoElement.src = ''; } 
      }
      
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [isActive, currentSrc]);

  // Do not render video element until currentSrc is determined to avoid flash of wrong video
  if (!currentSrc) {
    return <div className="absolute inset-0 w-full h-full bg-transparent -z-10" />; // Or a placeholder color
  }

  return (
    <>
      {/* Optional: Show poster or a very simple placeholder while video is loading and currentSrc is set */}
      {isLoading && posterImage && (
         <img src={posterImage} alt="Loading video background" className="fixed inset-0 w-full h-full object-cover -z-10 opacity-70" />
      )}
      <video
        ref={videoRef}
        className={`fixed inset-0 w-full h-full object-cover -z-10 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} opacity-80`}
        loop
        muted
        playsInline
        preload="metadata"
        poster={!isLoading ? undefined : posterImage} // Show poster via video tag only if not handled by img above
        key={currentSrc} // Crucial for re-rendering video element when src changes
        // src={currentSrc} // Setting src directly in useEffect is more robust for dynamic changes
      >
        {/* Source tag can be an alternative, but direct src assignment is often simpler for single sources */}
      </video>
    </>
  );
}; 