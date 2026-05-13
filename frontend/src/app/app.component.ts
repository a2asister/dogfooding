import { Component, OnInit } from '@angular/core';
import { ColorSchemeService } from './services/color-scheme.service';
import { ColorScheme, CreateColorSchemeInput } from './models/color-scheme.model';
import { trigger, transition, style, query, animate, stagger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px) scale(0.9)' }),
          stagger(100, [
            animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger(100, [
            animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px) scale(0.9)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  colorSchemes: ColorScheme[] = [];
  activeTab: 'all' | 'favorites' | 'archived' | 'templates' = 'all';
  tabs: ('all' | 'favorites' | 'archived' | 'templates')[] = ['all', 'favorites', 'archived', 'templates'];
  loading = true;

  constructor(private colorSchemeService: ColorSchemeService) {}

  ngOnInit(): void {
    this.loadColorSchemes();
  }

  loadColorSchemes(): void {
    this.colorSchemeService.getColorSchemes().subscribe({
      next: (schemes) => {
        this.colorSchemes = schemes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading color schemes:', err);
        this.loading = false;
      }
    });
  }

  onTabChange(tab: 'all' | 'favorites' | 'archived' | 'templates'): void {
    this.activeTab = tab;
    this.loading = true;

    switch (tab) {
      case 'all':
        this.colorSchemeService.getColorSchemes().subscribe({
          next: (schemes) => {
            this.colorSchemes = schemes;
            this.loading = false;
          }
        });
        break;
      case 'favorites':
        this.colorSchemeService.getFavorites().subscribe({
          next: (schemes) => {
            this.colorSchemes = schemes;
            this.loading = false;
          }
        });
        break;
      case 'archived':
        this.colorSchemeService.getArchived().subscribe({
          next: (schemes) => {
            this.colorSchemes = schemes;
            this.loading = false;
          }
        });
        break;
      case 'templates':
        this.colorSchemeService.getTemplates().subscribe({
          next: (schemes) => {
            this.colorSchemes = schemes;
            this.loading = false;
          }
        });
        break;
    }
  }

  onCreateScheme(input: CreateColorSchemeInput): void {
    this.colorSchemeService.createColorScheme(input).subscribe({
      next: () => {
        console.log('Color scheme created successfully');
      },
      error: (err) => {
        console.error('Error creating color scheme:', err);
      }
    });
  }

  onToggleFavorite(id: string): void {
    this.colorSchemeService.toggleFavorite(id).subscribe({
      error: (err) => {
        console.error('Error toggling favorite:', err);
      }
    });
  }

  onToggleArchive(id: string): void {
    this.colorSchemeService.toggleArchive(id).subscribe({
      error: (err) => {
        console.error('Error toggling archive:', err);
      }
    });
  }

  onDelete(id: string): void {
    if (confirm('确定要删除这个配色方案吗？')) {
      this.colorSchemeService.deleteColorScheme(id).subscribe({
        error: (err) => {
          console.error('Error deleting color scheme:', err);
        }
      });
    }
  }

  getTabLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      all: '全部',
      favorites: '收藏',
      archived: '归档',
      templates: '模板'
    };
    return labels[tab] || tab;
  }

  trackById(index: number, item: ColorScheme): string {
    return item.id;
  }
}
