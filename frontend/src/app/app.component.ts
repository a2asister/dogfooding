import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GraphQLService } from './services/graphql.service';
import { AudioAnalyzerService, AudioData } from './services/audio-analyzer.service';
import { SubtitleAnimationService, SubtitleAnimationState } from './services/subtitle-animation.service';
import { Project, Subtitle } from './models/project.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('audioElement') audioElement?: ElementRef<HTMLAudioElement>;
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;
  
  private lastCanvasWidth?: number;
  private lastCanvasHeight?: number;

  projects: Project[] = [];
  selectedProject?: Project;
  currentSubtitle?: Subtitle;
  audioData: AudioData = { bass: 0, mid: 0, high: 0, energy: 0 };
  
  newProjectName = '';
  newSubtitleText = '';
  newStartTime = 0;
  newEndTime = 5;
  selectedAnimationType = 'bounce';
  
  isPlaying = false;
  currentTime = 0;
  private animationFrame?: number;
  private subscriptions = new Subscription();

  animationTypes = this.subtitleAnimationService.getAnimationTypes();

  constructor(
    private readonly graphqlService: GraphQLService,
    private readonly audioAnalyzerService: AudioAnalyzerService,
    private readonly subtitleAnimationService: SubtitleAnimationService,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    
    this.subscriptions.add(
      this.audioAnalyzerService.audioData$.subscribe((data) => {
        this.audioData = data;
      }),
    );
  }

  ngAfterViewChecked(): void {
    if (this.canvas && this.selectedProject) {
      const width = this.selectedProject.videoWidth || 1080;
      const height = this.selectedProject.videoHeight || 1920;
      
      if (this.lastCanvasWidth !== width || this.lastCanvasHeight !== height) {
        this.lastCanvasWidth = width;
        this.lastCanvasHeight = height;
        this.renderCanvas();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.audioAnalyzerService.disconnect();
  }

  loadProjects(): void {
    this.subscriptions.add(
      this.graphqlService.getProjects().subscribe((projects) => {
        this.projects = projects;
      }),
    );
  }

  createProject(): void {
    if (!this.newProjectName.trim()) return;
    
    this.subscriptions.add(
      this.graphqlService.createProject(this.newProjectName).subscribe((project) => {
        this.projects.unshift(project);
        this.newProjectName = '';
        this.selectProject(project);
      }),
    );
  }

  selectProject(project: Project): void {
    this.subscriptions.add(
      this.graphqlService.getProject(project.id).subscribe((fullProject) => {
        this.selectedProject = fullProject;
        if (this.selectedProject?.subtitles) {
          this.selectedProject.subtitles = [...this.selectedProject.subtitles];
        }
        this.stopAudio();
        this.renderCanvas();
      }),
    );
  }

  addSubtitle(): void {
    if (!this.selectedProject || !this.newSubtitleText.trim()) return;

    this.subscriptions.add(
      this.graphqlService
        .createSubtitle({
          projectId: this.selectedProject.id,
          text: this.newSubtitleText,
          startTime: this.newStartTime,
          endTime: this.newEndTime,
          animationType: this.selectedAnimationType,
        })
        .subscribe((newSubtitle) => {
          this.newSubtitleText = '';
          if (this.selectedProject) {
            if (!this.selectedProject.subtitles) {
              this.selectedProject.subtitles = [];
            }
            this.selectedProject.subtitles.push(newSubtitle);
            this.renderCanvas();
          }
        }),
    );
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.audioElement || !this.selectedProject) return;

    const file = input.files[0];
    const url = URL.createObjectURL(file);
    this.audioElement.nativeElement.src = url;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await fetch(`http://localhost:3080/audio/upload/${this.selectedProject.id}`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
    
    setTimeout(() => {
      if (this.audioElement) {
        this.audioAnalyzerService.connectAudio(this.audioElement.nativeElement);
        this.audioElement.nativeElement.addEventListener('timeupdate', () => {
          if (!this.isPlaying) {
            this.currentTime = this.audioElement!.nativeElement.currentTime;
            this.renderCanvas();
          }
        });
      }
    }, 100);
  }

  togglePlay(): void {
    if (!this.audioElement) return;
    
    if (this.isPlaying) {
      this.audioElement.nativeElement.pause();
    } else {
      void this.audioElement.nativeElement.play();
      this.startAnimation();
    }
    this.isPlaying = !this.isPlaying;
  }

  stopAudio(): void {
    if (this.audioElement) {
      this.audioElement.nativeElement.pause();
      this.audioElement.nativeElement.currentTime = 0;
    }
    this.isPlaying = false;
    this.currentTime = 0;
  }

  private startAnimation(): void {
    const update = (): void => {
      if (!this.isPlaying || !this.audioElement) return;
      
      this.currentTime = this.audioElement.nativeElement.currentTime;
      this.updateCurrentSubtitle();
      this.renderCanvas();
      
      this.animationFrame = requestAnimationFrame(update);
    };
    
    update();
  }

  private updateCurrentSubtitle(): void {
    if (!this.selectedProject?.subtitles) {
      this.currentSubtitle = undefined;
      return;
    }

    this.currentSubtitle = this.selectedProject.subtitles.find(
      (s) => this.currentTime >= s.startTime && this.currentTime <= s.endTime,
    );
  }

  previewSubtitleAtTime(time: number): void {
    this.currentTime = time;
    this.renderCanvas();
  }

  renderCanvas(): void {
    if (!this.canvas || !this.selectedProject) return;
    
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const width = this.selectedProject.videoWidth || 1080;
    const height = this.selectedProject.videoHeight || 1920;
    
    ctx.fillStyle = this.selectedProject.backgroundColor || '#000000';
    ctx.fillRect(0, 0, width, height);

    this.updateCurrentSubtitle();

    if (this.currentSubtitle) {
      const duration = this.currentSubtitle.endTime - this.currentSubtitle.startTime;
      const progress = duration > 0 
        ? (this.currentTime - this.currentSubtitle.startTime) / duration 
        : 0;
      
      const state = this.subtitleAnimationService.calculateAnimationState(
        this.currentSubtitle,
        this.audioData,
        progress,
        performance.now(),
      );

      this.renderSubtitle(ctx, this.currentSubtitle, state, width, height);
    }
  }

  private renderSubtitle(
    ctx: CanvasRenderingContext2D,
    subtitle: Subtitle,
    state: SubtitleAnimationState,
    width: number,
    height: number,
  ): void {
    ctx.save();
    
    const centerX = width / 2 + state.offsetX;
    const centerY = height / 2 + state.offsetY;
    
    ctx.translate(centerX, centerY);
    ctx.scale(state.scale, state.scale);
    ctx.rotate((state.rotation * Math.PI) / 180);
    
    const fontSize = subtitle.fontSize || 72;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (state.shadowBlur > 0) {
      ctx.shadowColor = `rgb(${state.colorR}, ${state.colorG}, ${state.colorB})`;
      ctx.shadowBlur = state.shadowBlur;
    }
    
    ctx.fillStyle = `rgba(${state.colorR}, ${state.colorG}, ${state.colorB}, ${state.opacity})`;
    ctx.fillText(subtitle.text, 0, 0);
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeText(subtitle.text, 0, 0);
    
    ctx.restore();
  }
}
