export interface Subtitle {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  animationType?: string;
}

export interface Project {
  id: string;
  name: string;
  audioFile?: string;
  backgroundColor?: string;
  videoWidth?: number;
  videoHeight?: number;
  subtitles?: Subtitle[];
  createdAt: Date;
}
