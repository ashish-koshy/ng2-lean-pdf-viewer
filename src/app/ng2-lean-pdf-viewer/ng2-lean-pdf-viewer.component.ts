import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/display/api';
import { CustomPDFInput, CustomPDFPage } from './ng2-lean-pdf-viewer.models';
import { PageViewport } from 'pdfjs-dist/types/display/display_utils';
import { Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Util } from './utils';

import * as pdfjsLib from 'pdfjs-dist';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ng2-lean-pdf-viewer',
  template: `<div #pdfContainer class="pdf-container"></div>`
})
export class Ng2LeanPdfViewerComponent implements OnChanges {

  @Input()
  public pdfInput!: CustomPDFInput;

  @Output() public isLoading = new EventEmitter<boolean>();
  @Output() public errorMessage = new EventEmitter<string>();
  @Output() public pageDimensions = new EventEmitter<CustomPDFPage>();

  @ViewChild('pdfContainer') public pdfContainer!: ElementRef;

  private resizeTimer: any;
  private pdfData!: PDFDocumentProxy;

  constructor(private renderer: Renderer2) {}

  @HostListener('window:resize')
  public onResize(): void {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    if (typeof this.pdfData !== 'undefined') {
      this.resizeTimer = setTimeout(() => {
        this.removeAllPageNodes();
        this.renderPages(this.pdfData);
      }, 100);
    }
  }

  public ngOnChanges(change: SimpleChanges): void {
    this.isLoading.emit(true);
    const input: CustomPDFInput = Util.get(change, 'pdfInput.currentValue', new CustomPDFInput());
    if (input.url) {
      if (Util.isEmptyItem(input.pdfWorkerUrl)) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/es5/build/pdf.worker.js`;
      } else {
        pdfjsLib.GlobalWorkerOptions.workerSrc = input.pdfWorkerUrl;
      }
      this.fetchPdf(input);
    }
  }

  private fetchPdf(input: CustomPDFInput): void {
    this.normalize();
    pdfjsLib.getDocument({
      url: input.url,
      withCredentials: !Util.isEmptyItem(input.authToken),
      httpHeaders: (!Util.isEmptyItem(input.authToken) ? { Authorization: input.authToken } : '')
    }).promise.then(pdf => {
      this.isLoading.emit(false);
      this.renderPages(pdf);
    }).catch(err => this.errorMessage.emit(err));
  }

  private renderPages(pdf: PDFDocumentProxy): void {
    for (let i = 1; i <= pdf._pdfInfo.numPages; i++) {
      pdf.getPage(i).then(page => {
        const pdfContainer = this.pdfContainer.nativeElement;
        const viewport = this.getPageViewport(page);
        viewport.width = Math.floor(viewport.width);
        viewport.height = Math.floor(viewport.height);
        const pdfPage = new CustomPDFPage();
        pdfPage.id = i;
        pdfPage.width = viewport.width;
        pdfPage.height = viewport.height;
        this.pageDimensions.emit(pdfPage);
        const pageContainer: HTMLElement = this.renderer.createElement('div');
        this.renderer.setStyle(pageContainer, 'width', `${viewport.width}px`);
        this.renderer.setStyle(pageContainer, 'height', `${viewport.height}px`);
        this.renderer.appendChild(pdfContainer, pageContainer);
        /**
         * Only render canvas contents when the page is inside view-port
         * Not doing so would lead to memory leaks on mobile devices like tablets or phones
         * Especially while scrolling vertically
         */
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const canvas: HTMLCanvasElement = this.renderer.createElement('canvas');
              const canvasContext: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              page.cleanupAfterRender = true;
              page.render({ canvasContext, viewport }).promise.then(() => {
                this.renderer.appendChild(pageContainer, canvas);
              });
            } else {
              page.cleanup();
              page.destroyed = true;
              for (const child of Array.from(pageContainer.childNodes)) {
                this.renderer.removeChild(pageContainer, child);
              }
            }
          }, {
            threshold: [0, .1, .9, 1]
          });
        });
        observer.observe(pageContainer);
      });
    }
    this.pdfData = pdf;
  }

  private getPageViewport(page: PDFPageProxy): PageViewport {
    const viewport = page.getViewport({ scale: 1 });
    const scale = ((this.viewportWidth() * 0.99) / viewport.width);
    return page.getViewport({ scale });
  }

  private removeAllPageNodes(): void {
    if (this.pdfContainer) {
      const parent = (this.pdfContainer.nativeElement) as HTMLElement;
      for (const child of Array.from(parent.childNodes)) {
        this.renderer.removeChild(parent, child);
      }
    }
  }

  private normalize(): void {
    this.removeAllPageNodes();
  }

  private viewportWidth(): number {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  }

  private viewportHeighy(): number {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  }
}
