import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-checkin-icon',
  templateUrl: './checkin-icon.component.html',
  styleUrls: ['./checkin-icon.component.css'],
  animations: [
    trigger('bounceIn', [
      state('visible', style({
        transform: 'scale(1)',
        opacity: 1
      })),
      transition('void => visible', [
        style({
          transform: 'scale(0)',
          opacity: 0
        }),
        animate('0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)')
      ])
    ])
  ]
})
export class CheckinIconComponent {
  @Input() visible: boolean = false;
}
