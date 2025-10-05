import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {IconComponent} from '../../icon/icon.component';
import {fas} from '@fortawesome/free-solid-svg-icons';

interface IconItem {
  name: string;
}

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.css']
})
export class IconPickerComponent {
  // Provided by modal host
  close: (result?: any) => void = () => {};

  query = '';
  icons: IconItem[] = [];
  filtered: IconItem[] = [];
  selected: string | null = null;

  constructor(private lib: FaIconLibrary) {
    // Build a list of all icon names from the fas pack
    const pack: any = fas as any;
    const unique = new Set<string>();
    Object.values(pack).forEach((def: any) => {
      if (def && typeof def === 'object' && def.iconName) {
        unique.add(def.iconName);
      }
    });
    this.icons = Array.from(unique).sort().map(name => ({name}));
    this.filtered = this.icons;
  }

  applyFilter() {
    const q = this.query.trim().toLowerCase();
    this.filtered = !q
      ? this.icons
      : this.icons.filter(i => i.name.includes(q));
  }

  pick(name: string) {
    this.selected = name;
  }

  confirm() {
    if (this.selected) {
      this.close({icon: this.selected});
    }
  }

  cancel() {
    this.close(null);
  }
}
