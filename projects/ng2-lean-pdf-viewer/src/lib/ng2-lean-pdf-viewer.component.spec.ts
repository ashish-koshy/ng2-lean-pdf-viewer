import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ng2LeanPdfViewerComponent } from './ng2-lean-pdf-viewer.component';

describe('Ng2LeanPdfViewerComponent', () => {
  let component: Ng2LeanPdfViewerComponent;
  let fixture: ComponentFixture<Ng2LeanPdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Ng2LeanPdfViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Ng2LeanPdfViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
