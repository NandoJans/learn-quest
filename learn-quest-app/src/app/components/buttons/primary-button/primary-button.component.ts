import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-primary-button',
  imports: [],
  templateUrl: './primary-button.component.html',
  styleUrl: './primary-button.component.css'
})
export class PrimaryButtonComponent {
  @Input() text: string = 'Submit';
  @Output() click: EventEmitter<any> = new EventEmitter();

  emit() {
    this.click.emit();
  }
}
