import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-primary-button',
  imports: [],
  templateUrl: './primary-button.component.html',
  styleUrl: './primary-button.component.css'
})
export class PrimaryButtonComponent {
  @Input() text: string = 'Submit';
  @Output() pressed: EventEmitter<void> = new EventEmitter<void>();

  emit(): void {
    this.pressed.emit();
  }
}
