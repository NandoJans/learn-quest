import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveModuleLibraryComponent } from './interactive-module-library.component';

describe('InteractiveModuleLibraryComponent', () => {
  let component: InteractiveModuleLibraryComponent;
  let fixture: ComponentFixture<InteractiveModuleLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveModuleLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractiveModuleLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
