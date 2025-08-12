import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveWidgetLibraryComponent } from './interactive-widget-library.component';

describe('InteractiveWidgetLibraryComponent', () => {
  let component: InteractiveWidgetLibraryComponent;
  let fixture: ComponentFixture<InteractiveWidgetLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveWidgetLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractiveWidgetLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
