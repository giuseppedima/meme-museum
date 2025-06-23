import { Component, Input } from '@angular/core';
import { UserData } from '../_services/types/user-data.type';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-author-display',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './author-display.component.html',
  styleUrl: './author-display.component.scss'
})
export class AuthorDisplayComponent {
  @Input() author: {id:number, username:string} | null = null;
}
