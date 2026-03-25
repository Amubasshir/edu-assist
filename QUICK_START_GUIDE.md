# PDF Translator - Quick Start Guide

## Getting Started

### 1. Navigate to Translations Page

Go to your dashboard and click on **"New Translation"** under the Translations section.

### 2. Upload Your PDF

- **Click** the upload area or **drag & drop** your IEP PDF
- Supported formats: PDF, DOCX
- Maximum file size: 50 MB
- The file preview will appear once uploaded

### 3. Select Target Language

Choose from these languages:

- 🇪🇸 Spanish
- 🇻🇳 Vietnamese
- 🇵🇭 Tagalog
- 🇰🇷 Korean
- 🇨🇳 Chinese (Mandarin)
- 🇸🇦 Arabic

### 4. Get an API Key

You need an Anthropic Claude API key to enable translation:

1. Visit [api.anthropic.com](https://api.anthropic.com)
2. Sign up (free account)
3. Create an API key
4. Copy your key (starts with `sk-ant-`)

**⚠️ Important:** Your API key:

- Is NOT stored anywhere
- Is used ONLY for translation
- Is kept secure in your browser
- You can revoke it anytime

### 5. Start Translation

1. Click **"Start Translation"**
2. If prompted, paste your API key
3. Watch the progress bar (0-100%)
4. See status updates:
   - Loading PDF libraries...
   - Extracting document text...
   - Translating content...
   - Finalizing document...

### 6. Download Your PDF

Once translation completes:

1. Click **"Download Translated PDF"**
2. File saves as `IEP_translated_[language].pdf`
3. Document is stored in your translation history

## Understanding the Translation Process

### What Gets Translated?

- ✅ All document text
- ✅ Field labels and headers
- ✅ Student information
- ✅ Assessment results
- ✅ Goals and objectives
- ✅ Service descriptions

### What's Preserved?

- 🔒 Names (first, last, middle)
- 🔒 Dates (birthdate, IEP date, etc.)
- 🔒 ID numbers (Student ID, SSID, etc.)
- 🔒 Special codes (SLD, AUT, OHI, etc.)
- 🔒 Text in quotation marks

### Translation Quality

The system uses two approaches:

1. **Quick Translation** (~60% of document)
   - Uses pre-defined IEP term translations
   - Instant (no cost)
   - Examples: "Student Name", "IEP Date", "Autism"

2. **AI Translation** (~40% of document)
   - Complex narratives and descriptions
   - Uses Claude API
   - Maintains professional terminology
   - Preserves meaning and context

## Troubleshooting

### "Please enter your API key"

**Solution:**

1. Get a key from [api.anthropic.com](https://api.anthropic.com)
2. Paste it in the API Key field
3. Must start with `sk-ant-`

### "PDF.js failed to load"

**Solution:**

- Check internet connection
- Try again (libraries load from CDN)
- Check browser console for errors

### "Translation API error"

**Solution:**

- Verify API key is correct
- Check key has available credits
- Try a different PDF

### "Download not working"

**Solution:**

- Check browser popup blocker
- Try a different browser
- File should appear in Downloads folder

### Translation seems slow

**Normal behavior:**

- First translation: 15-30 seconds (loading libraries)
- Subsequent translations: 10-15 seconds
- Depends on document size and complexity

## Cost Explanation

### What's the Cost?

Using Claude Haiku (fast, affordable):

- **Typical IEP**: $0.002 - $0.01
- **Large IEP**: $0.01 - $0.05

Examples:

- **10 documents**: ~$0.05
- **100 documents**: ~$0.50
- **1000 documents**: ~$5-10/month

### How to Save Money

1. **Use quick translations** - Free, pre-defined terms (~60%)
2. **Batch similar documents** - More efficient processing
3. **Use lower cost tiers** - Claude Haiku is recommended

### Managing Your Budget

At [api.anthropic.com](https://api.anthropic.com):

1. Go to Billing
2. Set usage limits
3. Monitor your spending
4. Adjust as needed

## Tips for Best Results

### 1. **Use Clear, Well-Formatted PDFs**

- ✅ Good: Typed IEP documents with clear structure
- ❌ Avoid: Scanned, unclear, or poorly formatted PDFs

### 2. **Prepare Your API Key**

- Have it ready before translating
- Don't share it with others
- Keep it secure

### 3. **Check Results**

- Review translated document
- Verify complex sections
- Note any terminology that needs adjustment

### 4. **Save Your Translations**

- Download immediately after completion
- Store securely
- Keep original for reference

## Common Questions

### Q: Is my PDF stored?

**A:** The PDF is processed in your browser and not stored on our servers. Only translation metadata is saved.

### Q: Can I translate multiple documents?

**A:** Currently one at a time. Upload, translate, download, repeat.

### Q: What if translation is wrong?

**A:**

- Complex narratives may need manual review
- Unusual terminology might not translate perfectly
- Always review critical sections

### Q: Can I use my own API key?

**A:** Yes! That's exactly how it works. You provide your own Claude API key.

### Q: Is there a monthly limit?

**A:** No limit based on us. Your limit depends on your API credits and budget.

### Q: Can I download the original PDF?

**A:** The original is shown during preview. You can save it from there.

### Q: What languages are supported?

**A:** 6 languages currently: Spanish, Vietnamese, Tagalog, Korean, Chinese (Mandarin), Arabic.

### Q: Can I add more languages?

**A:** Contact support or submit a feature request.

## Getting Help

### Common Issues:

1. **API Key Problems** → Check format (sk-ant-...)
2. **PDF Won't Upload** → Verify it's a PDF file
3. **Translation Fails** → Check internet connection
4. **Download Issues** → Check browser settings

### Resources:

- [Anthropic Documentation](https://docs.anthropic.com/)
- [API Status](https://status.anthropic.com/)
- [Support](contact your administrator)

## Next Steps

1. ✅ Get an API key
2. ✅ Try translating a test PDF
3. ✅ Review the translation
4. ✅ Download and save
5. ✅ Use for your documents

## Security Reminders

- 🔐 Never share your API key
- 🔐 API key is used only for translation
- 🔐 Your documents are processed securely
- 🔐 Translation history is stored safely
- 🔐 You can revoke your API key anytime

---

**Ready to get started?** Navigate to Dashboard → Translations and upload your first document!

**Questions?** Check the troubleshooting section above or contact your administrator.
