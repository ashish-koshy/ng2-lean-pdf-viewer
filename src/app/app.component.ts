import { Component } from '@angular/core';
import { CustomPDFInput, CustomPDFPage } from './ng2-lean-pdf-viewer/ng2-lean-pdf-viewer.models';

import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'ng2-lean-pdf-viewer';

  public pdfSource: CustomPDFInput = {
    /** URL to the PDF document */
    url: 'assets/dummy.pdf',
    /** Auth token if needed (Like a JWT) */
    authToken: '',
    /** This is optional, it defaults to the value below. You can use any other PDF worker hosted at CDN */
    pdfWorkerUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/es5/build/pdf.worker.js`
  };

  public setLoadingStatus(status: boolean): void {
    console.log(`PDF loading : ${status}`);
  }

  public setPageDimensions(page: CustomPDFPage): void {
    console.log(`PDF page info :`);
    console.log(page);
  }
}
