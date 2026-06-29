const f = input.fields;
const media = input.mediaFiles || [];
const documents = input.documents || [];
const surveyFiles = input.surveyFiles || [];
const surveyDate = input.surveyDate || '';
const tableRows = input.tableRows || [];
const sections = input.sections || [];

const getSectionIcon = (heading) => {
  const h = (heading || '').toLowerCase();
  const svg = (path) => `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  if (h.includes('electrical') || h.includes('electric') || h.includes('power'))
    return svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>');
  if (h.includes('site plan') || h.includes('site map') || h.includes('layout'))
    return svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>');
  if (h.includes('method of work') || h.includes('method') || h.includes('work'))
    return svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>');
  if (h.includes('safety anchor') || h.includes('anchor'))
    return svg('<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>');
  if (h.includes('fall rescue') || h.includes('rescue') || h.includes('emergency'))
    return svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>');
  if (h.includes('additional comment') || h.includes('comment') || h.includes('note'))
    return svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>');
  if (h.includes('ppe') || h.includes('equipment') || h.includes('kit'))
    return svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>');
  if (h.includes('roof') || h.includes('structure') || h.includes('building'))
    return svg('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>');
  if (h.includes('access') || h.includes('egress') || h.includes('ladder'))
    return svg('<line x1="8" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="16" y2="21"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="17" x2="16" y2="17"/>');
  if (h.includes('risk') || h.includes('hazard') || h.includes('assessment'))
    return svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
  if (h.includes('photo') || h.includes('image') || h.includes('picture'))
    return svg('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>');
  return svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>');
};

const imageFiles = media.filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file.name));
const otherFiles = media.filter(file => !/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file.name));

const isHeic = (url, name) => {
  const hasHeicExt = (s) => {
    if (!s) return false;
    const path = String(s).split('?')[0].split('#')[0];
    return /\.heic$/i.test(path);
  };
  return hasHeicExt(url) || hasHeicExt(name);
};

const fileLabel = (url, name) => {
  if (name) return name;
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split('/').pop() || 'View image');
  } catch (e) {
    const parts = String(url).split('?')[0].split('/');
    return parts[parts.length - 1] || 'View image';
  }
};

const VIEWER_BASE = 'https://solve-download-portal.vercel.app';

const heicViewerUrl = (url, displayName) => {
  const name = displayName || fileLabel(url);
  return `${VIEWER_BASE}/view.html?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
};

const renderClickableImageLink = (url, displayName) => `
  <a href="${heicViewerUrl(url, displayName)}" target="_blank" class="doc-item">
    <div class="doc-icon">📷</div>
    <div class="doc-name">${displayName}</div>
    <div class="doc-icon">↗</div>
  </a>`;

// PNG/JPG/etc. render as <img>; .heic files render as a clickable link only
const renderImageContent = (url, displayName) => {
  if (isHeic(url, displayName)) {
    return renderClickableImageLink(url, displayName || fileLabel(url));
  }
  return `<img src="${url}" onerror="this.parentElement.style.display='none'"/>`;
};

const boldLabels = (text) => {
  if (!text) return '';
  return text.split('\n').map(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx <= 40) {
      return '<strong>' + line.substring(0, colonIdx) + '</strong>' + line.substring(colonIdx);
    }
    return line;
  }).join('\n');
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    const datepart = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timepart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return datepart + " " + timepart;
  } catch(e) { return dateStr; }
};

const groups = {};
surveyFiles.forEach(file => {
  const slashIndex = file.name.indexOf('/');
  const groupName = slashIndex > -1 ? file.name.substring(0, slashIndex).replace(':', '').trim() : 'Other';
  const fileName = slashIndex > -1 ? file.name.substring(slashIndex + 1) : file.name;
  if (!groups[groupName]) groups[groupName] = [];
  groups[groupName].push({ url: file.url, displayName: fileName });
});

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: white; color: #1a1a1a; }
  .page { max-width: 900px; margin: 0 auto; background: white; }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 48px; position: relative; overflow: hidden; }
  .header::before { content: ""; position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; background: #F97316; border-radius: 50%; opacity: 0.08; }
  .header-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .logo-img { height: 40px; width: auto; filter: brightness(0) invert(1); }
  .header h1 { color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; line-height: 1.2; }
  .header-meta { display: flex; gap: 24px; margin-top: 12px; }
  .meta-item { color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
  .meta-value { color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500; margin-top: 2px; }
  .orange-bar { height: 4px; background: linear-gradient(90deg, #F97316, #fb923c); }
  .content { padding: 40px 48px; background: white; }
  .section { margin-bottom: 36px; background: white; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; page-break-after: avoid; }
  .section-icon { width: 32px; height: 32px; background: #fff4ed; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .section-title { font-size: 11px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 0.1em; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #F97316; border-radius: 0 8px 8px 0; padding: 16px 20px; font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap; page-break-inside: avoid; }
  .media-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; }
  .media-item { width: 200px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); background: white; }
  .media-item img { width: 100%; display: block; }
  .media-label { padding: 6px 10px; font-size: 10px; color: #64748b; background: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .doc-list { display: flex; flex-direction: column; gap: 10px; }
  .doc-item { display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; text-decoration: none; color: #1a1a1a; page-break-inside: avoid; }
  .doc-number { width: 24px; height: 24px; background: #F97316; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .doc-name { font-size: 13px; font-weight: 500; color: #1e40af; text-decoration: underline; flex: 1; }
  .doc-icon { font-size: 16px; flex-shrink: 0; }
  .no-media { color: #999; font-style: italic; font-size: 13px; padding: 8px 0; }
  .survey-main-header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px 48px; margin: 0 -48px 32px -48px; page-break-before: always; }
  .survey-main-title { color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; display: flex; align-items: center; gap: 12px; }
  .survey-main-date { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 6px; }
  .survey-group { margin-bottom: 32px; background: white; }
  .survey-group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; page-break-after: avoid; }
  .survey-group-title { font-size: 11px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 0.1em; }
  .survey-photo-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; background: white; }
  .survey-photo-item { width: 260px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); background: white; page-break-inside: avoid; }  
  .survey-photo-item img { width: 100%; display: block; }
  .survey-photo-label { padding: 6px 10px; font-size: 10px; color: #64748b; background: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .page-break { page-break-before: always; }
  .other-docs-subheader { font-size: 11px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 0.1em; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; margin-bottom: 12px; }
  .method-main-header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px 48px; margin: 0 -48px 32px -48px; page-break-before: always; }
  .method-main-title { color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; display: flex; align-items: center; gap: 12px; }
  .method-table-container { margin-bottom: 32px; }
  .method-table { width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; }
  .method-table tr:nth-child(even) { background: #f8fafc; }
  .method-table tr:nth-child(odd) { background: white; }
  .method-table td { padding: 10px 16px; border: 1px solid #d1d5db; font-size: 13px; vertical-align: top; }
  .method-table-label { font-weight: 600; color: #374151; width: 38%; }
  .method-table-value { color: #1a1a1a; }
  .method-section { margin-bottom: 28px; }
  .method-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; page-break-after: avoid; }
  .method-section-icon { width: 32px; height: 32px; background: #fff4ed; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .method-section-title { font-size: 11px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 0.1em; }
  .method-content-box { background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; }
  .method-paragraph { font-size: 13px; line-height: 1.6; color: #1a1a1a; margin-bottom: 8px; }
  .method-paragraph:last-child { margin-bottom: 0; }
  .method-callout { background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 14px 18px; font-size: 13px; line-height: 1.6; color: #1a1a1a; margin-bottom: 12px; }
  .method-image-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
  .method-image-item { flex: 1; min-width: 220px; max-width: 45%; }
  .method-image-item img { width: 100%; border-radius: 8px; display: block; border: 1px solid #e2e8f0; }
  .method-qa-container { background: white; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
  .method-qa-item { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; }
  .method-qa-item:last-child { border-bottom: none; }
  .method-qa-question { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; line-height: 1.5; }
  .method-qa-answer { background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 14px; font-size: 13px; color: #1a1a1a; min-height: 42px; line-height: 1.6; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="header-top">
     <img src="https://solve-download-portal.vercel.app/assets/solve-logo.png" class="logo-img" alt="Solve Energy"/>
    </div>
    <h1>${f["Title"] || "Job Card"}</h1>
    <div class="header-meta">
      <div>
        <div class="meta-item">Generated</div>
        <div class="meta-value">${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
      <div>
        <div class="meta-item">Document Type</div>
        <div class="meta-value">Job Card Summary</div>
      </div>
    </div>
  </div>
  <div class="orange-bar"></div>

  <div class="content">

    <div class="section">
      <div class="section-header">
        <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
        <div class="section-title">Media</div>
      </div>
      ${imageFiles.length > 0
        ? `<div class="media-grid">${imageFiles.map(file => {
            const label = file.name.replace("Media/", "");
            return `<div class="media-item">${renderImageContent(file.url, label)}${isHeic(file.url, file.name) ? '' : `<div class="media-label">${label}</div>`}</div>`;
          }).join("")}</div>`
        : `<p class="no-media">No media files available.</p>`}

      ${otherFiles.length > 0 ? `
      <div style="margin-top: 24px;">
        <div class="other-docs-subheader">Other Documents</div>
        <div class="doc-list">
          ${otherFiles.map((file, index) => {
            const label = file.name.replace("Media/", "");
            const href = isHeic(file.url, file.name) ? heicViewerUrl(file.url, label) : file.url;
            return `
          <a href="${href}" target="_blank" class="doc-item">
            <div class="doc-number">${index + 1}</div>
            <div class="doc-name">${label}</div>
            <div class="doc-icon">↗</div>
          </a>`;
          }).join("")}
        </div>
      </div>` : ""}
    </div>

    <div class="section page-break">
      <div class="section-header">
        <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></svg></div>
        <div class="section-title">Project Information</div>
      </div>
      <div class="info-box">${f["Project Info"] || "No project information available."}</div>
    </div>

    ${documents.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
        <div class="section-title">Documents</div>
      </div>
      <div class="doc-list">
        ${documents.map((doc, index) => `
        <a href="${doc.url}" target="_blank" class="doc-item">
          <div class="doc-number">${index + 1}</div>
          <div class="doc-name">${doc.name}</div>
          <div class="doc-icon">↗</div>
        </a>`).join("")}
      </div>
    </div>` : ""}

    <div class="section">
      <div class="section-header">
        <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>
        <div class="section-title">Nearest Medical Facility</div>
      </div>
      <div class="info-box">${f["Nearest Medical Facility"] || "No medical facility information available."}</div>
    </div>

    ${tableRows.some(row => row.value && String(row.value).trim() !== '') ? `
    <div class="method-main-header">
      <div class="method-main-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></svg>
        Method Statement
      </div>
    </div>

    <div class="method-table-container">
      <table class="method-table">
        ${tableRows.map(row => `
        <tr>
          <td class="method-table-label">${row.label || ''}</td>
          <td class="method-table-value">${row.value || ''}</td>
        </tr>`).join('')}
      </table>
    </div>

    ${sections.map(section => {
      const qaItems = section.qaltems || section.qaItems || [];
      const callouts = section.callouts || [];
      const paragraphs = section.paragraphs || [];
      const images = section.images || [];
      return `
    <div class="method-section">
      <div class="method-section-header">
        <div class="method-section-icon">${getSectionIcon(section.heading)}</div>
        <div class="method-section-title">${section.heading || ''}</div>
      </div>

      ${paragraphs.length > 0 ? `
      <div class="method-content-box">
        ${paragraphs.map(p => `<p class="method-paragraph">${p}</p>`).join('')}
      </div>` : ''}

      ${callouts.map(callout => `
      <div class="method-callout">${callout.text || callout || ''}</div>`).join('')}

      ${images.length > 0 ? `
      <div class="method-image-grid">
        ${images.map(img => {
          const url = img.url || img;
          const name = img.name || img.label || fileLabel(url);
          return `<div class="method-image-item">${renderImageContent(url, name)}</div>`;
        }).join('')}
      </div>` : ''}

      ${qaItems.length > 0 ? `
      <div class="method-qa-container">
        ${qaItems.map(qa => `
        <div class="method-qa-item">
          <div class="method-qa-question">${qa.question || qa.label || ''}</div>
          <div class="method-qa-answer">${qa.answer || qa.value || ''}</div>
        </div>`).join('')}
      </div>` : ''}

    </div>`;
    }).join('')}
    ` : ''}

    <div class="survey-main-header">
      <div class="survey-main-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Site Survey Submission
      </div>
      <div class="survey-main-date">Survey Submission Date: ${formatDate(surveyDate)}</div>
    </div>

    ${f["Combined Notes"] ? `
    <div class="survey-group">
      <div class="survey-group-header">
        <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
        <div class="survey-group-title">Combined Notes</div>
      </div>
      <div class="info-box">${boldLabels(f["Combined Notes"])}</div>
    </div>` : ""}

    ${Object.keys(groups).map(groupName => `
    <div class="survey-group">
      <div class="survey-group-header">
        <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
        <div class="survey-group-title">${groupName}</div>
      </div>
      <div class="survey-photo-grid">
        ${groups[groupName].map(file => {
          const isHeicFile = isHeic(file.url, file.displayName);
          return `<div class="survey-photo-item">${renderImageContent(file.url, file.displayName)}${isHeicFile ? '' : `<div class="survey-photo-label">${file.displayName}</div>`}</div>`;
        }).join("")}
      </div>
    </div>`).join("")}

  </div>
</div>
</body>
</html>`;

return { html };
