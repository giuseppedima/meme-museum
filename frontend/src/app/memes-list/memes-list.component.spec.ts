import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemesListComponent } from './memes-list.component';

describe('MemesListComponent', () => {
  let component: MemesListComponent;
  let fixture: ComponentFixture<MemesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
