import { useEffect, useRef, useState } from "react";

interface VideoHelperProps {
  src: string;
  initialTime?: number;          // seconds to seek after metadata loads
  onPause?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  onComplete?: () => void;
  completionThreshold?: number;
  autoPlay?: boolean;
  className?: string;
  controls?: boolean;
}

export default function VideoHelper({
  src,
  initialTime,
  onPause,
  onPlay,
  onTimeUpdate,
  onEnded,
  onLoadedMetadata,
  onComplete,
  completionThreshold = 95,
  autoPlay = false,
  className = "w-full h-[374px] object-cover",
  controls = true,
}: VideoHelperProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [duration, setDuration] = useState(0);
  const completionTriggeredRef = useRef(false);
  const hasSeekedInitial = useRef(false);

  useEffect(() => {
    // Reset when src changes
    setIsCompleted(false);
    completionTriggeredRef.current = false;
    hasSeekedInitial.current = false;
    setDuration(0);
  }, [src]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      onLoadedMetadata?.(dur);

      // Seek to initialTime if provided and not already seeked
      if (initialTime && initialTime > 0 && !hasSeekedInitial.current && videoRef.current.readyState >= 1) {
        videoRef.current.currentTime = Math.min(initialTime, dur - 1);
        hasSeekedInitial.current = true;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = duration || videoRef.current.duration;
    onTimeUpdate?.(current, dur);

    if (!completionTriggeredRef.current && dur > 0) {
      const percentWatched = (current / dur) * 100;
      if (percentWatched >= completionThreshold) {
        completionTriggeredRef.current = true;
        setIsCompleted(true);
        onComplete?.();
      }
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = duration || videoRef.current.duration;
      onPause?.(current, dur);
    }
  };

  const handlePlay = () => onPlay?.();
  const handleEnded = () => {
    if (!completionTriggeredRef.current) {
      completionTriggeredRef.current = true;
      setIsCompleted(true);
      onComplete?.();
    }
    onEnded?.();
  };

  return (
    <video
      ref={videoRef}
      src={src}
      controls={controls}
      className={className}
      onPlay={handlePlay}
      onPause={handlePause}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onLoadedMetadata={handleLoadedMetadata}
      autoPlay={autoPlay}
      preload="metadata"
    />
  );
}