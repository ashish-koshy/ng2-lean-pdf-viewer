import { TypedArray } from "pdfjs-dist/types/display/api";

export class CustomPDFInput {
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

export class CustomPDFPage {
  /** Page number */
  id = 0;
  /** Current page width in pixels */
  width = 0;
  /** Current page height in pixels */
  height = 0;
}

export class OnProgressData {
  loaded = 0;
  total = 0;
}
