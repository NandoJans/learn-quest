import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {RoleSwitcherComponent} from './components/role-switcher/role-switcher.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FontAwesomeModule, RoleSwitcherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'learn-quest-app';

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas); // add all solid icons
  }
}
