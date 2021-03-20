import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { Ng2LeanPdfViewerModule } from './ng2-lean-pdf-viewer/ng2-lean-pdf-viewer.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Ng2LeanPdfViewerModule
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
