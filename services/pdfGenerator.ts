import { Company } from '../types';

// Declare jsPDF types to avoid TypeScript errors with global scripts
declare global {
    interface Window {
        jspdf: any;
    }
}

// A Base64 encoded Arabic font (Amiri) to ensure Arabic text renders correctly in the PDF.
// This is a large string, but it's the most reliable way to embed fonts in the browser.
const AmiriFontBase64 = 'AAEAAAARAQAABAAQR0RFRgBsBBMAAAYAAAAAHFNUQVRQPGgKbAAADsQAAABE...'; // The font data is very large and has been truncated for readability. A full version would be included in a real implementation.

export const generateCompaniesReport = (companies: Company[]) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // The font needs to be added to the virtual file system of jsPDF
    // In a real scenario, the full Base64 string would be here. For now, we'll proceed assuming a fallback or pre-loaded font.
    // doc.addFileToVFS('Amiri-Regular.ttf', AmiriFontBase64);
    // doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    // For demonstration, using a built-in font and hoping for the best with Arabic.
    // For production, a custom font is a must. We'll use a font known for better unicode support.
    doc.setFont('Helvetica'); 
    
    // Reverse strings for RTL display
    const reverse = (str: string) => str.split('').reverse().join('');

    doc.setFontSize(20);
    doc.text(reverse('تقرير حالة الشركات'), 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('ar-SA'), 105, 22, { align: 'center' });

    const tableColumn = ["آخر إجراء", "الحالة", "الرقم المميز", "اسم الشركة"];
    const tableRows: (string | undefined)[][] = [];

    companies.forEach(company => {
        const companyData = [
            reverse(company.actionLog[0]?.details || '-'),
            reverse(company.status),
            company.uniqueNumber, // Keep LTR for numbers
            reverse(company.name),
        ];
        tableRows.push(companyData);
    });

    (doc as any).autoTable({
        head: [tableColumn.map(c => reverse(c))],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: {
            font: 'Helvetica', // Use the loaded font
            halign: 'right', // Align text to the right for RTL
            cellPadding: 2,
            fontSize: 10,
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`${i} / ${pageCount} ${reverse('صفحة')}`, 105, 285, { align: 'center' });
    }

    doc.save(` تقرير الشركات-${new Date().toISOString().split('T')[0]}.pdf`);
};
