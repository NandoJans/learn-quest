import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveWidgetComponent } from './interactive-widget.component';

describe('InteractiveWidgetComponent', () => {
  let component: InteractiveWidgetComponent;
  let fixture: ComponentFixture<InteractiveWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractiveWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
