import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MathBasicComponent } from './math-basic.component';

describe('MathBasicComponent', () => {
  let component: MathBasicComponent;
  let fixture: ComponentFixture<MathBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MathBasicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MathBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
