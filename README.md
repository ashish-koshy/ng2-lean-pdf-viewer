This is a very simple PDF viewer implementation in Angular 11 based on the PDFjs library from Mozilla. Its a great place to start for anybody who is looking to build on top of the most basic features like Canvas layer + Text layer rendering which have already been implemented for you.

Two important features of this implementation:
- It leverages Angular's built in 'Renderer' module to modify PDF page elements in a safe way without the need to have any direct access to the DOM.
- It lazy loads or lazy renders every page i.e a canvas layer or text layer for any given page is only added to the DOM when the page container is inside the viewport. This is helpful in avoiding memory leaks when you need to render very large documents. Creating 100 canvases for 100 pages would easily cause low powered devices like phones or tablets to run out of memory.

Please refer to the `app-component.ts` file to learn how to integrate or load PDFs.

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
