// import { NextResponse } from 'next/server';

// // Add comprehensive canvas polyfills for pdf-parse BEFORE requiring the module
// if (typeof global !== 'undefined') {
//   // Basic DOM classes
//   global.DOMMatrix = class DOMMatrix {
//     constructor(init) {
//       this.init = init;
//     }
//   };

//   global.ImageData = class ImageData {
//     constructor(data, width, height) {
//       this.data = data;
//       this.width = width;
//       this.height = height;
//     }
//   };

//   global.Path2D = class Path2D {
//     constructor(path) {
//       this.path = path;
//     }
//   };

//   // Canvas API
//   global.Canvas = class Canvas {
//     constructor(width, height) {
//       this.width = width;
//       this.height = height;
//     }
//     getContext() {
//       return {
//         fillRect: () => {},
//         clearRect: () => {},
//         getImageData: () => new ImageData(new Uint8ClampedArray(4), 1, 1),
//         putImageData: () => {},
//         createImageData: () => new ImageData(new Uint8ClampedArray(4), 1, 1),
//         setTransform: () => {},
//         drawImage: () => {},
//         save: () => {},
//         restore: () => {},
//         beginPath: () => {},
//         moveTo: () => {},
//         lineTo: () => {},
//         closePath: () => {},
//         stroke: () => {},
//         fill: () => {},
//       };
//     }
//   };

//   global.HTMLCanvasElement = global.Canvas;
// }

// const PdfReader = require('pdfreader').PdfReader;
// // const pdfParse = require('pdf-parse'); // Removed due to module loading issues

// // Language mapping
// const LANGUAGE_MAP = {
//   'es': 'Spanish',
//   'vi': 'Vietnamese',
//   'tl': 'Tagalog',
//   'ko': 'Korean',
//   'zh': 'Chinese (Mandarin)',
//   'ar': 'Arabic',
// };

// // Translation label map (common IEP terms to avoid API calls)
// const LABEL_MAP = {
//   "INDIVIDUALIZED EDUCATION PROGRAM (IEP) - INFORMATION / ELIGIBILITY":
//     "PROGRAMA INDIVIDUALIZADO DE EDUCACIÓN (IEP) - INFORMACIÓN / ELEGIBILIDAD",
//   "PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE":
//     "NIVELES PRESENTES DE APROVECHAMIENTO ACADÉMICO Y RENDIMIENTO FUNCIONAL",
//   "ANNUAL GOALS AND OBJECTIVES": "METAS ANUALES Y OBJETIVOS",
//   "Offer of FAPE - SERVICE": "Oferta de FAPE - SERVICIO",
//   "Student Name:": "Nombre del Estudiante:",
//   "Date of Birth:": "Fecha de Nacimiento:",
//   "IEP Date:": "Fecha del IEP:",
// };

// async function quickTranslate(text) {
//   const cleanText = text.trim();
//   if (LABEL_MAP[cleanText]) return LABEL_MAP[cleanText];
//   for (const [english, translated] of Object.entries(LABEL_MAP)) {
//     if (english.length > 4 && cleanText.startsWith(english)) {
//       const remainder = cleanText.slice(english.length).trim();
//       if (remainder) return (translated + ' ' + remainder).trim();
//       return translated;
//     }
//   }
//   return null;
// }

// async function translateWithAPI(texts, apiKey, language) {
//   if (!texts || texts.length === 0) return [];

//   const langName = LANGUAGE_MAP[language] || language;
//   const inputJsonStr = JSON.stringify(texts);

//   try {
//     const response = await fetch('https://api.anthropic.com/v1/messages', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-api-key': apiKey,
//         'anthropic-version': '2023-06-01',
//       },
//       body: JSON.stringify({
//         model: 'claude-3-haiku-20240307',
//         max_tokens: 4000,
//         messages: [{
//           role: 'user',
//           content: `You are a professional document translator. Translate the following JSON array of English text segments strictly into ${langName}. 

// CRITICAL RULES:
// 1. TRANSLATION: Your absolute priority is to translate the text completely into ${langName}. Do not leave text in English unless it is a name or specific ID.
// 2. FORMATTING: You MUST wrap the translated text inside HTML tags (e.g., <h1>, <h2>, <strong>, <ul>, <li>, <p>) to recreate the visual structure (headers, bold text, lists, bullet points) of the original English text.
// 3. Keep the EXACT same JSON array structure length and order.
// 4. Preserve ALL names, dates, email addresses, and ID numbers exactly as written.
// 5. Preserve disability codes: SLD, SLI, AUT, OHI, ED, SSID, CEIS, IDEA, RSP, SDC, SLP, SLPA.
// 6. STRICT JSON: Return ONLY a valid JSON array of strings. You MUST escape all double quotes inside the translated strings with a backslash (\\"). Replace any literal line breaks with \\n. Do not output unescaped control characters.

// Return ONLY a valid JSON array of strings containing the translated, HTML-formatted segments. No markdown wrapping. Output nothing else.\n\nInput:\n${inputJsonStr}`
//         }]
//       })
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error?.message || 'Translation API error');
//     }

//     const data = await response.json();
//     let rawContent = data.content[0].text.trim().replace(/^```[^\n]*\n?/, '').replace(/```[\s\S]*$/, '').trim();

//     try {
//       return JSON.parse(rawContent);
//     } catch (e) {
//       try {
//         // Fallback: Strip literal control characters (newlines/tabs) which Claude might hallucinately output inside JSON strings.
//         // Since the output is HTML-formatted, literal line breaks are completely unnecessary to preserve the structure anyway.
//         const strippedContent = rawContent.replace(/[\n\r\t]/g, ' '); 
//         const match = strippedContent.match(/\[[\s\S]*\]/);
//         return JSON.parse(match ? match[0] : strippedContent);
//       } catch (e2) {
//         throw new Error(e.message);
//       }
//     }
//   } catch (error) {
//     console.error('Translation API error:', error);
//     throw error;
//   }
// }

// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// async function createSimplePDF(text) {
//   const pdfDoc = await PDFDocument.create();
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
//   let page = pdfDoc.addPage();
//   const { width, height } = page.getSize();
//   const margin = 50;
//   let y = height - margin;
//   const fontSize = 12;

//   const lines = text.split('\n');

//   function sanitizeText(str) {
//     // Strip non-WinAnsi characters (pdf-lib Helvetica only supports WinAnsi)
//     return str.split('').filter(char => char.charCodeAt(0) < 256).join('');
//   }

//   for (let line of lines) {
//     if (y < margin) {
//       page = pdfDoc.addPage();
//       y = height - margin;
//     }

//     if (line.trim()) {
//       // Very basic wrapping
//       const maxLineLength = 80;
//       for (let i = 0; i < line.length; i += maxLineLength) {
//         const chunk = line.substring(i, i + maxLineLength);
//         const safeChunk = sanitizeText(chunk);
        
//         try {
//           page.drawText(safeChunk, {
//             x: margin,
//             y: y,
//             size: fontSize,
//             font: font,
//             color: rgb(0, 0, 0),
//           });
//         } catch (e) {
//             // Ignore drawing errors for invalid characters
//         }
//         y -= fontSize + 4;
        
//         if (y < margin) {
//           page = pdfDoc.addPage();
//           y = height - margin;
//         }
//       }
//     } else {
//       y -= fontSize + 4;
//     }
//   }

//   const pdfBytes = await pdfDoc.save();
//   return Buffer.from(pdfBytes);
// }

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file');
//     const language = formData.get('language');

//     if (!file) {
//       return NextResponse.json(
//         { error: 'No file provided' },
//         { status: 400 }
//       );
//     }

//     if (!language) {
//       return NextResponse.json(
//         { error: 'No target language specified' },
//         { status: 400 }
//       );
//     }

//     // Get API key from environment variable (backend)
//     const apiKey = process.env.ANTHROPIC_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json(
//         { error: 'API key not configured on server' },
//         { status: 500 }
//       );
//     }

//     // Read file as buffer
//     const buffer = await file.arrayBuffer();
//     const nodeBuffer = Buffer.from(buffer);

//     // Extract text from PDF using pdfreader
//     let sourceText = '';

//     try {
//       console.log('Extracting text with pdfreader...');
//       sourceText = await new Promise((resolve, reject) => {
//         const reader = new PdfReader();
//         let text = '';

//         reader.parseBuffer(nodeBuffer, (err, item) => {
//           if (err) {
//             reject(err);
//           } else if (!item) {
//             // End of file
//             resolve(text.trim());
//           } else if (item.text) {
//             text += item.text + ' ';
//           }
//         });
//       });
//       console.log(`pdfreader extracted ${sourceText.length} characters`);
//     } catch (error) {
//       console.log('pdfreader failed:', error.message);
//       sourceText = '';
//     }

//     if (!sourceText || sourceText.length < 10) {
//       console.log('pdfreader extracted 0 characters or failed, trying pdf-parse as fallback...');
//       try {
//         // Use the library's core file directly to avoid the buggy debug block in its index.js
//         // that causes ENOENT errors in some environments.
//         const pdfParse = require('pdf-parse/lib/pdf-parse.js');
        
//         // Handle various ways it might be exported (though lib/pdf-parse.js is usually a direct function)
//         const pdfParseFn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
        
//         if (typeof pdfParseFn === 'function') {
//           const data = await pdfParseFn(nodeBuffer);
//           sourceText = (data.text || '').trim();
//           console.log(`pdf-parse extracted ${sourceText.length} characters`);
//         } else {
//           console.log('pdf-parse fallback failed: core function not found');
//         }
//       } catch (fallbackError) {
//         console.log('pdf-parse fallback error:', fallbackError.message);
//       }
//     }

//     if (!sourceText || sourceText.length < 10) {
//       return NextResponse.json(
//         {
//           error: 'Unable to extract text from PDF. The PDF may be image-based (scanned) or corrupted. Please try a different PDF file with selectable text.',
//           details: 'Supported formats: Text-based PDFs. Scanned/image PDFs are not supported.'
//         },
//         { status: 400 }
//       );
//     }

//     // Split source text into sized chunks while preserving line breaks for translation call
//     const sourceLines = sourceText.split(/\r?\n/);
//     const chunkSize = 1500;
//     const chunks = [];
//     let chunk = '';

//     for (const line of sourceLines) {
//       if ((chunk + '\n' + line).length > chunkSize && chunk.trim().length > 0) {
//         chunks.push(chunk);
//         chunk = line;
//       } else {
//         chunk = chunk ? chunk + '\n' + line : line;
//       }
//     }

//     if (chunk.trim().length > 0) {
//       chunks.push(chunk);
//     }

//     // Translate using the API
//     const translatedSegments = await translateWithAPI(chunks, apiKey, language);
//     const translatedText = translatedSegments.length > 0 ? translatedSegments.join('\n') : 'Failed to produce translation.';

//     // Return JSON so the client can generate a perfect graphical PDF with local fonts
//     return NextResponse.json(
//       { success: true, translatedText, originalText: sourceText, language },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Translation API error:', error);
//     return NextResponse.json(
//       { error: error.message || 'Translation failed' },
//       { status: 500 }
//     );
//   }
// }



// ! v2
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Set timeout limit (60s is standard hobby max, Pro supports up to 300/900s)

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

// const pdfParse = require('pdf-parse');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

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

function repairJsonArray(malformedJson) {
  // Remove any markdown code blocks
  let cleaned = malformedJson.trim()
    .replace(/^```[^\n]*\n?/, '')
    .replace(/```[\s\S]*$/, '')
    .trim();
  
  // Try to fix common issues
  try {
    // First attempt: direct parse
    return JSON.parse(cleaned);
  } catch (e) {
    console.log('Direct JSON parse failed, attempting repair...');
    
    // Attempt to fix by adding missing commas between quoted strings
    // This regex adds commas between adjacent quoted strings
    const withCommas = cleaned.replace(/\"\s+\"/g, '", "');
    
    try {
      return JSON.parse(withCommas);
    } catch (e2) {
      console.log('Comma repair failed, attempting manual parsing...');
      
      // If still failing, try to extract using a more aggressive approach
      const match = withCommas.match(/\[(.*)\]/s);
      if (match) {
        const content = match[1];
        const elements = [];
        let current = '';
        let inString = false;
        let escaped = false;
        
        for (let i = 0; i < content.length; i++) {
          const char = content[i];
          
          if (escaped) {
            current += char;
            escaped = false;
            continue;
          }
          
          if (char === '\\') {
            current += char;
            escaped = true;
            continue;
          }
          
          if (char === '"') {
            current += char;
            inString = !inString;
            continue;
          }
          
          if (!inString && char === ',') {
            if (current.trim()) {
              try {
                elements.push(JSON.parse(current.trim()));
              } catch (elError) {
                // If element parsing fails, push as raw string
                const cleanedElement = current.trim().replace(/^"|"$/g, '');
                elements.push(cleanedElement);
              }
            }
            current = '';
            continue;
          }
          
          current += char;
        }
        
        // Add last element
        if (current.trim()) {
          try {
            elements.push(JSON.parse(current.trim()));
          } catch (elError) {
            const cleanedElement = current.trim().replace(/^"|"$/g, '');
            elements.push(cleanedElement);
          }
        }
        
        return elements;
      }
      
      throw new Error('Could not repair JSON array');
    }
  }
}

async function translateWithAPI(texts, apiKey, language) {
  if (!texts || texts.length === 0) return [];

  const langName = LANGUAGE_MAP[language] || language;
  const inputJsonStr = JSON.stringify(texts);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        // model: 'claude-3-haiku-20240307',
        // max_tokens: 4000,
        model: 'claude-sonnet-4-5',
        max_tokens: 64000,
        messages: [{
          role: 'user',
          content: `You are a professional document translator. Translate the following JSON array of English text segments strictly into ${langName}. 

CRITICAL RULES:
1. TRANSLATION: Your absolute priority is to translate the text completely into ${langName}. Do not leave text in English unless it is a name or specific ID.
2. FORMATTING: You MUST wrap the translated text inside HTML tags (e.g., <h1>, <h2>, <strong>, <ul>, <li>, <p>) to recreate the visual structure (headers, bold text, lists, bullet points) of the original English text.
3. Keep the EXACT same JSON array structure length and order.
4. Preserve ALL names, dates, email addresses, and ID numbers exactly as written.
5. Preserve disability codes: SLD, SLI, AUT, OHI, ED, SSID, CEIS, IDEA, RSP, SDC, SLP, SLPA.
6. STRICT JSON: Return ONLY a valid JSON array of strings. You MUST escape all double quotes inside the translated strings with a backslash (\\"). Replace any literal line breaks with \\n. Do not output unescaped control characters.

Return ONLY a valid JSON array of strings containing the translated, HTML-formatted segments. No markdown wrapping. Output nothing else.\n\nInput:\n${inputJsonStr}`
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Translation API error');
    }

    const data = await response.json();
    let rawContent = data.content[0].text.trim()
      .replace(/^```[^\n]*\n?/, '')
      .replace(/```[\s\S]*$/, '')
      .trim();

    console.log('Raw translation response (first 500 chars):', rawContent.substring(0, 500));

    try {
      const parsedResult = repairJsonArray(rawContent);
      return parsedResult;
    } catch (e) {
      console.error('Failed to parse translation response:', e);
      console.error('Raw content (first 1000 chars):', rawContent.substring(0, 1000));
      console.error('Raw content (last 500 chars):', rawContent.substring(Math.max(0, rawContent.length - 500)));
      throw new Error(`Translation response parsing failed: ${e.message}`);
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
    const action = formData.get('action');
    const language = formData.get('language');

    // Get API key from environment variable (backend)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'No target language specified' },
        { status: 400 }
      );
    }

    if (action === 'translate') {
      // Step 2: Only translate the provided chunks (bypasses timeout limits by keeping requests short)
      const chunksData = formData.get('chunks');
      if (!chunksData) return NextResponse.json({ error: 'No chunks provided' }, { status: 400 });
      
      const chunks = JSON.parse(chunksData);
      console.log(`Translating batch of ${chunks.length} chunks...`);
      
      const translatedSegments = await translateWithAPI(chunks, apiKey, language);
      return NextResponse.json({ success: true, translatedSegments });
    }

    // Step 1: File extraction (or full monolithic translation if no action specified)
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const buffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);

    // Extract text from PDF using pdf-parse
    let sourceText = '';

    try {
      console.log('Extracting text with pdf-parse...');
      const data = await pdfParse(nodeBuffer);
      sourceText = (data.text || '').trim();
      console.log(`pdf-parse extracted ${sourceText.length} characters`);
    } catch (error) {
      console.log('pdf-parse failed:', error.message);
      sourceText = '';
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

    // Split source text into sized chunks while preserving line breaks for translation call
    const sourceLines = sourceText.split(/\r?\n/);
    const chunkSize = 1500;
    const chunks = [];
    let chunk = '';

    for (const line of sourceLines) {
      if ((chunk + '\n' + line).length > chunkSize && chunk.trim().length > 0) {
        chunks.push(chunk);
        chunk = line;
      } else {
        chunk = chunk ? chunk + '\n' + line : line;
      }
    }

    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }

    console.log(`Split text into ${chunks.length} chunks for translation`);

    if (action === 'extract') {
      // Return chunks to client so they can iterate through them
      return NextResponse.json({ success: true, chunks, originalText: sourceText, language });
    }

    // Process chunks in parallel batches to avoid Vercel/Claude timeouts (fallback for old flow)
    const BATCH_SIZE = 3; // Translate 3 chunks concurrently at a time to respect rate limits while gaining speed
    let translatedSegments = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      console.log(`Translating batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(chunks.length / BATCH_SIZE)}...`);
      
      const batchPromises = batchChunks.map(c => translateWithAPI([c], apiKey, language));
      
      // Wait for the current batch to finish
      const batchResultsArrays = await Promise.all(batchPromises);
      
      // Flatten the individual chunk arrays returned by translateWithAPI
      const batchSegments = batchResultsArrays.map(resArr => resArr.length > 0 ? resArr[0] : '');
      translatedSegments.push(...batchSegments);
    }

    let translatedText = translatedSegments.length > 0 ? translatedSegments.join('\n') : 'Failed to produce translation.';

    // Clean up escaped quotes from JSON parsing
    translatedText = translatedText.replace(/\\"/g, '"');

    console.log(`Translation completed, generated ${translatedText.length} characters`);

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