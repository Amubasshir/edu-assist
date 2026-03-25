// PDF Translation utilities for IEP documents
// Optimized with label map to reduce API calls for common terms

const LABEL_MAP = {
  "INDIVIDUALIZED EDUCATION PROGRAM (IEP) - INFORMATION / ELIGIBILITY":
    "PROGRAMA INDIVIDUALIZADO DE EDUCACIÓN (IEP) - INFORMACIÓN / ELEGIBILIDAD",
  "PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE":
    "NIVELES PRESENTES DE APROVECHAMIENTO ACADÉMICO Y RENDIMIENTO FUNCIONAL",
  "ANNUAL GOALS AND OBJECTIVES": "METAS ANUALES Y OBJETIVOS",
  "Offer of FAPE - SERVICE": "Oferta de FAPE - SERVICIO",
  "Student Name:": "Nombre del Estudiante:",
  "Date of Birth:": "Fecha de Nacimiento:",
  "IEP Date:": "Fecha del IEP:",
  "Special Education Services": "Servicios de Educación Especial",
  "Related Services": "Servicios Relacionados",
  "Supplementary Aids and Services": "Ayudas y Servicios Suplementarios",
  "Program Modifications": "Modificaciones del Programa",
  "Accommodations": "Acomodaciones",
  "Placement": "Ubicación",
  "Least Restrictive Environment": "Entorno Menos Restrictivo",
  "Extended School Year": "Año Escolar Extendido",
  "Transition Services": "Servicios de Transición",
  "Progress Monitoring": "Monitoreo del Progreso",
  "Parent Consent": "Consentimiento de los Padres",
  "Prior Written Notice": "Aviso Escrito Previo",
  "Initial Evaluation": "Evaluación Inicial",
  "Reevaluation": "Reevaluación",
  "Eligibility Determination": "Determinación de Elegibilidad",
  "SLD": "SLD (Dificultades de Aprendizaje Específicas)",
  "SLI": "SLI (Trastorno del Lenguaje Expresivo)",
  "AUT": "AUT (Trastorno del Espectro Autista)",
  "OHI": "OHI (Otro Problema de Salud)",
  "ED": "ED (Problemas Emocionales/Disturbios)",
  "SSID": "SSID (Discapacidad Intelectual Severa)",
  "CEIS": "CEIS (Discapacidad Intelectual)",
  "IDEA": "IDEA (Ley de Educación para Individuos con Discapacidades)",
  "RSP": "RSP (Programa de Apoyo a la Regularización)",
  "SDC": "SDC (Clase Especial de Día)",
  "SLP": "SLP (Patólogo del Lenguaje y Habla)",
  "SLPA": "SLPA (Asistente del Patólogo del Lenguaje y Habla)",
};

// Language mapping for API calls
const LANGUAGE_MAP = {
  'es': 'Spanish',
  'vi': 'Vietnamese',
  'tl': 'Tagalog',
  'ko': 'Korean',
  'zh': 'Chinese (Mandarin)',
  'ar': 'Arabic',
};

// Quick translation for known terms (no API call needed)
export async function quickTranslate(text) {
  const cleanText = text.trim();
  if (LABEL_MAP[cleanText]) return LABEL_MAP[cleanText];

  // Check for partial matches
  for (const [english, translated] of Object.entries(LABEL_MAP)) {
    if (english.length > 4 && cleanText.startsWith(english)) {
      const remainder = cleanText.slice(english.length).trim();
      if (remainder) return (translated + ' ' + remainder).trim();
      return translated;
    }
  }
  return null;
}

// Translate text using Claude API
export async function translateWithAPI(texts, apiKey, language) {
  if (!texts || texts.length === 0) return [];

  const langName = LANGUAGE_MAP[language] || language;
  const numberedTexts = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Translate these IEP special education text segments from English to ${langName}.\nRules:
- Preserve ALL names, dates, ID numbers exactly as written
- Do NOT translate text in quotation marks
- Preserve disability codes: SLD, SLI, AUT, OHI, ED, SSID, CEIS, IDEA, RSP, SDC, SLP, SLPA
- Use CDE-approved terms for special education concepts
- Use proper accents and diacritics throughout
Return ONLY a JSON array of translated strings in the same order, no explanation.\n\n${numberedTexts}`
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Translation API error');
    }

    const data = await response.json();
    const rawContent = data.content[0].text.trim().replace(/^```[^\n]*\n?/, '').replace(/```[\s\S]*$/, '').trim();

    try {
      return JSON.parse(rawContent);
    } catch (e) {
      // Try to extract JSON array from response
      const match = rawContent.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      return texts.map(() => null);
    }
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

// Batch translate with optimization
export async function batchTranslate(texts, apiKey, language, onProgress) {
  if (!texts || texts.length === 0) return [];

  const results = [];
  let apiCallCount = 0;

  // First pass: quick translations
  for (let i = 0; i < texts.length; i++) {
    const quickResult = await quickTranslate(texts[i]);
    if (quickResult) {
      results[i] = quickResult;
      if (onProgress) onProgress((i + 1) / texts.length * 100);
    }
  }

  // Second pass: API translations for remaining texts
  const untranslatedIndices = results.map((r, i) => r === undefined ? i : -1).filter(i => i !== -1);
  if (untranslatedIndices.length > 0) {
    const untranslatedTexts = untranslatedIndices.map(i => texts[i]);

    // Chunk for API calls (700 chars max per chunk)
    const chunks = [];
    let currentChunk = '';
    for (const text of untranslatedTexts) {
      if ((currentChunk + ' ' + text).trim().length > 700) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = text;
      } else {
        currentChunk = ((currentChunk + ' ' + text).trim());
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    // Translate chunks
    const translatedChunks = await translateWithAPI(chunks, apiKey, language);
    apiCallCount += chunks.length;

    // Map back to results
    let chunkIndex = 0;
    for (const index of untranslatedIndices) {
      if (chunkIndex < translatedChunks.length && translatedChunks[chunkIndex]) {
        results[index] = translatedChunks[chunkIndex];
      }
      chunkIndex++;
      if (onProgress) onProgress((index + 1) / texts.length * 100);
    }
  }

  return results;
}

// Download PDF blob as file
export function downloadPDF(pdfBlob, fileName) {
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Ensure PDF.js is loaded (for client-side PDF processing)
export async function ensurePDFJS() {
  if (typeof window !== 'undefined' && !window.pdfjsLib) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.head.appendChild(script);
  }
}

// Ensure PDF-lib is loaded (for PDF generation)
export async function ensurePDFLib() {
  if (typeof window !== 'undefined' && !window.PDFLib) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    document.head.appendChild(script);
  }
}
