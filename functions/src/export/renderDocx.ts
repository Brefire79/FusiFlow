import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import type { ProjectBundle } from './buildProjectBundle';

/**
 * Gera um DOCX e retorna como Buffer.
 */
export async function renderDocx(bundle: ProjectBundle): Promise<Buffer> {
  const p = bundle.project;

  const children: Paragraph[] = [
    new Paragraph({
      text: 'FusiFlow',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Gestão de Projetos AMB FUSI AÍ', italics: true, size: 20 }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: p.title || 'Projeto', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      children: [
        new TextRun({ text: `Status: ${p.status}  |  Fase: ${p.phase}  |  Versão: ${p.version}`, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Tags: ${(p.tags || []).join(', ')}`, size: 20 }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: 'Documentos', heading: HeadingLevel.HEADING_2 }),
  ];

  for (const doc of bundle.docs) {
    children.push(
      new Paragraph({ text: doc.title || 'Sem título', heading: HeadingLevel.HEADING_3 }),
    );
    // Split content into paragraphs
    const lines = (doc.content || '').split('\n');
    for (const line of lines) {
      children.push(new Paragraph({ children: [new TextRun({ text: line, size: 22 })] }));
    }
    children.push(new Paragraph({ text: '' }));
  }

  // History
  if (bundle.history.length > 0) {
    children.push(new Paragraph({ text: 'Histórico', heading: HeadingLevel.HEADING_2 }));
    for (const h of bundle.history.slice(0, 20)) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${h.at}] ${h.actorName}: ${h.changesSummary}`,
              size: 18,
            }),
          ],
        }),
      );
    }
  }

  const docx = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(docx));
}
