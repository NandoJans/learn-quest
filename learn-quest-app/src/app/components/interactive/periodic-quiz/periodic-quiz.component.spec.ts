import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicQuizComponent } from './periodic-quiz.component';

describe('PeriodicQuizComponent', () => {
  let component: PeriodicQuizComponent;
  let fixture: ComponentFixture<PeriodicQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodicQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodicQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
