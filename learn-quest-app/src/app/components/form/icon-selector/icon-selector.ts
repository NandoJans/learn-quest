import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IconComponent} from '../../icon/icon.component';
import {ModalService} from '../../../services/modal/modal.service';
import {IconPickerComponent} from './icon-picker.component';

@Component({
  selector: 'app-icon-selector',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './icon-selector.html',
  styleUrl: './icon-selector.css'
})
export class IconSelectorComponent {
  @Input() name = 'faIcon';
  @Input() value: string | undefined = undefined;
  @Input() label = 'Icon';
  @Output() valueChange = new EventEmitter<string>();
  @Input() class: string = '';
  @Input() btnClass: string = 'btn-3';
  @Input() showLabel: boolean = true;

  constructor(private modal: ModalService) {}

  async openPicker() {
    const res = await this.modal.open(IconPickerComponent);
    if (res && res.icon) {
      this.value = res.icon;
      this.valueChange.emit(this.value);
    }
  }
}
