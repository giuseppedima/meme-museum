import { Component, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { AuthService } from '../_services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { NgbAccordionModule, NgbCalendar, NgbDate, NgbDateParserFormatter, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { MemeData } from '../_services/types/meme-data.type';
import { UserData } from '../_services/types/user-data.type';
import { TagInputComponent, TagModel } from '../tag-input/tag-input.component';
import { DateRange, DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';
import { VoteButtonsComponent } from '../vote-buttons/vote-buttons.component';
import { TagsDisplayComponent } from '../tags-display/tags-display.component';
import { AuthorDisplayComponent } from '../author-display/author-display.component';

@Component({
  selector: 'app-memes-list',
  standalone: true,
  imports: [
    RouterLink, 
    ReactiveFormsModule, 
    CommonModule, 
    NgbAccordionModule, 
    DateRangePickerComponent, 
    TagInputComponent,
    NgSelectModule, 
    NgbPaginationModule,
    VoteButtonsComponent,
    TagsDisplayComponent,
    AuthorDisplayComponent
  ],
  templateUrl: './memes-list.component.html',
  styleUrl: './memes-list.component.scss'
})
export class MemesListComponent {
  
  ngOnInit():void {
    this.loadUsers();
    this.checkQueryParams();
    this.handleSearch();
  }

  toastr = inject(ToastrService);
  router = inject(Router);
  restService = inject(RestBackendService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  memes: MemeData[] = [];
  users: UserData[] = [];
  loading = false;
  usersLoading = false;
  error: string | null = null;

  // PAGINATION
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  maxSize = 5; // Numero massimo di link di pagina visibili
  
  // PAGINATION OPTIONS
  readonly pageSizeOptions = [
    { value: 1, label: '1 per page' },
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' }
  ];

  // FORM FILTERS
  searchForm = new FormGroup({
    title: new FormControl('', []),
    userId: new FormControl<number | null>(null, []),
    sortBy: new FormControl('upload_date', []),
    sortOrder: new FormControl('desc', []),
    tags: new FormControl<TagModel[]>([], []),
    dateRange: new FormControl<DateRange | null>(null, [])
  });
  activeFiltersCount=1; // sortBy is always present

  // SORT OPTIONS
  readonly sortOptions = [
    { value: 'upload_date', label: 'Upload date' },
    { value: 'upvotes', label: 'Upvotes' },
    { value: 'downvotes', label: 'Downvotes' }
  ];
  readonly sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];
  
  // DATE PICKER
  calendar = inject(NgbCalendar);
	formatter = inject(NgbDateParserFormatter);
  hoveredDate: NgbDate | null = null;
	fromDate: NgbDate | null = null;
	toDate: NgbDate | null = null;


	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}
  get selectedDateRange(): string {
    if (this.fromDate && this.toDate) {
      return `${this.formatter.format(this.fromDate)} - ${this.formatter.format(this.toDate)}`;
    } else if (this.fromDate) {
      return this.formatter.format(this.fromDate);
    }
    return '';
  }

  // USERS LOADING
  loadUsers() {
    this.usersLoading = true;
    this.restService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.usersLoading = false;
      },
      error: (err) => {
        this.usersLoading = false;
      }
    });
  }

  checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      if(params['user']) {
        const userId = parseInt(params['user']);
        if (!isNaN(userId)) {
          this.searchForm.get('userId')?.setValue(userId);
        }
      }
      if(params['tags']) {
        const tags = params['tags'];
        if (Array.isArray(tags)) {
          this.searchForm.get('tags')?.setValue(tags.map(tag => ({ display: tag, value: tag })));
        }
      }
      if(params['show-filters']  && params['show-filters'] == true) {
        setTimeout(() => {
          document.getElementById('filters-panel')?.click()
        }, 0);
      }
      this.handleSearch();

      this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true // Questo sostituisce l'entry nella cronologia invece di aggiungerne una nuova
      });
    });
  }

 // QUERY STRING BUILDER
  buildQueryString(): string {
    const params = new URLSearchParams();
    
    // Pagination parameters
    params.append('page', this.currentPage.toString());
    params.append('pageSize', this.pageSize.toString());
    
    // Title filter
    const title = this.searchForm.get('title')?.value?.trim();
    if (title) {
      params.append('title', title);
    }
    
    // User filter
    const userId = this.searchForm.get('userId')?.value;
    if (userId) {
      params.append('userId', userId.toString());
    }
    
    // Tags filter
    let tags: string[] = [];
    this.searchForm.value.tags?.forEach(
      (tag: any) => tags.push(tag.value)
    );
    if(tags.length > 0) {
      params.append('tags', JSON.stringify(tags));
    }
    
    // Sort parameters
    const sortBy = this.searchForm.get('sortBy')?.value;
    if (sortBy) {
      params.append('sortBy', sortBy);
    }
    
    const sortOrder = this.searchForm.get('sortOrder')?.value;
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }
    
    // Date range filter
    const dateRange = this.searchForm.get('dateRange')?.value;
    if (dateRange?.fromDate) {
      const fromDate = new Date(dateRange.fromDate.year, dateRange.fromDate.month - 1, dateRange.fromDate.day, 0, 0, 0, 0);
      params.append('dateFrom', fromDate.toISOString());
    }
    
    if (dateRange?.toDate) {
      const toDate = new Date(dateRange.toDate.year, dateRange.toDate.month - 1, dateRange.toDate.day, 23, 59, 59, 999);
      params.append('dateTo', toDate.toISOString());
    }
    
    return params.toString();
  }

  // SEARCH HANDLER
  handleSearch(pageChanged: boolean = false): void {
    this.updateFiltersCount();
    
    if (this.searchForm.valid) {
      
      if(!pageChanged) {
        // Reset alla prima pagina quando si esegue una nuova ricerca
        this.currentPage = 1;
      }
      
      const queryString = this.buildQueryString();
      this.loading = true;
      this.error = null;
      
      // Passa la query string al servizio
      this.restService.searchMemes(queryString).subscribe({
        next: (results: any) => {
          this.memes = results.data;
          this.totalItems = results.totalItems;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error during search';
          this.loading = false;
          this.toastr.error('Error during search', 'Search Error');
        }
      });
    }
  }

  // PAGINATION HANDLER
  onPageChanged(page: number): void {
    this.currentPage = page;
    this.handleSearch(true);
  }

  // PAGE SIZE CHANGE HANDLER
  onPageSizeChanged(e: Event): void {
    const selectElement = e.target as HTMLSelectElement;
    const newPageSize = parseInt(selectElement.value, 10);
    this.pageSize = newPageSize;
    this.handleSearch();
  }

  // RESET HANDLER
  resetFilters() {
    this.searchForm.reset({
      title: '',
      userId: null,
      sortBy: 'upload_date',
      sortOrder: 'desc',
      tags: [],
      dateRange: null
    });
    this.currentPage = 1;
  }

  private updateFiltersCount() {
    let count = 1; // sortBy
    
    if (this.searchForm.get('title')?.value?.trim()) {
      count++;
    }
    
    if (this.searchForm.get('userId')?.value) {
      count++;
    }
    
    const tags = this.searchForm.get('tags')?.value;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      count++;
    }
    
    const dateRange = this.searchForm.get('dateRange')?.value;
    if (dateRange?.fromDate || dateRange?.toDate) {
      count++;
    }
    
    this.activeFiltersCount = count;
  }

  // Naviga ai dettagli del meme
  navigateToMeme(event: MouseEvent, memeId: number) {
    // Controlla se il click è su un elemento interattivo
    const target = event.target as HTMLElement;
    
    // Se il click è su un link, bottone o badge, non navigare
    if (target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') ||
        target.classList.contains('badge')) {
      return;
    }
    
    // Naviga ai dettagli del meme
    this.router.navigate(['memes', memeId]);
  }

  // Sostituisci la funzione voteMeme con questa
  onMemeVoteChanged(updatedMeme: MemeData): void {
    // Trova il meme nella lista e aggiornalo
    const memeIndex = this.memes.findIndex(meme => meme.id === updatedMeme.id);
    if (memeIndex !== -1) {
      this.memes[memeIndex] = updatedMeme;
    }
  }

  // Getter per le informazioni di paginazione
  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} entries`;
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

}
