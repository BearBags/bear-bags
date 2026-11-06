'use client';

import { useEffect, useRef, type Ref } from 'react';

interface Props {
  src: string;
  /** Still frame shown until the video plays. */
  poster: string;
  className?: string;
  ref?: Ref<HTMLVideoElement>;
  onPlayingChange?: (playing: boolean) => void;
}

// A muted, looping video that downloads nothing until it scrolls into view,
// and pauses while off-screen. Autoplaying videos used to start downloading
// with the page and starve its JavaScript on mobile, leaving buttons and links
// dead until they finished.
export default function LazyVideo({ src, poster, className, ref, onPlayingChange }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Only resumes what this observer paused, so a video the visitor paused
    // stays paused when they scroll back to it.
    let pausedOffscreen = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (pausedOffscreen) video.play().catch(() => {});
          pausedOffscreen = false;
        } else if (!video.paused) {
          video.pause();
          pausedOffscreen = true;
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={(el) => {
        videoRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      src={src}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      onPlay={() => onPlayingChange?.(true)}
      onPause={() => onPlayingChange?.(false)}
      className={className}
    />
  );
}
