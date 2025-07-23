import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {PrimaryButtonComponent} from '../../../components/buttons/primary-button/primary-button.component';

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
export class LoginComponent {
  usernameControl: FormControl = new FormControl('', Validators.required);
  passwordControl: FormControl = new FormControl('', Validators.required);

  loginForm: FormGroup = new FormGroup({
    username: this.usernameControl,
    password: this.passwordControl
  });

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

    console.log('username:', this.usernameControl.value);
    console.log('password:', this.passwordControl.value)
  }
}
