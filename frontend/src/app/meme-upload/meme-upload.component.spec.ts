import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemeUploadComponent } from './meme-upload.component';

describe('MemeUploadComponent', () => {
  let component: MemeUploadComponent;
  let fixture: ComponentFixture<MemeUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemeUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemeUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
