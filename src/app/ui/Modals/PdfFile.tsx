import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const PdfFile = ({ inode_id }: { inode_id: string }) => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [url, setUrl] = useState("");

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
  };

  fetch(`http://localhost:8000/api/gets3file/${inode_id}`, {
    cache: "no-store",
  })
    .then((response) => response.json())
    .then((data) => setUrl(data.url));

  return (
    <div className="flex flex-col justify-center items-center">
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <div className="p-5">
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={700}
            />
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PdfFile;
