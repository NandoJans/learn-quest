import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-footer-button',
  imports: [],
  templateUrl: './footer-button.component.html',
  styleUrl: './footer-button.component.css'
})
export class FooterButtonComponent {
  @Input() text: string = 'Submit';
  /**
   * CSS class applied to the button. Defaults to Bootstrap's primary button.
   */
  @Input() btnClass: string = 'btn-primary';
  /**
   * Whether the button is disabled.
   */
  @Input() disabled: boolean = false;
  @Output() click: EventEmitter<any> = new EventEmitter();

  emit() {
    // Even though a disabled button won't emit click events, this check
    // guards against programmatic calls to emit when disabled.
    if (!this.disabled) {
      this.click.emit();
    }
  }
}
