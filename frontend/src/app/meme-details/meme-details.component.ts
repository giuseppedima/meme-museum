import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { AuthService } from '../_services/auth/auth.service';
import { MemeData } from '../_services/types/meme-data.type';
import { CommentData, CommentDataPaginated } from '../_services/types/comment-data-type';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { TagInputComponent } from '../tag-input/tag-input.component';
import { VoteButtonsComponent } from '../vote-buttons/vote-buttons.component';
import { TagsDisplayComponent } from '../tags-display/tags-display.component';
import { AuthorDisplayComponent } from '../author-display/author-display.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-meme-details',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    TagInputComponent,
    VoteButtonsComponent,
    TagsDisplayComponent,
    AuthorDisplayComponent
  ],
  templateUrl: './meme-details.component.html',
  styleUrl: './meme-details.component.scss'
})
export class MemeDetailsComponent implements OnInit {
  toastr = inject(ToastrService);

  meme: MemeData | null = null;
  comments: CommentData[] = [];
  memeId: number = 0;
  loading = true;
  error: string | null = null;
  commentsLoading = false;
  commentsError: string | null = null;

  // Pagination
  currentPage = 1;
  totalItems = 0;
  pageSize = 10;
  maxSize = 5;

  // PAGINATION OPTIONS per commenti
  readonly commentPageSizeOptions = [
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 15, label: '15 per page' },
    { value: 20, label: '20 per page' },
    { value: 30, label: '30 per page' }
  ];

  // Forms
  commentForm: FormGroup;
  editCommentForm: FormGroup;
  editMemeForm: FormGroup;

  // Edit state
  editingCommentId: number | null = null;
  editingMeme = false;

  // User info
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestBackendService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]]
    });

    this.editCommentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]]
    });

    this.editMemeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      tags: [[], []]
    });
  }

  ngOnInit(): void {
    // Get current user ID
    this.currentUserId = this.authService.getUser()?.id || null;

    // Get meme ID from route
    this.route.params.subscribe(params => {
      this.memeId = parseInt(params['id']);
      if (this.memeId) {
        this.loadMeme();
        this.loadComments();
      } else {
        this.router.navigate(['/memes']);
      }
    });
  }

  loadMeme(): void {
    this.loading = true;
    this.error = null;

    this.restService.getMemeById(this.memeId).subscribe({
      next: (meme) => {
        this.meme = meme;
        this.loading = false;
        // Handle anchor scrolling after loading is complete
        this.handleAnchorScrolling();
      },
      error: (error) => {
        this.error = 'Error loading meme';
        this.loading = false;
      }
    });
  }

  private handleAnchorScrolling(): void {
    const anchor = window.location.hash;
    if (anchor) {
      // Use setTimeout to ensure DOM is updated after loading is false
      setTimeout(() => {
        const el = document.querySelector(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }

  loadComments(page: number = 1): void {
    this.commentsLoading = true;
    this.commentsError = null;

    this.restService.getComments(this.memeId, page, this.pageSize).subscribe({
      next: (response: CommentDataPaginated) => {
        this.comments = response.data;
        this.totalItems = response.totalItems;
        this.currentPage = response.currentPage;
        this.commentsLoading = false;
      },
      error: (error) => {
        this.commentsError = 'Error loading comments';
        this.commentsLoading = false;
      }
    });
  }

  onMemeVoteChanged(updatedMeme: MemeData): void {
    this.meme = updatedMeme;
  }

  onCommentSubmit(): void {
    if (this.commentForm.valid) {
      const content = this.commentForm.get('content')?.value;
      
      this.restService.createComment(this.memeId, content).subscribe({
        next: (newComment) => {
          this.commentForm.reset();
          this.loadComments(this.currentPage); // Reload current page
          // Update meme comment count
          if (this.meme) {
            this.meme.commentsCount++;
          }
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Error creating comment');
        }
      });
    }
  }

  startEditComment(comment: CommentData): void {
    this.editingCommentId = comment.id;
    this.editCommentForm.patchValue({
      content: comment.content
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentForm.reset();
  }

  saveEditComment(commentId: number): void {
    if (this.editCommentForm.valid) {
      const content = this.editCommentForm.get('content')?.value;
      
      this.restService.updateComment(this.memeId, commentId, content).subscribe({
        next: () => {
          this.editingCommentId = null;
          this.editCommentForm.reset();
          this.loadComments(this.currentPage);
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Error updating comment');
        }
      });
    }
  }

  deleteComment(commentId: number): void {
    this.restService.deleteComment(this.memeId, commentId).subscribe({
      next: () => {
        this.loadComments(this.currentPage);
        // Update meme comment count
        if (this.meme) {
          this.meme.commentsCount--;
        }
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Error deleting comment');
      }
    });
  }

  startEditMeme(): void {
    if (!this.meme) return;
    
    this.editingMeme = true;
    this.editMemeForm.patchValue({
      title: this.meme.title,
      tags: this.meme.tags.map(tag => ({ display: tag.name, value: tag.name }))
    });
  }

  cancelEditMeme(): void {
    this.editingMeme = false;
    this.editMemeForm.reset();
  }

  saveEditMeme(): void {
    if (this.editMemeForm.valid && this.meme) {
      const title = this.editMemeForm.get('title')?.value;
      const tagsArray = this.editMemeForm.get('tags')?.value;
      
      // Estrai i nomi dei tag
      const tags = tagsArray.map((tag: any) => 
        typeof tag === 'string' ? tag : tag.value || tag.display
      );

      this.restService.updateMeme(this.meme.id, { title, tags }).subscribe({
        next: (updatedMeme) => {
          this.meme = updatedMeme;
          this.editingMeme = false;
          this.editMemeForm.reset();
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Error updating meme');
        }
      });
    }
  }

  deleteMeme(): void {
    if (!this.meme)
      return;

    this.restService.deleteMeme(this.meme.id).subscribe({
      next: () => {
        // Redirect to memes list after successful deletion
        this.router.navigate(['/memes']);
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Error deleting meme');
      }
    });
  
  }

  canEditMeme(): boolean {
    return this.meme ? this.currentUserId === this.meme.user.id : false;
  }

  onPageChanged(page: number): void {
    this.loadComments(page);
  }

  canEditComment(comment: CommentData): boolean {
    return this.currentUserId === comment.user.id;
  }

  canDeleteComment(comment: CommentData): boolean {
    return this.currentUserId === comment.user.id;
  }

  canDeleteMeme(): boolean {
    return this.meme ? this.currentUserId === this.meme.user.id : false;
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  goBack(): void {
    this.router.navigate(['/memes']);
  }

  get paginationInfo(): string {
    if (this.totalItems === 0) return 'No comments';
    
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} comments`;
  }

  // COMMENT PAGE SIZE CHANGE HANDLER
  onCommentPageSizeChanged(e: Event): void {
    const selectElement = e.target as HTMLSelectElement;
    const newPageSize = parseInt(selectElement.value, 10);
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset alla prima pagina quando cambia la dimensione
    this.loadComments();
  }
}
