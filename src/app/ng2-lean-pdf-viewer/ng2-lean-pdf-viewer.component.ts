import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { Renderer2, SimpleChanges, ViewChild } from '@angular/core';

import { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy, TextContent } from 'pdfjs-dist/types/display/api';
import { PageViewport } from 'pdfjs-dist/types/display/display_utils';
import * as pdfjsLib from 'pdfjs-dist';

import { passwordResponses, unsupportedFeatures, logTypes } from './pdf.enums';
import { CustomPDFInput, CustomPDFPage, OnProgressData } from './pdf.models';
import { Util } from './pdf.utils';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ng2-lean-pdf-viewer',
  templateUrl: './ng2-lean-pdf-viewer.component.html',
  styleUrls: ['./ng2-lean-pdf-viewer.component.scss']
})
export class Ng2LeanPdfViewerComponent implements OnChanges {
  
  public title = 'ng2-lean-pdf-viewer';

  @Input() public pdfInput!: CustomPDFInput;
  @Output() public onError = new EventEmitter<any>();
  @Output() public onProgress = new EventEmitter<OnProgressData>();
  @Output() public onPageRendered = new EventEmitter<CustomPDFPage>();
  @ViewChild('pdfContainer') public pdfContainer!: ElementRef;

  private resizeTimer: any;
  private pdfData!: PDFDocumentProxy;

  constructor(private container: ElementRef, private renderer: Renderer2) {}

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
        this.setPageData(pdfPage);
        const pageContainer: HTMLElement = this.renderer.createElement('div');
        this.renderer.setStyle(pageContainer, 'width', `${viewport.width}px`);
        this.renderer.setStyle(pageContainer, 'height', `${viewport.height}px`);
        this.renderer.appendChild(pdfContainer, pageContainer);
        this.renderPage(page, pageContainer, viewport);
      });
    }
    this.pdfData = pdf;
  }

  /**
   * Only render canvas contents when the page is inside view-port
   * Not doing so would lead to memory leaks on mobile devices like tablets or phones
   * Especially while scrolling vertically
   */
  private renderPage(page: PDFPageProxy, pageContainer: HTMLElement, viewport: PageViewport): void {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const canvas: HTMLCanvasElement = this.renderer.createElement('canvas');
          const canvasContext: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          page.cleanupAfterRender = true;;
          page.render({ canvasContext, viewport }).promise.then(() => this.renderer.appendChild(pageContainer, canvas));
          /** TODO :: Create selectable text layer */
          // page.getTextContent().then((textContent: TextContent) => {
          //   const textDivs: HTMLElement[] = [];
          //   const container: HTMLCanvasElement = this.renderer.createElement('div');
          //   this.renderer.setAttribute(container, 'id', 'text-select');
          //   this.renderer.setStyle(container, 'top', `${canvas.offsetTop}px`);
          //   this.renderer.setStyle(container, 'left', `${canvas.offsetLeft}px`);
          //   this.renderer.setStyle(container, 'width', `${canvas.width}px`);
          //   this.renderer.setStyle(container, 'height', `${canvas.height}px`);
          //   pdfjsLib.renderTextLayer({ textContent, container, viewport, textDivs }).promise.then(() => this.renderer.appendChild(pageContainer, container));
          // });
        } else {
          page.cleanup();
          page.destroyed = true;
          Array.from(pageContainer.childNodes).forEach(child => this.renderer.removeChild(pageContainer, child));
        }
      }, {
        threshold: [0, .1, .9, 1]
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
      const pdfContainer = (this.pdfContainer.nativeElement) as HTMLElement;
      Array.from(pdfContainer.childNodes).forEach(child => this.renderer.removeChild(pdfContainer, child));
    }
  }

  private getContainerWidth(): number {
    const parentContainer = this.container.nativeElement.parentElement;
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

  private setPageData(page: CustomPDFPage): void {
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
