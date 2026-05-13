import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ColorScheme } from '../../models/color-scheme.model';

@Component({
  selector: 'app-color-card',
  templateUrl: './color-card.component.html',
  styleUrls: ['./color-card.component.scss'],
  animations: [
    trigger('cardHover', [
      state('normal', style({
        transform: 'scale(1) translateY(0)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      })),
      state('hovered', style({
        transform: 'scale(1.05) translateY(-10px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      })),
      transition('normal <=> hovered', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('favoritePulse', [
      state('inactive', style({
        transform: 'scale(1)'
      })),
      state('active', style({
        transform: 'scale(1.2)'
      })),
      transition('inactive <=> active', animate('200ms ease-in-out'))
    ])
  ]
})
export class ColorCardComponent {
  @Input() colorScheme!: ColorScheme;
  @Output() toggleFavorite = new EventEmitter<string>();
  @Output() toggleArchive = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  isHovered = false;
  isFavoriteAnimating = false;

  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

  onToggleFavorite(): void {
    this.isFavoriteAnimating = true;
    setTimeout(() => {
      this.isFavoriteAnimating = false;
    }, 200);
    this.toggleFavorite.emit(this.colorScheme.id);
  }

  copyToClipboard(color: string): void {
    navigator.clipboard.writeText(color).then(() => {
      console.log('Color copied:', color);
    });
  }

  getGradientColors(): string {
    return this.colorScheme.colors.join(', ');
  }
}
