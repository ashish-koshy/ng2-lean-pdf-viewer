import { Component } from '@angular/core';
import { CustomPDFInput, OnProgressData, CustomPDFPage } from 'ng2-lean-pdf-viewer';

@Component({
  selector: 'app-root',
  template: `
    <ng2-lean-pdf-viewer
      [pdfInput]="pdfSource"
      (onError)="onError($event)"
      (onProgress)="onProgress($event)"
      (onPageRendered)="onPageRendered($event)"
    >
    </ng2-lean-pdf-viewer>
  `
})
export class AppComponent {
  public title = 'test-app';
  public pdfSource: CustomPDFInput = {
    /**
     * The 'src' attribute could be any one of the following three types:
     *  
     * 1. A valid URL string that follows 'http:' or 'https:' protocols:
     * src: 'http://www.example.com/dummy.pdf'
     * 
     * 2. A base64 string that has a valid mime type prepended at the beginning:
     * src: 'data:application/pdf;base64,...'
     * 
     * 3. An 'arraybuffer' like the type 'Uint8Array'. You could type-cast your data as:
     * src: (yourData as Uint8Array)
     * 
     * */
    src: `http://${window.location.hostname}:${window.location.port}/assets/dummy.pdf`,
    /** In case the PDF file has access restrictions, provide your authentication token here (For e.g: JWT)  */
    authToken: '',
    /** This is optional, it defaults to the value below. You can use any other PDF worker hosted within your own private CDN */
    pdfWorkerUrl: ''
  }

  public onError($event: any): void {}
  public onProgress($event: OnProgressData): void {}
  public onPageRendered($event: CustomPDFPage): void {}
}
