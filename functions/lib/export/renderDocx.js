"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDocx = renderDocx;
const docx_1 = require("docx");
/**
 * Gera um DOCX e retorna como Buffer.
 */
async function renderDocx(bundle) {
    const p = bundle.project;
    const children = [
        new docx_1.Paragraph({
            text: 'FusiFlow',
            heading: docx_1.HeadingLevel.TITLE,
            alignment: docx_1.AlignmentType.CENTER,
        }),
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            children: [
                new docx_1.TextRun({ text: 'Gestão de Projetos AMB FUSI AÍ', italics: true, size: 20 }),
            ],
        }),
        new docx_1.Paragraph({ text: '' }),
        new docx_1.Paragraph({ text: p.title || 'Projeto', heading: docx_1.HeadingLevel.HEADING_1 }),
        new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({ text: `Status: ${p.status}  |  Fase: ${p.phase}  |  Versão: ${p.version}`, size: 20 }),
            ],
        }),
        new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({ text: `Tags: ${(p.tags || []).join(', ')}`, size: 20 }),
            ],
        }),
        new docx_1.Paragraph({ text: '' }),
        new docx_1.Paragraph({ text: 'Documentos', heading: docx_1.HeadingLevel.HEADING_2 }),
    ];
    for (const doc of bundle.docs) {
        children.push(new docx_1.Paragraph({ text: doc.title || 'Sem título', heading: docx_1.HeadingLevel.HEADING_3 }));
        // Split content into paragraphs
        const lines = (doc.content || '').split('\n');
        for (const line of lines) {
            children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: line, size: 22 })] }));
        }
        children.push(new docx_1.Paragraph({ text: '' }));
    }
    // History
    if (bundle.history.length > 0) {
        children.push(new docx_1.Paragraph({ text: 'Histórico', heading: docx_1.HeadingLevel.HEADING_2 }));
        for (const h of bundle.history.slice(0, 20)) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: `[${h.at}] ${h.actorName}: ${h.changesSummary}`,
                        size: 18,
                    }),
                ],
            }));
        }
    }
    const docx = new docx_1.Document({
        sections: [{ children }],
    });
    return Buffer.from(await docx_1.Packer.toBuffer(docx));
}
//# sourceMappingURL=renderDocx.js.map