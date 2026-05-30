'use strict';

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PROCESSED_DIR = path.join(__dirname, '..', '..', 'uploads', 'processed');
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

/**
 * Generate a PDF from CV data.
 * Uses pdf-lib for a clean, ATS-friendly layout.
 */
async function generateCvPdf(cvData) {
  const { personal, education = [], experience = [], skills = {}, projects = [], certifications = [], template = 't1' } = cvData;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fonts = {
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    oblique: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
  };

  // Theme colors per template
  const themes = {
    t1: { header: rgb(0.42, 0.24, 0.93), accent: rgb(0.24, 0.55, 0.93), light: rgb(0.95, 0.92, 1) },
    t2: { header: rgb(0.07, 0.07, 0.07), accent: rgb(0.24, 0.55, 0.93), light: rgb(0.93, 0.93, 0.93) },
    t3: { header: rgb(1, 1, 1), accent: rgb(0.42, 0.24, 0.93), light: rgb(0.96, 0.96, 0.96) },
  };
  const theme = themes[template] || themes.t1;

  let y = height;

  // ── Header band ──
  const HEADER_H = 130;
  page.drawRectangle({ x: 0, y: height - HEADER_H, width, height: HEADER_H, color: theme.header });

  const nameColor = template === 't3' ? rgb(0.1, 0.1, 0.1) : rgb(1, 1, 1);
  const subColor = template === 't3' ? rgb(0.4, 0.4, 0.4) : rgb(0.9, 0.9, 1);

  page.drawText(personal.name || 'Your Name', {
    x: 40, y: height - 50, size: 26, font: fonts.bold, color: nameColor,
  });
  if (personal.role) {
    page.drawText(personal.role, { x: 40, y: height - 75, size: 12, font: fonts.regular, color: subColor });
  }
  const contact = [personal.email, personal.phone, personal.location].filter(Boolean).join('   |   ');
  if (contact) {
    page.drawText(contact, { x: 40, y: height - 100, size: 9, font: fonts.regular, color: subColor });
  }
  if (personal.linkedin) {
    page.drawText(personal.linkedin, { x: 40, y: height - 115, size: 9, font: fonts.regular, color: subColor });
  }

  y = height - HEADER_H - 20;

  // ── Helper draw functions ──
  function sectionTitle(title) {
    y -= 14;
    page.drawText(title.toUpperCase(), {
      x: 40, y, size: 9, font: fonts.bold, color: theme.accent,
    });
    y -= 4;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: theme.accent });
    y -= 12;
  }

  function bodyText(text, opts = {}) {
    const { x = 40, size = 9, font = fonts.regular, color = rgb(0.15, 0.15, 0.15), indent = 0 } = opts;
    if (!text) return;
    // Word-wrap
    const maxW = width - 80 - indent;
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      const w = font.widthOfTextAtSize(test, size);
      if (w > maxW && line) {
        if (y < 60) { addPage(); }
        page.drawText(line, { x: x + indent, y, size, font, color });
        y -= size + 3;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      if (y < 60) { addPage(); }
      page.drawText(line, { x: x + indent, y, size, font, color });
      y -= size + 3;
    }
  }

  function addPage() {
    const p = pdfDoc.addPage([595.28, 841.89]);
    y = p.getSize().height - 40;
  }

  // ── Summary ──
  if (personal.summary) {
    sectionTitle('Professional Summary');
    bodyText(personal.summary);
    y -= 8;
  }

  // ── Experience ──
  if (experience.length) {
    sectionTitle('Experience');
    for (const exp of experience) {
      if (y < 80) addPage();
      const dateStr = `${exp.startDate || ''} – ${exp.current ? 'Present' : (exp.endDate || '')}`;
      page.drawText(exp.title || '', { x: 40, y, size: 10, font: fonts.bold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(dateStr, { x: width - 160, y, size: 8, font: fonts.regular, color: rgb(0.5, 0.5, 0.5) });
      y -= 12;
      if (exp.company) page.drawText(exp.company + (exp.location ? ` · ${exp.location}` : ''), { x: 40, y, size: 9, font: fonts.oblique, color: rgb(0.35, 0.35, 0.35) });
      y -= 12;
      if (exp.description) bodyText(exp.description, { indent: 8 });
      y -= 6;
    }
    y -= 4;
  }

  // ── Education ──
  if (education.length) {
    sectionTitle('Education');
    for (const edu of education) {
      if (y < 60) addPage();
      page.drawText(edu.degree || '', { x: 40, y, size: 10, font: fonts.bold, color: rgb(0.1, 0.1, 0.1) });
      y -= 12;
      const line2 = [edu.institution, edu.startYear && edu.endYear ? `${edu.startYear}–${edu.endYear}` : '', edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' · ');
      page.drawText(line2, { x: 40, y, size: 9, font: fonts.regular, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    }
    y -= 4;
  }

  // ── Skills ──
  const allSkills = [...(skills.technical || []), ...(skills.soft || []), ...(skills.languages || [])];
  if (allSkills.length) {
    sectionTitle('Skills');
    bodyText(allSkills.join('   ·   '));
    y -= 8;
  }

  // ── Projects ──
  if (projects.length) {
    sectionTitle('Projects');
    for (const proj of projects) {
      if (y < 60) addPage();
      page.drawText(proj.name || '', { x: 40, y, size: 10, font: fonts.bold, color: rgb(0.1, 0.1, 0.1) });
      if (proj.url) page.drawText(proj.url, { x: width - 200, y, size: 8, font: fonts.regular, color: theme.accent });
      y -= 12;
      if (proj.description) bodyText(proj.description, { indent: 8 });
      if (proj.tech?.length) bodyText('Tech: ' + proj.tech.join(', '), { indent: 8, font: fonts.oblique });
      y -= 6;
    }
  }

  // ── Certifications ──
  if (certifications.length) {
    sectionTitle('Certifications');
    for (const cert of certifications) {
      if (y < 50) addPage();
      const line = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' · ');
      bodyText(line);
    }
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `cv_${uuidv4()}.pdf`;
  const outputPath = path.join(PROCESSED_DIR, filename);
  fs.writeFileSync(outputPath, pdfBytes);

  return { filename, outputPath, size: pdfBytes.length };
}

module.exports = { generateCvPdf };
