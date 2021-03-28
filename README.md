This is a very simple PDF viewer implementation in Angular 11 based on the PDFjs library from Mozilla. Its a great place to start for anybody who is looking to build on top of the most basic features like Canvas layer + Text layer rendering which have already been implemented for you.

Two important features of this implementation:
- It leverages Angular's built in 'Renderer' module to modify PDF page elements in a safe way without the need to have any direct access to the DOM.
- It lazy loads or lazy renders every page i.e a canvas layer or text layer for any given page is only added to the DOM when the page container is inside the viewport. This is helpful in avoiding memory leaks when you need to render very large documents. Creating 100 canvases for 100 pages would easily cause low powered devices like phones or tablets to run out of memory.

# Component selector:
```
<ng2-lean-pdf-viewer 
    [pdfInput]="pdfSource" 
    (onError)="onError($event)"
    (onProgress)="onProgress($event)"
    (onPageRendered)="onPageRendered($event)" 
>
</ng2-lean-pdf-viewer>
```

# Input data model, for instance, if 'pdfSource' is your input variable:

```
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

# Ng2LeanPdfViewer

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
