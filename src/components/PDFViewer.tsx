// PdfViewer.js
import React, { useState, useEffect} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

const PdfViewer = ({ pdfFileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onLoadError = (error) => {
    setError(error);
  };
 
  const updateCanvasDimensions = () => {
    setCanvasDimensions({
      width: window.innerWidth-50,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    updateCanvasDimensions();

    window.addEventListener('resize', updateCanvasDimensions);

    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  // 2.11.338 4.4.168
  // console.log("pdf-version "+`${pdfjs.version}`);
  // pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

  return (
    <div>
      {error ? (
        <p>Error: {error.message}</p>
      ) : (
        <Document
          file={pdfFileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onLoadError}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                scale={0.8}
            />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PdfViewer;