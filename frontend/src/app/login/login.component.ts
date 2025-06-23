import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../_services/auth/auth.service';
import { RestBackendService } from '../_services/rest-backend/rest-backend.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  toastr = inject(ToastrService);
  router = inject(Router);
  restService = inject(RestBackendService);
  authService = inject(AuthService);
  loginForm = new FormGroup({
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
    ])
  });
  
  handleLogin() {
    if(this.loginForm.valid){
      this.restService.login({
        usr: this.loginForm.value.user as string,
        pwd: this.loginForm.value.pass as string,
      }).subscribe({
        next: (token) => {
          this.authService.updateToken(token).then(() => {
            this.toastr.success(`You're successfully authenticated`,`Welcome ${this.loginForm.value.user}!`);
            setTimeout(() => {this.router.navigateByUrl("/")}, 10);
          });
        },
        error: (err) => {
          this.toastr.error(err.error.message,"Error during login");
        },
        complete: () => {}
      });
    }
  }
}
