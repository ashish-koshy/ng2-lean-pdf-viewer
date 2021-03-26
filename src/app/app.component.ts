import { Component } from '@angular/core';
import { CustomPDFInput, CustomPDFPage, OnProgressData } from './ng2-lean-pdf-viewer/pdf.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'app-root';
  pdfSource: CustomPDFInput = {
    /**
     * The 'src' attribute could be any one of the following three types:
     *  
     * 1. A valid URL string that follows 'http:' or 'https:' protocols:
     * src: 'http://localhost:4200/assets/dummy.pdf'
     * 
     * 2. A base64 encoded string that has a valid mime type prepended at the beginning:
     * src: 'data:application/pdf;base64,...'
     * 
     * 3. An 'arraybuffer' like the type 'Uint8Array'. You could type-cast your data as:
     * src: (yourData as Uint8Array)
     * 
     * */
    src: 'http://localhost:4200/assets/dummy.pdf',

    /** In case the PDF file has access restrictions, provide your authentication token here (For e.g: JWT)  */
    authToken: '',

    /** This is optional, it defaults to a freely hosted CDN url. You can use any other PDF worker hosted within your own private CDN */
    pdfWorkerUrl: ``
  };

  public onError(error: any): void {}
  public onProgress(status: OnProgressData): void {}
  public onPageRendered(status: CustomPDFPage): void {}
}
