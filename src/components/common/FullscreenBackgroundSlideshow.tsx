import React, { useState, useEffect, useCallback } from 'react';
import { SLIDESHOW_IMAGES } from '../../config/slideshowConfig';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  MapPin,
  Sparkles,
  Maximize2,
} from 'lucide-react';

interface FullscreenBackgroundSlideshowProps {
  /** If true, shows the floating indicator controls at bottom. Defaults to true. */
  showControls?: boolean;
  /** Callback when user changes slide */
  onSlideChange?: (index: number) => void;
  /** Custom overlay opacity class if needed */
  overlayClassName?: string;
}

export const FullscreenBackgroundSlideshow: React.FC<
  FullscreenBackgroundSlideshowProps
> = ({ showControls = true, onSlideChange, overlayClassName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  const total = SLIDESHOW_IMAGES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % total;
      if (onSlideChange) onSlideChange(next);
      window.dispatchEvent(new CustomEvent('poastay-slide-changed', { detail: next }));
      return next;
    });
  }, [total, onSlideChange]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev - 1 + total) % total;
      if (onSlideChange) onSlideChange(next);
      window.dispatchEvent(new CustomEvent('poastay-slide-changed', { detail: next }));
      return next;
    });
  }, [total, onSlideChange]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (onSlideChange) onSlideChange(index);
    window.dispatchEvent(new CustomEvent('poastay-slide-changed', { detail: index }));
  };

  // Listen for external slide change requests
  useEffect(() => {
    const handleExternalChange = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === 'number') {
        setCurrentIndex(customEvent.detail % total);
      }
    };
    window.addEventListener('poastay-set-slide', handleExternalChange);
    return () => window.removeEventListener('poastay-set-slide', handleExternalChange);
  }, [total]);

  // Preload first image
  useEffect(() => {
    const img0 = new Image();
    img0.src = SLIDESHOW_IMAGES[0].src;
    img0.onload = () => setImagesLoaded((p) => ({ ...p, 0: true }));
    img0.onerror = () => {
      // Fallback
      img0.src = SLIDESHOW_IMAGES[0].fallbackSrc;
      img0.onload = () => setImagesLoaded((p) => ({ ...p, 0: true }));
    };
  }, []);

  // Preload next image in line
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % total;
    if (!imagesLoaded[nextIdx]) {
      const nextImg = new Image();
      nextImg.src = SLIDESHOW_IMAGES[nextIdx].src;
      nextImg.onload = () => setImagesLoaded((p) => ({ ...p, [nextIdx]: true }));
      nextImg.onerror = () => {
        nextImg.src = SLIDESHOW_IMAGES[nextIdx].fallbackSrc;
        nextImg.onload = () => setImagesLoaded((p) => ({ ...p, [nextIdx]: true }));
      };
    }
  }, [currentIndex, total, imagesLoaded]);

  // Automatic slideshow interval (6 seconds)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  const currentImage = SLIDESHOW_IMAGES[currentIndex];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full min-h-screen pointer-events-none -z-10 overflow-hidden select-none"
      style={{ minHeight: '100vh', width: '100%' }}
    >
      {/* Background Images with Crossfade & Subtle Zoom */}
      {SLIDESHOW_IMAGES.map((img, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={img.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img.src}
              alt={img.title}
              onError={(e) => {
                // Fallback to high-res CDN if local file fails
                const target = e.target as HTMLImageElement;
                if (target.src !== img.fallbackSrc) {
                  target.src = img.fallbackSrc;
                }
              }}
              className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              style={{
                width: '100%',
                minHeight: '100vh',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        );
      })}

      {/* Modern High-Legibility Dark Vignette Overlay */}
      {/* Automatically provides high contrast for all dashboards, cards, tables, and texts */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          overlayClassName ||
          'bg-gradient-to-b from-stone-950/75 via-stone-900/85 to-stone-950/94 backdrop-blur-[2px]'
        }`}
      />

      {/* Subtle Ambient Glow accents for premium depth */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Interactive Controls & Destination Info Bar */}
      {showControls && (
        <div className="pointer-events-auto fixed bottom-4 right-4 z-40 flex items-center gap-2">
          <div className="bg-stone-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 sm:px-3 sm:py-2 text-white shadow-2xl flex items-center gap-3">
            {/* Slide title (visible on sm+) */}
            <div className="hidden md:flex flex-col text-left max-w-[220px]">
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-extrabold uppercase tracking-wider truncate">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{currentImage.region}</span>
              </div>
              <span className="text-xs font-bold text-stone-200 truncate">
                {currentImage.title}
              </span>
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-white/10" />

            {/* Prev button */}
            <button
              type="button"
              onClick={prevSlide}
              className="p-1.5 rounded-xl hover:bg-white/15 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Previous background scene"
              aria-label="Previous scene"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-1.5 px-1">
              {SLIDESHOW_IMAGES.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => goToSlide(dotIdx)}
                  className={`transition-all rounded-full cursor-pointer ${
                    dotIdx === currentIndex
                      ? 'w-5 h-2 bg-amber-400 shadow-sm shadow-amber-400/50'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={nextSlide}
              className="p-1.5 rounded-xl hover:bg-white/15 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Next background scene"
              aria-label="Next scene"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Play / Pause toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-xl hover:bg-white/15 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause slideshow' : 'Resume slideshow'}
              aria-label={isPlaying ? 'Pause slideshow' : 'Resume slideshow'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
