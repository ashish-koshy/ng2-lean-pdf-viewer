import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2LeanPdfViewerComponent } from './ng2-lean-pdf-viewer.component';

@NgModule({
  declarations: [
    Ng2LeanPdfViewerComponent
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
    Ng2LeanPdfViewerComponent
  ],
  exports: [
    Ng2LeanPdfViewerComponent
  ]
})
export class Ng2LeanPdfViewerModule { }
