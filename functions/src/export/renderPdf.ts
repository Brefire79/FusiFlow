import PDFDocument from 'pdfkit';
import type { ProjectBundle } from './buildProjectBundle';

/**
 * Gera um PDF e retorna como Buffer.
 */
export function renderPdf(bundle: ProjectBundle): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc
      .fontSize(24)
      .fillColor('#D07D5F')
      .text('FusiFlow', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor('#938586')
      .text('Gestão de Projetos AMB FUSI AÍ', { align: 'center' })
      .moveDown(1.5);

    // Project info
    const p = bundle.project;
    doc.fontSize(18).fillColor('#D4CCC0').text(p.title || 'Projeto').moveDown(0.5);
    doc.fontSize(10).fillColor('#938586');
    doc.text(`Status: ${p.status}  |  Fase: ${p.phase}  |  Versão: ${p.version}`);
    doc.text(`Tags: ${(p.tags || []).join(', ')}`);
    doc.text(`Membros: ${(p.members || []).length}`);
    doc.moveDown(1);

    // Docs
    doc.fontSize(14).fillColor('#2ABEDD').text('Documentos').moveDown(0.5);
    for (const d of bundle.docs) {
      doc.fontSize(12).fillColor('#D4CCC0').text(d.title || 'Sem título').moveDown(0.3);
      doc.fontSize(9).fillColor('#938586').text(d.content || '', { lineGap: 2 });
      doc.moveDown(1);
    }

    // History (últimos 20)
    if (bundle.history.length > 0) {
      doc.addPage();
      doc.fontSize(14).fillColor('#2ABEDD').text('Histórico').moveDown(0.5);
      for (const h of bundle.history.slice(0, 20)) {
        doc
          .fontSize(9)
          .fillColor('#D4CCC0')
          .text(`[${h.at}] ${h.actorName}: ${h.changesSummary}`);
      }
    }

    doc.end();
  });
}
