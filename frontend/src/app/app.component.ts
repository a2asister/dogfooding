import { Component, OnInit } from '@angular/core';
import { Skill } from './models/skill.model';
import { SkillService } from './services/skill.service';

type ViewMode = 'grid' | 'stack' | '3d';

interface ViewModeOption {
  value: ViewMode;
  label: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = '3D Skill Cards - 魔方式技能展示';
  skills: Skill[] = [];
  viewMode: ViewMode = 'grid';
  viewModes: ViewModeOption[] = [
    { value: 'grid', label: 'GRID视图' },
    { value: 'stack', label: 'STACK视图' },
    { value: '3d', label: '3D视图' },
  ];
  isLoading = true;

  constructor(private skillService: SkillService) {}

  ngOnInit() {
    this.loadSkills();
  }

  loadSkills() {
    this.isLoading = true;
    setTimeout(() => {
      this.skills = this.skillService.getMockSkills();
      this.arrangeCards();
      this.isLoading = false;
    }, 500);
  }

  arrangeCards() {
    const cols = 3;
    this.skills.forEach((skill, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      skill.positionX = col * 260 - 260;
      skill.positionY = row * 340;
      skill.rotation = (Math.random() - 0.5) * 10;
    });
  }

  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
    if (mode === 'stack') {
      this.arrangeStack();
    } else if (mode === '3d') {
      this.arrange3D();
    } else {
      this.arrangeCards();
    }
  }

  arrangeStack() {
    this.skills.forEach((skill, index) => {
      skill.positionX = index * 5;
      skill.positionY = index * 5;
      skill.rotation = index * 5;
    });
  }

  arrange3D() {
    const centerX = 0;
    const radius = 200;
    this.skills.forEach((skill, index) => {
      const angle = (index / this.skills.length) * Math.PI * 2;
      skill.positionX = centerX + Math.cos(angle) * radius;
      skill.positionY = Math.sin(angle) * 50;
      skill.rotation = (angle * 180) / Math.PI;
    });
  }

  refreshSkills() {
    this.loadSkills();
  }
}