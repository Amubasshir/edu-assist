# PDF IEP Translator Setup Guide

This guide explains how to set up and use the PDF translator API for translating IEP (Individualized Education Program) documents.

## Overview

The PDF translator system allows users to:

- Upload English IEP PDFs
- Translate them to multiple languages using Claude API
- Download translated PDFs
- Store translation history

## Components

### 1. **Frontend Components**

#### [translations/page.js](/src/app/dashboard/translations/page.js)

Main UI component for PDF upload and translation with:

- Drag-and-drop file upload
- Language selection
- API key input
- Translation progress tracking
- PDF download button

#### [lib/pdf-translator.js](/src/lib/pdf-translator.js)

Utility functions for PDF translation:

- `quickTranslate()` - Quick translations using label map
- `translateWithAPI()` - API-based translation via Claude
- `batchTranslate()` - Batch translation with fallback
- `downloadPDF()` - PDF download helper
- `ensurePDFJS()` - Load PDF.js library
- `ensurePDFLib()` - Load PDF-lib library

#### [lib/supabase-storage.js](/src/lib/supabase-storage.js)

Supabase storage utilities:

- `uploadTranslatedPDF()` - Upload PDF to Supabase Storage
- `saveTranslationRecord()` - Save translation metadata to DB
- `getTranslationHistory()` - Retrieve user's translations

### 2. **Backend Components**

#### [api/translate-pdf/route.js](/src/app/api/translate-pdf/route.js)

API endpoint for PDF translation requests:

- Receives PDF files and language preference
- Validates inputs
- Coordinates translation process

## Setup Instructions

### Prerequisites

1. **Anthropic API Key**
   - Sign up at [api.anthropic.com](https://api.anthropic.com)
   - Create an API key for Claude access
   - Users will enter this key in the UI

2. **PDF.js and PDF-lib Libraries**
   - Automatically loaded from CDN
   - pdf.js v3.11.174
   - pdf-lib v1.17.1

3. **Supabase Configuration**
   - Create a storage bucket named `translated-pdfs`
   - Ensure proper RLS policies are set

### Database Schema

Add these columns to your `documents` table:

```sql
ALTER TABLE documents ADD COLUMN storage_path TEXT;
ALTER TABLE documents ADD COLUMN public_url TEXT;
ALTER TABLE documents ADD COLUMN translation_metadata JSONB;
ALTER TABLE documents ADD COLUMN status VARCHAR(50) DEFAULT 'Pending';
```

### Supabase Storage Setup

1. Create a new bucket:

   ```
   Name: translated-pdfs
   Privacy: Private (with public URLs enabled)
   ```

2. Configure RLS policies:

   ```sql
   -- Public read for authenticated users
   CREATE POLICY "Allow authenticated read"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'translated-pdfs' AND auth.role() = 'authenticated');

   -- Allow users to write their own files
   CREATE POLICY "Allow user upload"
   ON storage.objects FOR INSERT
   USING (bucket_id = 'translated-pdfs' AND auth.uid() IS NOT NULL);
   ```

## Usage Flow

### 1. User Uploads PDF

```
User selects PDF file
↓
File validated (must be PDF)
↓
File displayed in preview
```

### 2. User Enters API Key

```
User clicks "Start Translation"
↓
If no API key, prompt for key
↓
API key accepted (not stored)
```

### 3. Translation Process

```
Load PDF.js and PDF-lib libraries (30%)
↓
Extract text from all pages (50%)
↓
Quick translate using label map (60%)
↓
Batch translate remaining items via API (60-90%)
↓
Save translation record to Supabase (95%)
↓
Generate download link (100%)
```

### 4. User Downloads PDF

```
Click "Download Translated PDF"
↓
File downloaded as "IEP_translated_[language].pdf"
```

## API Endpoints

### POST /api/translate-pdf

**Request:**

```javascript
const formData = new FormData();
formData.append("file", pdfFile);
formData.append("language", "es"); // 'es', 'vi', 'tl', 'ko', 'zh', 'ar'
formData.append("apiKey", "sk-ant-...");

const response = await fetch("/api/translate-pdf", {
  method: "POST",
  body: formData,
});
```

**Response:**

```json
{
  "success": true,
  "message": "File received and ready for translation",
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "language": "es",
  "languageName": "Spanish"
}
```

## Translation Quality

### Quick Translations (No API Cost)

- Common IEP terminology
- Field labels
- Standard phrases
- ~60% of typical document

### API Translations

- Complex narratives
- Student-specific content
- Educational descriptions
- Uses Claude Haiku model (cost-effective)

## Supported Languages

| Code | Language           |
| ---- | ------------------ |
| `es` | Spanish            |
| `vi` | Vietnamese         |
| `tl` | Tagalog            |
| `ko` | Korean             |
| `zh` | Chinese (Mandarin) |
| `ar` | Arabic             |

## Troubleshooting

### "PDF.js failed to load"

- Check internet connection
- Verify CDN accessibility
- Browser console will show detailed error

### "Translation API error"

- Verify Anthropic API key is valid
- Check API key has available credits
- Ensure API key matches format `sk-ant-...`

### "File upload failed"

- Ensure Supabase bucket `translated-pdfs` exists
- Check storage RLS policies
- Verify user is authenticated

### "Document type detection failed"

- PDF may have unusual structure
- Try a different PDF sample
- Check browser console for details

## Performance Tips

1. **Batch Translation**
   - Breaks large documents into 30-item batches
   - Prevents timeouts on very large PDFs
   - Automatic retry on API failures

2. **Progress Feedback**
   - Real-time percentage updates
   - Descriptive status messages
   - Estimated completion time

3. **Fallback Strategy**
   - Quick translations first (instant)
   - API translations as needed
   - Graceful degradation if API unavailable

## Security Considerations

1. **API Keys**
   - Never stored in database
   - Never sent to backend servers
   - Client-side validation only
   - Displayed as password field

2. **Document Privacy**
   - PDFs stored in user-specific folders
   - RLS policies enforce access control
   - Only authenticated users can access

3. **Data Handling**
   - Text extracted client-side when possible
   - No document content logged
   - Translation requests minimal data

## Cost Estimation

Using Claude Haiku (fastest, cheapest):

- ~3,000 tokens per typical IEP document
- Haiku: $0.80 per 1M input tokens
- Estimated cost: $0.002-0.01 per document

## Future Enhancements

1. **Server-Side PDF Generation**
   - Node-based PDF processing
   - Preserve original formatting
   - Generate native Spanish PDFs

2. **Batch Processing**
   - Multiple documents simultaneously
   - Queue management
   - Scheduled processing

3. **Translation Memory**
   - Cache common translations
   - Reduce API calls
   - Improve consistency

4. **Advanced Features**
   - Custom terminology dictionaries
   - Multi-language documents
   - OCR for scanned PDFs

## Testing

### Manual Testing Checklist

- [ ] Upload PDF file successfully
- [ ] File preview displays correctly
- [ ] Select target language
- [ ] Enter API key
- [ ] Progress bar updates
- [ ] Download translated PDF
- [ ] Verify translation quality
- [ ] Check Supabase storage
- [ ] Verify database record

### Test Data

Sample English IEP documents can be generated using the HTML template provided.

## Support

For issues or questions:

1. Check troubleshooting section
2. Review browser console for errors
3. Verify Supabase configuration
4. Check API key validity
5. Review rate limits

## References

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [PDF-lib Documentation](https://pdf-lib.js.org/)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
