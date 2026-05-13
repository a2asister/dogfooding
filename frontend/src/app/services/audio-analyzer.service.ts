import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AudioData {
  bass: number;
  mid: number;
  high: number;
  energy: number;
}

@Injectable({ providedIn: 'root' })
export class AudioAnalyzerService {
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private source?: MediaElementAudioSourceNode;
  private animationId?: number;
  
  public audioData$ = new Subject<AudioData>();

  connectAudio(audioElement: HTMLAudioElement): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    if (this.source) {
      this.source.disconnect();
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.analyze();
  }

  private analyze(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = (): void => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      const bass = this.calculateAverage(dataArray, 0, 10);
      const mid = this.calculateAverage(dataArray, 10, 50);
      const high = this.calculateAverage(dataArray, 50, bufferLength);
      const energy = (bass + mid + high) / 3;

      this.audioData$.next({ bass, mid, high, energy });
      
      this.animationId = requestAnimationFrame(update);
    };

    update();
  }

  private calculateAverage(data: Uint8Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end && i < data.length; i++) {
      sum += data[i];
    }
    return sum / (end - start);
  }

  disconnect(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.source) {
      this.source.disconnect();
    }
    if (this.audioContext) {
      void this.audioContext.close();
    }
  }
}
