import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';
import { TagInputComponent, TagModel } from '../tag-input/tag-input.component';

@Component({
  selector: 'app-meme-upload',
  standalone: true,
  imports: [TagInputComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './meme-upload.component.html',
  styleUrl: './meme-upload.component.scss'
})
export class MemeUploadComponent {
  toastr = inject(ToastrService);
  router = inject(Router);
  restService = inject(RestBackendService);
  memeUploadForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(1), 
      Validators.maxLength(255)
    ]),
    meme: new FormControl<File | null>(null, [
      Validators.required,
      (control) => {
        if(!control.value) {
          return null; // Validators.required will handle this case
        }

        const file = control.value as File;
        const fileName = file.name;
        const parts = fileName.split('.');
        if(parts.length > 1){
          const ext = parts.pop()!.toLowerCase()
          if (ext && /jpeg|jpg|png|gif/.test(ext)) {
            return null;
          }
        }

        return {invalidImageType:true};
      }
    ]),
    tags: new FormControl([], [
      Validators.required,
      (control) => {
        const tags = control.value;
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return { tagsRequired: true };
        }
        return null;
      }
    ])
  });
  preview: string | null = null;

  handleUpload() {
       
    if (this.memeUploadForm.valid) {

      let tags: string[] = [];
      this.memeUploadForm.value.tags?.forEach(
        (tag: any) => tags.push(tag.value)
      );

      this.restService.createMeme({
        title: this.memeUploadForm.value.title as string,
        meme: this.memeUploadForm.value.meme as File,
        tags: tags
      }).subscribe({
        error: (err) => {
          console.error(err);
          this.toastr.error(err.error.message, "Error during meme upload");
        },
        next: (meme) => {
          this.toastr.success(`Meme uploaded successfully!`);
          this.router.navigate(['memes', meme.id]);
        }
      });
    }
  }

  onFileBlur() {
    this.memeUploadForm.get('meme')?.markAsTouched();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.memeUploadForm.patchValue({
        meme: file
      });
      
      // Forza la validazione del campo meme
      this.memeUploadForm.get('meme')?.updateValueAndValidity();
      this.memeUploadForm.get('meme')?.markAsTouched();
    
      this.preview = URL.createObjectURL(file);
    } else {
      // Se nessun file è selezionato, resetta il campo
      this.memeUploadForm.patchValue({
        meme: null
      });
      this.memeUploadForm.get('meme')?.updateValueAndValidity();
      this.memeUploadForm.get('meme')?.markAsTouched();
      
      if (this.preview) {
        URL.revokeObjectURL(this.preview);
        this.preview = null;
      }
    }
  }

  ngOnDestroy() {
    if (this.preview) {
      URL.revokeObjectURL(this.preview);
    }
  }
}

