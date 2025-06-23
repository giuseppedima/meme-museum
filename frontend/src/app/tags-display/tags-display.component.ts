import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Tag {
  id: number;
  name: string;
}

@Component({
  selector: 'app-tags-display',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tags-display.component.html',
  styleUrls: ['./tags-display.component.scss']
})
export class TagsDisplayComponent {
  @Input() tags: Tag[] = [];
  @Input() badgeClass: string = 'bg-secondary';
  @Input() containerClass: string = 'd-flex flex-nowrap overflow-auto pb-1';
  @Input() scrollbarStyle: string = 'scrollbar-width: thin;';

}