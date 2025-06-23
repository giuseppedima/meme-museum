import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsDisplayComponent } from './tags-display.component';

describe('TagsDisplayComponent', () => {
  let component: TagsDisplayComponent;
  let fixture: ComponentFixture<TagsDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
