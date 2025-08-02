import { Component, Input } from '@angular/core';
import {FaIconComponent, FaIconLibrary, IconDefinition} from "@fortawesome/angular-fontawesome";
import {faQuestion} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-icon',
    imports: [
        FaIconComponent
    ],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css'
})
export class IconComponent {
  @Input() faIcon: string = '';
  @Input() color: string = '#000000';

  constructor(
    public iconLibrary: FaIconLibrary,
  ) {
  }

  getIcon(): IconDefinition {
    return this.iconLibrary.getIconDefinition('fas', this.faIcon) || faQuestion
  }
}
