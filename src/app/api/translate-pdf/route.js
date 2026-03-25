import { NextResponse } from 'next/server';

// Add comprehensive canvas polyfills for pdf-parse BEFORE requiring the module
if (typeof global !== 'undefined') {
  // Basic DOM classes
  global.DOMMatrix = class DOMMatrix {
    constructor(init) {
      this.init = init;
    }
  };

  global.ImageData = class ImageData {
    constructor(data, width, height) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  };

  global.Path2D = class Path2D {
    constructor(path) {
      this.path = path;
    }
  };

  // Canvas API
  global.Canvas = class Canvas {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
    getContext() {
      return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => new ImageData(new Uint8ClampedArray(4), 1, 1),
        putImageData: () => {},
        createImageData: () => new ImageData(new Uint8ClampedArray(4), 1, 1),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
      };
    }
  };

  global.HTMLCanvasElement = global.Canvas;
}

const PdfReader = require('pdfreader').PdfReader;
// const pdfParse = require('pdf-parse'); // Removed due to module loading issues

// Language mapping
const LANGUAGE_MAP = {
  'es': 'Spanish',
  'vi': 'Vietnamese',
  'tl': 'Tagalog',
  'ko': 'Korean',
  'zh': 'Chinese (Mandarin)',
  'ar': 'Arabic',
};

// Translation label map (common IEP terms to avoid API calls)
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
};

async function quickTranslate(text) {
  const cleanText = text.trim();
  if (LABEL_MAP[cleanText]) return LABEL_MAP[cleanText];
  for (const [english, translated] of Object.entries(LABEL_MAP)) {
    if (english.length > 4 && cleanText.startsWith(english)) {
      const remainder = cleanText.slice(english.length).trim();
      if (remainder) return (translated + ' ' + remainder).trim();
      return translated;
    }
  }
  return null;
}

async function translateWithAPI(texts, apiKey, language) {
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
      const match = rawContent.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      return texts.map(() => null);
    }
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function createSimplePDF(text) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  const fontSize = 12;

  const lines = text.split('\n');

  function sanitizeText(str) {
    // Strip non-WinAnsi characters (pdf-lib Helvetica only supports WinAnsi)
    return str.split('').filter(char => char.charCodeAt(0) < 256).join('');
  }

  for (let line of lines) {
    if (y < margin) {
      page = pdfDoc.addPage();
      y = height - margin;
    }

    if (line.trim()) {
      // Very basic wrapping
      const maxLineLength = 80;
      for (let i = 0; i < line.length; i += maxLineLength) {
        const chunk = line.substring(i, i + maxLineLength);
        const safeChunk = sanitizeText(chunk);
        
        try {
          page.drawText(safeChunk, {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        } catch (e) {
            // Ignore drawing errors for invalid characters
        }
        y -= fontSize + 4;
        
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
      }
    } else {
      y -= fontSize + 4;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const language = formData.get('language');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'No target language specified' },
        { status: 400 }
      );
    }

    // Get API key from environment variable (backend)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    // Read file as buffer
    const buffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);

    // Extract text from PDF using pdfreader
    let sourceText = '';

    try {
      console.log('Extracting text with pdfreader...');
      sourceText = await new Promise((resolve, reject) => {
        const reader = new PdfReader();
        let text = '';

        reader.parseBuffer(nodeBuffer, (err, item) => {
          if (err) {
            reject(err);
          } else if (!item) {
            // End of file
            resolve(text.trim());
          } else if (item.text) {
            text += item.text + ' ';
          }
        });
      });
      console.log(`pdfreader extracted ${sourceText.length} characters`);
    } catch (error) {
      console.log('pdfreader failed:', error.message);
      sourceText = '';
    }

    if (!sourceText || sourceText.length < 10) {
      console.log('pdfreader extracted 0 characters or failed, trying pdf-parse as fallback...');
      try {
        // Use the library's core file directly to avoid the buggy debug block in its index.js
        // that causes ENOENT errors in some environments.
        const pdfParse = require('pdf-parse/lib/pdf-parse.js');
        
        // Handle various ways it might be exported (though lib/pdf-parse.js is usually a direct function)
        const pdfParseFn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
        
        if (typeof pdfParseFn === 'function') {
          const data = await pdfParseFn(nodeBuffer);
          sourceText = (data.text || '').trim();
          console.log(`pdf-parse extracted ${sourceText.length} characters`);
        } else {
          console.log('pdf-parse fallback failed: core function not found');
        }
      } catch (fallbackError) {
        console.log('pdf-parse fallback error:', fallbackError.message);
      }
    }

    if (!sourceText || sourceText.length < 10) {
      return NextResponse.json(
        {
          error: 'Unable to extract text from PDF. The PDF may be image-based (scanned) or corrupted. Please try a different PDF file with selectable text.',
          details: 'Supported formats: Text-based PDFs. Scanned/image PDFs are not supported.'
        },
        { status: 400 }
      );
    }

    // Split source text into sized chunks for translation call
    const sourceLines = sourceText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const chunkSize = 700;
    const chunks = [];
    let chunk = '';

    for (const line of sourceLines) {
      if ((chunk + ' ' + line).trim().length > chunkSize) {
        if (chunk.length > 0) {
          chunks.push(chunk.trim());
        }
        chunk = line;
      } else {
        chunk = ((chunk + ' ' + line).trim());
      }
    }

    if (chunk.length > 0) {
      chunks.push(chunk.trim());
    }

    // Translate using the API
    const translatedSegments = await translateWithAPI(chunks, apiKey, language);
    const translatedText = translatedSegments.length > 0 ? translatedSegments.join('\n\n') : 'Failed to produce translation.';

    // Return JSON so the client can generate a perfect graphical PDF with local fonts
    return NextResponse.json(
      { success: true, translatedText, originalText: sourceText, language },
      { status: 200 }
    );

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}