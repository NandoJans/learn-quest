import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import {NgIf} from '@angular/common';
import {faQuestion} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-button',
  imports: [
    FaIconComponent,
    NgIf
  ],
  templateUrl: './side-button.component.html',
  styleUrl: './side-button.component.css'
})
export class SideButtonComponent {
  @Input() icon: IconDefinition | null | undefined = null;
  @Output() click: EventEmitter<any> = new EventEmitter();
  @Input() disabled: boolean = false;
  @Input() btnClass: string = '';
  @Input() text: string = '';

  emit(event: any) {
    this.click.emit(event);
  }

  isIcon(): boolean {
    return this.icon !== null && this.icon !== undefined;
  }

  getIcon(): IconDefinition {
    return this.icon || faQuestion;
  }
}
