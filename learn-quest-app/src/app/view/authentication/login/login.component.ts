import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {PrimaryButtonComponent} from '../../../components/buttons/primary-button/primary-button.component';
import {SecurityService} from '../../../services/security/security.service';
import {Router} from '@angular/router';
import {RoleService} from '../../../services/security/role.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  usernameControl: FormControl = new FormControl('', Validators.required);
  passwordControl: FormControl = new FormControl('', Validators.required);
  errorMessage: string | null = null;

  loginForm: FormGroup = new FormGroup({
    username: this.usernameControl,
    password: this.passwordControl
  });

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {
  }

  getInnerBorderColor() {
    if (this.loginForm.invalid && (this.loginForm.dirty || this.loginForm.touched)) {
      return 'border-color-1'
    } else {
      return 'border-color-2'
    }
  }

  getOuterBorderColor() {
    if (this.loginForm.invalid && (this.loginForm.dirty || this.loginForm.touched)) {
      return 'border-color-5'
    } else {
      return 'border-color-3'
    }
  }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const username = this.usernameControl.value;
    const password = this.passwordControl.value;

    this.securityService.login(username, password)
      .subscribe({
        next: (response) => {

        },
        error: (error) => {
          console.error('Login failed', error);
          this.updateErrorMessage(error);
          this.loginForm.markAllAsTouched();
        }
      });
  }

  private updateErrorMessage(error: any) {
    if (error.status === 401) {
      this.errorMessage = 'Invalid username or password.';
    } else if (error.status === 0) {
      this.errorMessage = 'Server is not reachable. Please try again later.';
    } else {
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }

  ngOnInit(): void {
    // Optionally, you can check if the user is already logged in and redirect them
    const token = this.securityService.getToken();
    if (token) {
      this.router.navigateByUrl('/user/dashboard');
    }
  }
}
