import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm',
  imports: [],
  templateUrl: './confirm.html',
  styleUrl: './confirm.css'
})
export class Confirm {
  close: (result?: any) => void = () => {};

  confirm() {
    this.close(true);
  }

  cancel() {
    this.close(false);
  }
}
