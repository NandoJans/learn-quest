import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {PrimaryButtonComponent} from '../../../components/buttons/primary-button/primary-button.component';
import {SecurityService} from '../../../services/security.service';
import {Router} from '@angular/router';

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
    if (this.loginForm.invalid) {
      return 'border-color-1'
    } else {
      return 'border-color-2'
    }
  }

  getOuterBorderColor() {
    if (this.loginForm.invalid) {
      return 'border-color-5'
    } else {
      return 'border-color-3'
    }
  }

  submit() {
    if (this.loginForm.invalid) return;

    const username = this.usernameControl.value;
    const password = this.passwordControl.value;

    this.securityService.login(username, password)
      .subscribe({
        next: (response) => {
          this.router.navigateByUrl('/user/dashboard');
        },
        error: (error) => {
          console.error('Login failed', error);
          // Handle login failure, e.g., show an error message
        }
      });
  }

  ngOnInit(): void {
    // Optionally, you can check if the user is already logged in and redirect them
    const token = this.securityService.getToken();
    if (token) {
      this.router.navigateByUrl('/user/dashboard');
    }
  }
}
