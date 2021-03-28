# Ng2LeanPdfViewer

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.6.

This is a very simple PDF viewer implementation in Angular 11 based on the PDFjs library from Mozilla. Its a great place to start for anybody who is looking to build on top of the most basic features like Canvas layer + Text layer rendering which have already been implemented for you.

Two important features of this implementation:
- It leverages Angular's built in 'Renderer' module to modify PDF page elements in a safe way without the need to have any direct access to the DOM.
- It lazy loads or lazy renders every page i.e a canvas layer or text layer for any given page is only added to the DOM when the page container is inside the viewport. This is helpful in avoiding memory leaks when you need to render very large documents. Creating 100 canvases for 100 pages would easily cause low powered devices like phones or tablets to run out of memory.

## Installation:
```
npm i @ashish-koshy/ng2-lean-pdf-viewer
```

## Add 'ng2-lean-pdf-viewer' to your app.module.ts:
```
import { Ng2LeanPdfViewerModule } from 'ng2-lean-pdf-viewer';

@NgModule({
  imports: [
    Ng2LeanPdfViewerModule
  ]
});
```

## Add the component selector to your template:
```
<ng2-lean-pdf-viewer 
    [pdfInput]="pdfSource" 
    (onError)="onError($event)"
    (onProgress)="onProgress($event)"
    (onPageRendered)="onPageRendered($event)" 
>
</ng2-lean-pdf-viewer>
```

## Input data model, for instance, if 'pdfSource' is your input variable:

```
import { CustomPDFInput } from 'ng2-lean-pdf-viewer';

pdfSource: CustomPDFInput = {
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
  src: string | TypedArray = '';
  
  /** In case the PDF file has access restrictions, provide your authentication token here (For e.g: JWT)  */
  authToken = '';

  /** This is optional, it defaults to the value below. You can use any other PDF worker hosted within your own private CDN */
  pdfWorkerUrl = '';
}
```
