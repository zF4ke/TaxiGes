import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRegisteComponent } from './travel-registe.component';

describe('TravelRegisteComponent', () => {
  let component: TravelRegisteComponent;
  let fixture: ComponentFixture<TravelRegisteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TravelRegisteComponent]
    });
    fixture = TestBed.createComponent(TravelRegisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
