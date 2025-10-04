import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigBangTimeSliderComponent } from './big-bang-time-slider.component';

describe('BigBangTimeSliderComponent', () => {
  let component: BigBangTimeSliderComponent;
  let fixture: ComponentFixture<BigBangTimeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigBangTimeSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BigBangTimeSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
