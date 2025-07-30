import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-footer-button',
  imports: [],
  templateUrl: './footer-button.component.html',
  styleUrl: './footer-button.component.css'
})
export class FooterButtonComponent {
  @Input() text: string = 'Submit';
  @Output() click: EventEmitter<any> = new EventEmitter();

  emit() {
    this.click.emit();
  }
}
