import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { Renderer2, SimpleChanges } from '@angular/core';

import { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, TextContent } from 'pdfjs-dist/types/display/api';
import { PageViewport } from 'pdfjs-dist/types/display/display_utils';
import * as pdfjsLib from 'pdfjs-dist';

import { passwordResponses, unsupportedFeatures, logTypes } from './pdf.enums';
import { CustomPDFInput, CustomPDFPage, OnProgressData } from './pdf.models';
import { Util } from './pdf.utils';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ng2-lean-pdf-viewer',
  styleUrls: ['../../../../node_modules/pdfjs-dist/web/pdf_viewer.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
  template: ''
})
export class Ng2LeanPdfViewerComponent implements OnChanges {
  
  public title = 'ng2-lean-pdf-viewer';

  @Input() public pdfInput!: CustomPDFInput;
  @Output() public onError = new EventEmitter<any>();
  @Output() public onProgress = new EventEmitter<OnProgressData>();
  @Output() public onPageRendered = new EventEmitter<CustomPDFPage>();

  private resizeTimer: any;
  private pdfContainer!: HTMLElement;
  private pdfData!: PDFDocumentProxy;
  private lastVisiblePageIndex = -1;

  constructor(private parentContainer: ElementRef, private renderer: Renderer2) {
    this.pdfContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.pdfContainer, 'pdfViewer');
    this.renderer.setAttribute(this.pdfContainer, 'id', 'viewer');
    this.renderer.setAttribute(this.parentContainer.nativeElement, 'tabindex', '0');
    this.renderer.setAttribute(this.parentContainer.nativeElement, 'id', 'viewerContainer');
    this.renderer.appendChild(this.parentContainer.nativeElement, this.pdfContainer);
  }

  @HostListener('window:resize')
  public onResize(): void {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => this.onWindowResized(), 10);
  }

  public ngOnChanges(change: SimpleChanges): void {
    this.loadPdf(Util.get(change, 'pdfInput.currentValue', new CustomPDFInput()));
  }

  private loadPdf(input: CustomPDFInput): void {
    if (!Util.isEmptyItem(input.src)) {
      this.lastVisiblePageIndex = -1;
      this.removeAllPageNodes();
      this.setPdfWorkerUrl(input);
      const loadParameters = this.getPdfLoadParameters(input); 
      const loadingTask: PDFDocumentLoadingTask = pdfjsLib.getDocument(loadParameters);
      loadingTask.promise.then(pdf => this.generatePages(pdf)).catch(err => this.setErrorData(err));
      /** TODO */ loadingTask.onProgress = ((loadProgress: OnProgressData) => this.setProgressData(loadProgress));
      /** TODO */ loadingTask.onPassword = ((callback: Function, response: passwordResponses) => this.log('Password response : ', response));
      /** TODO */ loadingTask.onUnsupportedFeature = ((feature: unsupportedFeatures) => this.log('Unsupported feature : ', feature, logTypes.warning));
      /** TODO */ loadingTask.destroyed;
      /** TODO */ loadingTask.docId;
    }
  }

  private getPdfLoadParameters(input: CustomPDFInput): any  {
    let loadParameters: any = {};
    if(Util.isValidBase64String(input.src)) {
      loadParameters = { data: atob(input.src.slice(28) as string) };
    } else if (Util.isValidUrlString(input.src)) {
      loadParameters = {
        url: input.src,
        withCredentials: !Util.isEmptyItem(input.authToken),
        httpHeaders: (!Util.isEmptyItem(input.authToken) ? { Authorization: input.authToken } : '')
      };
    } else {
      loadParameters = { data: input.src };
    }
    return loadParameters;
  }

  private generatePages(pdf: PDFDocumentProxy): void {
    this.lastVisiblePageIndex = -1;
    for (let i = 1; i <= pdf._pdfInfo.numPages; i++) {
      pdf.getPage(i).then(page => {
        const pdfContainer = this.pdfContainer;
        const viewport = this.getPageViewport(page);
        viewport.width = Math.floor(viewport.width);
        viewport.height = Math.floor(viewport.height);
        const pdfPage = new CustomPDFPage();
        pdfPage.id = i;
        pdfPage.width = viewport.width;
        pdfPage.height = viewport.height;
        this.setPageInfo(pdfPage);
        const pageContainer: HTMLElement = this.renderer.createElement('div');
        this.renderer.addClass(pageContainer, 'page');
        this.renderer.setStyle(pageContainer, 'width', `${viewport.width}px`);
        this.renderer.setStyle(pageContainer, 'height', `${viewport.height}px`);
        this.renderer.setAttribute(pageContainer, 'data-page-number', i.toString());
        this.renderer.setAttribute(pageContainer, 'aria-label', `Page ${i.toString()}`);
        this.renderer.appendChild(pdfContainer, pageContainer);
        this.renderPage(page, pageContainer, viewport);
      });
    }
    this.pdfData = pdf;
  }

  /**
   * Page elements like canvas, text or annotation layers should be removed from the 
   * DOM when they are not visible inside the view-port. Not doing so could lead
   * to memory leaks on mobile devices like tablets or phones.
   */
  private renderPage(page: PDFPageProxy, pageContainer: HTMLElement, viewport: PageViewport): void {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.lastVisiblePageIndex = page.pageNumber;
          const canvasWrapper: HTMLCanvasElement = this.renderer.createElement('div');
          this.renderer.addClass(canvasWrapper, 'canvasWrapper');
          this.renderer.setStyle(canvasWrapper, 'width', `${viewport.width}px`);
          this.renderer.setStyle(canvasWrapper, 'height', `${viewport.height}px`);
          const canvas: HTMLCanvasElement = this.renderer.createElement('canvas');
          const canvasContext: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          page.cleanupAfterRender = true;
          this.renderer.appendChild(canvasWrapper, canvas);
          page.render({ canvasContext, viewport }).promise.then(() => {
            this.renderer.appendChild(pageContainer, canvasWrapper);
            this.renderer.setAttribute(pageContainer, 'data-loaded', 'true');
          });
          page.getTextContent().then((textContent: TextContent) => {
            const textLayerWrapper: HTMLCanvasElement = this.renderer.createElement('div');
            this.renderer.addClass(textLayerWrapper, 'textLayer');
            this.renderer.setStyle(textLayerWrapper, 'width', `${viewport.width}px`);
            this.renderer.setStyle(textLayerWrapper, 'height', `${viewport.height}px`);
            const textDivs: HTMLElement[] = [];
            pdfjsLib.renderTextLayer({ textContent, container: textLayerWrapper, viewport, textDivs }).promise.then(() => {
              this.renderer.appendChild(pageContainer, textLayerWrapper);
            });
          });
        } else if(page.pageNumber !== this.lastVisiblePageIndex 
                  && (page.pageNumber !== this.lastVisiblePageIndex - 1) 
                    && (page.pageNumber !== this.lastVisiblePageIndex + 1)) {
          page.cleanup();
          page.destroyed = true;
          this.renderer.removeAttribute(pageContainer, 'data-loaded');
          Array.from(pageContainer.childNodes).forEach(child => this.renderer.removeChild(pageContainer, child));
        }
      }, {
        threshold: [0.0]
      });
    });
    observer.observe(pageContainer);
  }

  private onWindowResized(): void {
    if (typeof this.pdfData !== 'undefined') {
      this.removeAllPageNodes();
      this.generatePages(this.pdfData); 
    }
  }

  private getPageViewport(page: PDFPageProxy): PageViewport {
    const viewport = page.getViewport({ scale: 1 });
    const scale = ((this.getContainerWidth() * 0.99) / viewport.width);
    return page.getViewport({ scale });
  }

  private removeAllPageNodes(): void {
    if (this.pdfContainer) {
      const pdfContainer = this.pdfContainer;
      Array.from(pdfContainer.childNodes).forEach(child => this.renderer.removeChild(pdfContainer, child));
    }
  }

  private getContainerWidth(): number {
    const parentContainer = this.parentContainer.nativeElement.parentElement;
    const parentWidth = parseFloat(Util.get(window.getComputedStyle(parentContainer), 'width', '0px'));
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return (parentWidth || viewportWidth || window.screen.availWidth);
  }

  private setPdfWorkerUrl(input: CustomPDFInput): void {
    if (Util.isEmptyItem(input.pdfWorkerUrl)) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/es5/build/pdf.worker.js`;
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = input.pdfWorkerUrl;
    }
  }

  private setPageInfo(page: CustomPDFPage): void {
    this.log('Page : ', page);
    this.onPageRendered.emit(page);
  }

  private setErrorData(error: any): void {
    this.log('Error : ', error, logTypes.error);
    this.onError.emit(error);
  }

  private setProgressData(data: OnProgressData): void {
    this.log('Progress : ', data);
    this.onProgress.emit(data);
  }

  private log(message: string, data: any, type: logTypes = logTypes.info): void {
    const meta: string = `ng2-lean-pdf-viewer >> ${message}` ;
    switch(type) {
      case logTypes.error: 
      case logTypes.exception:
        console.error(meta, data);
        break;
      case logTypes.warning:
        console.warn(meta, data);
        break;
      default:
        console.log(meta, data);
        return;
    }
  }
}
