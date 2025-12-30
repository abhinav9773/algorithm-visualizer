async function exportPng() {
  const wrapper = document.getElementById("visualWrapper");
  const canvas = await html2canvas(wrapper);
  const link = document.createElement("a");
  link.download = "recursion_tree.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function exportPdf() {
  const wrapper = document.getElementById("visualWrapper");
  const canvas = await html2canvas(wrapper);
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape", "pt", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 80;
  const imgHeight = canvas.height * (imgWidth / canvas.width);

  pdf.addImage(
    imgData,
    "PNG",
    40,
    (pageHeight - imgHeight) / 2,
    imgWidth,
    imgHeight
  );
  pdf.save("recursion_tree.pdf");
}
