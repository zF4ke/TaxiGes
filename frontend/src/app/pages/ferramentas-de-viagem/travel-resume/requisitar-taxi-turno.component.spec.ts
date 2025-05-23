import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelResumeComponent } from './travel-resume.component';

describe('TravelResumeComponent', () => {
  let component: TravelResumeComponent;
  let fixture: ComponentFixture<TravelResumeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TravelResumeComponent]
    });
    fixture = TestBed.createComponent(TravelResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
