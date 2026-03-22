import jsPDF from "jspdf";

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadPdfReport(params: {
  filename: string;
  title: string;
  subtitle?: string;
  takeaways: string[];
  insights: string[];
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;

  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(params.title, margin, y);
  y += 20;

  if (params.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(params.subtitle, margin, y);
    doc.setTextColor(0);
    y += 18;
  }

  function addSection(title: string, lines: string[]) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    y += 18;
    doc.text(title, margin, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(`• ${line}`, maxWidth);
      for (const w of wrapped) {
        if (y > 760) {
          doc.addPage();
          y = 64;
        }
        doc.text(w, margin, y);
        y += 14;
      }
    }
  }

  addSection("Key takeaways", params.takeaways);
  addSection("Insights", params.insights);

  doc.save(params.filename);
}

