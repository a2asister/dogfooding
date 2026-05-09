import { useEffect, useRef } from 'react';

const WhiteNoisePlayer = ({ isPlaying }) => {
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const bufferSize = 2 * audioContext.sampleRate;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noiseNode = audioContext.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.05;

      const filterNode = audioContext.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 800;

      noiseNode.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNodeRef.current = gainNode;
      noiseNodeRef.current = noiseNode;

      noiseNode.start();
    } else {
      if (noiseNodeRef.current && gainNodeRef.current) {
        const fadeOut = () => {
          const currentTime = audioContextRef.current.currentTime;
          gainNodeRef.current.gain.cancelScheduledValues(currentTime);
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime);
          gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.5);
          
          setTimeout(() => {
            if (noiseNodeRef.current) {
              try {
                noiseNodeRef.current.stop();
              } catch (e) {}
              noiseNodeRef.current = null;
            }
          }, 600);
        };
        
        fadeOut();
      }
    }

    return () => {
      if (noiseNodeRef.current && isPlayingRef.current === false) {
        try {
          noiseNodeRef.current.stop();
        } catch (e) {}
        noiseNodeRef.current = null;
      }
    };
  }, [isPlaying]);

  return null;
};

export default WhiteNoisePlayer;
