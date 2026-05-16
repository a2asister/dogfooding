import React, { useState, useRef, useEffect } from 'react';
import { FileItem } from '../types';

interface VideoPlayerProps {
  file: FileItem;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sampleVideos = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://www.w3schools.com/html/movie.mp4',
  ];

  const videoSrc = file.content || sampleVideos[file.id % sampleVideos.length];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  return (
    <div
      ref={containerRef}
      className="video-player"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#000',
        position: 'relative',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div
        className="video-container"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            cursor: 'pointer',
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={(e) => e.stopPropagation()}
        />
        {!isPlaying && (
          <div
            className="play-overlay"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={togglePlay}
          >
            <span style={{ fontSize: '36px', color: '#fff', marginLeft: '5px' }}>▶</span>
          </div>
        )}
      </div>

      <div
        className="video-controls"
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          className="progress-bar"
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            marginBottom: '12px',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: '100%',
              height: '100%',
              margin: 0,
              cursor: 'pointer',
              WebkitAppearance: 'none',
              background: 'transparent',
            }}
          />
          <div
            style={{
              height: '100%',
              background: '#0078d4',
              width: `${(currentTime / (duration || 1)) * 100}%`,
              marginTop: '-6px',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div
          className="controls-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={skipBackward}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              ⏮
            </button>
            <button
              onClick={skipForward}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              ⏭
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{ width: '80px', cursor: 'pointer' }}
              />
            </div>
            <span style={{ color: '#fff', fontSize: '14px' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;