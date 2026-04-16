import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generateDoctorReportPDF(data: any) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('SafeStack Doktor Raporu', 14, 22);
  
  // Summary
  doc.setFontSize(12);
  doc.text(`Kişi: ${data.personName || 'Bilinmiyor'}`, 14, 32);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 38);
  doc.text(`Toplam İlaç: ${data.items?.length || 0}`, 14, 44);
  
  // Items Table
  doc.setFontSize(14);
  doc.text('İlaç Listesi', 14, 55);
  
  const itemRows = data.items?.map((item: any) => [
    item.drug_name,
    item.dosage || '-',
    item.frequency || '-',
    item.item_type || '-'
  ]) || [];
  
  (doc as any).autoTable({
    startY: 60,
    head: [['İlaç Adı', 'Dozaj', 'Sıklık', 'Tür']],
    body: itemRows,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [200, 200, 200], textColor: 20 }
  });
  
  // Interactions
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Etkileşim Analizi', 14, finalY);
  
  const interactionRows = data.interactions?.map((int: any) => [
    `${int.drug_a} + ${int.drug_b}`,
    int.severity,
    int.mechanism || '-',
    int.symptoms_to_watch || '-'
  ]) || [];
  
  (doc as any).autoTable({
    startY: finalY + 5,
    head: [['İlaç Çifti', 'Şiddet', 'Mekanizma', 'Belirtiler']],
    body: interactionRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [200, 200, 200], textColor: 20 }
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      'Bu rapor SafeStack ile oluşturulmuştur. Tıbbi tavsiye değildir. Lütfen doktorunuza danışın.',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  doc.save('SafeStack_Rapor.pdf');
}
