import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { ToastrService } from 'ngx-toastr';
import { MemeData } from '../_services/types/meme-data.type';

@Component({
  selector: 'app-vote-buttons',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './vote-buttons.component.html',
  styleUrl: './vote-buttons.component.scss'
})
export class VoteButtonsComponent {
  @Input() memeId!: number; // ID del meme da votare
  @Input() upvotesCount: number = 0;
  @Input() downvotesCount: number = 0;
  @Input() userVote: 'upvote' | 'downvote' | null = null;
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'lg' | null = null;
  @Input() filled: boolean = false;

  @Output() voteChanged = new EventEmitter<MemeData>(); // Emette il meme aggiornato
  
  private restService = inject(RestBackendService);
  private toastr = inject(ToastrService);
  isVoting = false;

  onVote(voteType: 'upvote' | 'downvote'): void {
    if (this.disabled || this.isVoting || !this.memeId) {
      return;
    }

    this.isVoting = true;

    this.restService.voteMeme(this.memeId, voteType).subscribe({
      next: (updatedMeme: MemeData) => {
        // Aggiorna i valori locali
        this.upvotesCount = updatedMeme.upvotesCount;
        this.downvotesCount = updatedMeme.downvotesCount;
        this.userVote = updatedMeme.userVote;
        
        // Emetti il meme aggiornato al componente parent
        this.voteChanged.emit(updatedMeme);
        
        this.isVoting = false;
      },
      error: (error) => {
        this.toastr.error('Error during voting', 'Vote Error');
        this.isVoting = false;
      }
    });
  }
}
