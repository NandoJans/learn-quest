import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleHostComponent } from './module-host.component';

describe('ModuleHostComponent', () => {
  let component: ModuleHostComponent;
  let fixture: ComponentFixture<ModuleHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
