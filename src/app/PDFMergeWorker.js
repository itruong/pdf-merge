import pdf from 'pdfjs';


export const mergePdfs = async (files) => {
  const doc = new pdf.Document();
  for (const file of files) {
    const src = await new Response(file.data).arrayBuffer();
    const ext = new pdf.ExternalDocument(src);
    doc.addPagesOf(ext);
  }
  const buffer = await doc.asBuffer();
  const mergedFile = new Blob([buffer], {type: 'application/pdf'});
  return mergedFile;
};
