import { Injectable } from '@angular/core';
import { AudioData } from './audio-analyzer.service';
import { Subtitle } from '../models/project.model';

export interface SubtitleAnimationState {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  colorR: number;
  colorG: number;
  colorB: number;
  opacity: number;
  shadowBlur: number;
}

@Injectable({ providedIn: 'root' })
export class SubtitleAnimationService {
  private defaultState: SubtitleAnimationState = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    colorR: 255,
    colorG: 255,
    colorB: 255,
    opacity: 1,
    shadowBlur: 0,
  };

  calculateAnimationState(
    subtitle: Subtitle,
    audioData: AudioData,
    currentTime: number,
    progress: number,
  ): SubtitleAnimationState {
    const state = { ...this.defaultState };
    const animationType = subtitle.animationType || 'bounce';

    switch (animationType) {
      case 'bounce':
        this.applyBounceEffect(state, audioData, progress);
        break;
      case 'scale':
        this.applyScaleEffect(state, audioData, progress);
        break;
      case 'wave':
        this.applyWaveEffect(state, audioData, progress, currentTime);
        break;
      case 'shake':
        this.applyShakeEffect(state, audioData, progress);
        break;
      case 'glow':
        this.applyGlowEffect(state, audioData, progress);
        break;
      default:
        this.applyBounceEffect(state, audioData, progress);
    }

    if (subtitle.color) {
      this.applyCustomColor(state, subtitle.color);
    } else {
      this.applyDynamicColor(state, audioData);
    }

    return state;
  }

  private applyBounceEffect(state: SubtitleAnimationState, audioData: AudioData, progress: number): void {
    const bounceIntensity = audioData.bass / 255;
    const bounceHeight = Math.sin(progress * Math.PI * 4) * bounceIntensity * 30;
    state.scale = 1 + bounceIntensity * 0.4;
    state.offsetY = -bounceHeight;
  }

  private applyScaleEffect(state: SubtitleAnimationState, audioData: AudioData, progress: number): void {
    const scaleIntensity = audioData.energy / 255;
    const pulse = Math.sin(progress * Math.PI * 6) * 0.3 + 1;
    state.scale = pulse * (1 + scaleIntensity * 0.5);
  }

  private applyWaveEffect(state: SubtitleAnimationState, audioData: AudioData, progress: number, time: number): void {
    const waveIntensity = audioData.mid / 255;
    state.offsetX = Math.sin(time * 0.005 + progress * Math.PI * 8) * waveIntensity * 20;
    state.offsetY = Math.cos(time * 0.003 + progress * Math.PI * 6) * waveIntensity * 15;
    state.rotation = Math.sin(time * 0.002) * 5 * waveIntensity;
  }

  private applyShakeEffect(state: SubtitleAnimationState, audioData: AudioData, progress: number): void {
    const shakeIntensity = audioData.high / 255;
    if (progress % 0.1 < 0.05) {
      state.offsetX = (Math.random() - 0.5) * shakeIntensity * 15;
      state.offsetY = (Math.random() - 0.5) * shakeIntensity * 15;
    }
    state.scale = 1 + shakeIntensity * 0.2;
  }

  private applyGlowEffect(state: SubtitleAnimationState, audioData: AudioData, progress: number): void {
    const glowIntensity = audioData.energy / 255;
    state.shadowBlur = glowIntensity * 30;
    state.scale = 1 + glowIntensity * 0.15;
    state.opacity = 0.8 + glowIntensity * 0.2;
  }

  private applyDynamicColor(state: SubtitleAnimationState, audioData: AudioData): void {
    state.colorR = Math.min(255, 150 + audioData.bass);
    state.colorG = Math.min(255, 100 + audioData.mid);
    state.colorB = Math.min(255, 200 + audioData.high * 0.5);
  }

  private applyCustomColor(state: SubtitleAnimationState, color: string): void {
    const hex = color.replace('#', '');
    state.colorR = parseInt(hex.substring(0, 2), 16) || 255;
    state.colorG = parseInt(hex.substring(2, 4), 16) || 255;
    state.colorB = parseInt(hex.substring(4, 6), 16) || 255;
  }

  getAnimationTypes(): { value: string; label: string }[] {
    return [
      { value: 'bounce', label: '弹跳律动' },
      { value: 'scale', label: '缩放脉动' },
      { value: 'wave', label: '波浪飘动' },
      { value: 'shake', label: '震动效果' },
      { value: 'glow', label: '发光特效' },
    ];
  }
}
