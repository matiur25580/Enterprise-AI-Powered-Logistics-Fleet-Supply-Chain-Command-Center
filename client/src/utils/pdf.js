import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
export function exportPDF(title, head, body, filename){
  const doc = new jsPDF();
  doc.setFontSize(14); doc.text(title, 14, 16);
  doc.setFontSize(9); doc.text('FleetCommand - ' + new Date().toLocaleString(), 14, 22);
  autoTable(doc, {head:[head], body:body, startY:28, styles:{fontSize:8}});
  doc.save(filename);
}
