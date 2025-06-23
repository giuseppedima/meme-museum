import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../_services/auth/auth.service';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  toastr = inject(ToastrService);
  router = inject(Router);
  restService = inject(RestBackendService);
  authService = inject(AuthService);
  signupForm = new FormGroup({
    user: new FormControl('', [
      Validators.required,
      Validators.minLength(4), 
      Validators.maxLength(16),
      Validators.pattern(/^[a-z0-9]+$/), // Only lower alphanumeric characters
    ]),
    pass: new FormControl('', [
      Validators.required, 
      Validators.minLength(4), 
      Validators.maxLength(16)
    ]),
    confirmPass: new FormControl('', [
      Validators.required, 
      Validators.minLength(4), 
      Validators.maxLength(16),
      (control) => {
        const form = control.parent;
        if(!form)
          return null;
        
        if(control.value === form.get('pass')?.value)
          return null;
        
        return { passwordMismatch: true };
      }
    ])
  });

  handleSignup() {
    if(this.signupForm.valid){
      this.restService.signup({
        usr: this.signupForm.value.user as string,
        pwd: this.signupForm.value.pass as string,
      }).subscribe({
        error: (err) => {
          this.toastr.error(err.error.message,"Error during signup");
        },
        complete: () => {
          this.toastr.success(`You can now login with your new account`,`Congrats ${this.signupForm.value.user}!`);
          this.router.navigateByUrl("/login");
        }
      });
    }
  }
}
