import { Component, inject } from '@angular/core';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-todays-meme',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './todays-meme.component.html',
  styleUrl: './todays-meme.component.scss'
})
export class TodaysMemeComponent {
  restService = inject(RestBackendService);
  dailyMemeId: number | null = null;
  ngOnInit(): void {
    this.loadDailyMeme();
  }
  loadDailyMeme(): void {
    this.restService.getTodaysMeme().subscribe({
      next: (meme) => {
        this.dailyMemeId = meme.id;  
      },
      error: (err) => {
        console.error('Error loading daily meme:', err);
      }
    });
  } 

}
