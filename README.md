# Ng2LeanPdfViewer

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.6.

This is a very simple PDF viewer implementation in Angular 11 based on the PDFjs library from Mozilla. Its a great place to start for anybody who is looking to build on top of the most basic features like Canvas layer + Text layer rendering which have already been implemented for you.

Two important features of this implementation:
- It leverages Angular's built in 'Renderer' module to modify PDF page elements in a safe way without the need to have any direct access to the DOM.
- It lazy loads or lazy renders every page i.e a canvas layer or text layer for any given page is only added to the DOM when the page container is inside the viewport. This is helpful in avoiding memory leaks when you need to render very large documents. Creating 100 canvases for 100 pages would easily cause low powered devices like phones or tablets to run out of memory.

## Installation:
Clone the repository and install node/npm package manager on your system and then run the following command at the root folder:
```
npm install
```

## Debugging:
A 'test-app' has been included along with this project that directly links to the 'ng2-lean-pdf-viewer' project library files.
Any change you make within the library would automatically reload the test-app and would be refected in your browser:
```
npm start
```