import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysMemeComponent } from './todays-meme.component';

describe('TodaysMemeComponent', () => {
  let component: TodaysMemeComponent;
  let fixture: ComponentFixture<TodaysMemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodaysMemeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodaysMemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
