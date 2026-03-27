"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function DocumentUploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedPDF, setTranslatedPDF] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("org_id")
          .eq("user_id", session.user.id)
          .single();
        
        setSessionData({
          userId: session.user.id,
          orgId: orgMember?.org_id
        });
      }
    }
    init();
  }, []);

  const languages = [
    { code: "es", name: "Spanish" },
    { code: "vi", name: "Vietnamese" },
    { code: "tl", name: "Tagalog" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese (Mandarin)" },
    { code: "ar", name: "Arabic" },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      e.dataTransfer.clearData();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTranslate = async () => {
    if (!file) {
      alert("Please upload a document first.");
      return;
    }
    if (!targetLanguage) {
      alert("Please select a target language.");
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);

    try {
      setTranslationProgress(10);

      // Create FormData for API call
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', targetLanguage);

      setTranslationProgress(30);

      // Call the translate-pdf API
      const response = await fetch('/api/translate-pdf', {
        method: 'POST',
        body: formData,
      });

      setTranslationProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const result = await response.json();
      const { translatedText } = result;
      setTranslationProgress(80);

      // Generate PDF dynamically using html2pdf.js to handle Arabic complex text, RTL, and Asian characters perfectly.
      const html2pdf = (await import('html2pdf.js')).default;
      
      const container = document.createElement("div");
      
      // Determine if RTL language
      const isRTL = targetLanguage === "ar";
      container.dir = isRTL ? "rtl" : "ltr";
      
      // We no longer escape < > because we are explicitly asking Claude to provide HTML tags
      const formattedText = translatedText.replace(/\n/g, "<br/>");
        
      container.innerHTML = `
        <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; word-wrap: break-word; line-height: 1.5; color: #000; direction: ${isRTL ? 'rtl' : 'ltr'}; text-align: ${isRTL ? 'right' : 'left'};">
          ${formattedText}
        </div>
      `;

      // Set PDF options
      const opt = {
        margin:       0.5,
        filename:     `translated_${targetLanguage}_${file.name}`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');

      setTranslationProgress(90);

      // Save translation record to database
      if (sessionData) {
        const fileName = `${Date.now()}_translated_${targetLanguage}_${file.name}`;
        
        // Upload to storage bucket
        const { error: uploadError } = await supabase.storage
          .from("translated-pdfs")
          .upload(`${sessionData.userId}/${fileName}`, pdfBlob, {
            contentType: "application/pdf",
          });

        if (uploadError) {
          console.error("Failed to upload to storage:", uploadError);
        }

        const { error } = await supabase.from("documents").insert({
          org_id: sessionData.orgId,
          user_id: sessionData.userId,
          file_name: fileName,
          file_size_kb: Math.round(pdfBlob.size / 1024),
          document_type: "Translation",
          target_language: targetLanguage,
          status: "Completed",
        });

        if (error) {
          console.warn("Failed to save to database:", error);
          // Don't throw here, translation was successful
        }
      }

      setTranslationProgress(100);

      // Set the translated PDF for download
      setTranslatedPDF({ blob: pdfBlob, lang: targetLanguage });

      const langName = languages.find(l => l.code === targetLanguage)?.name;
      alert(`Successfully translated to ${langName}!`);

      // Reset form
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTargetLanguage("");
      setIsTranslating(false);

    } catch (error) {
      console.error("Translation error:", error);
      alert("Failed to translate document: " + error.message);
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
  };

  const downloadPDF = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-black">New Translation</h1>
        <p className="text-sm text-gray mt-1">Upload a SEIS document, IEP, or assessment report to generate an accurate, compliant translation.</p>
      </div>

      <div className="bg-white border border-gray-border rounded-xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* DRAG AND DROP AREA */}
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-3">
            Upload Document <span className="text-gray font-normal">(PDF, DOCX)</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-moss bg-moss-pale/30"
                : file
                ? "border-gray-border bg-beige/30"
                : "border-gray-border hover:border-moss hover:bg-beige/30"
            }`}
             style={{ minHeight: "300px" }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            
            {!file ? (
              <div className="space-y-4 pointer-events-none">
                <div className="w-20 h-20 bg-moss-pale/50 rounded-full flex items-center justify-center mx-auto text-moss">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-semibold text-black mb-1">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-sm text-gray">
                    Maximum file size 50 MB.
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto bg-white border border-moss rounded-lg p-5 shadow-sm text-left relative flex items-center gap-4 animate-fade-slide">
                <div className="w-12 h-12 shrink-0 bg-moss-pale rounded-lg flex items-center justify-center text-moss">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-black truncate">{file.name}</div>
                  <div className="text-sm text-gray mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button 
                  onClick={removeFile}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray hover:bg-beige hover:text-red-500 transition-colors shrink-0"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-border pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          {/* TARGET LANGUAGE */}
          <div>
            <label htmlFor="language" className="block text-sm font-semibold text-charcoal mb-3">
              Target Language
            </label>
            <div className="relative">
              <select
                id="language"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={isTranslating}
                className="appearance-none w-full bg-beige/50 border border-gray-border text-black px-4 py-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-moss focus:border-moss transition-shadow text-base disabled:opacity-50"
              >
                <option value="" disabled>Select a language...</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div>
            <button
              onClick={handleTranslate}
              disabled={!file || !targetLanguage || isTranslating}
              className={`w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm ${
                file && targetLanguage && !isTranslating
                  ? "bg-moss text-white hover:bg-moss-light hover:shadow-md"
                  : "bg-gray-border text-gray cursor-not-allowed opacity-70"
              }`}
            >
              {isTranslating ? `Translating... ${translationProgress}%` : "Start Translation"}
            </button>
          </div>
        </div>

        {/* TRANSLATION PROGRESS */}
        {isTranslating && (
          <div className="space-y-2">
            <div className="w-full bg-gray-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-moss h-full rounded-full transition-all duration-300"
                style={{ width: `${translationProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray text-center">
              {translationProgress < 30 && "Loading PDF libraries..."}
              {translationProgress >= 30 && translationProgress < 60 && "Extracting document text..."}
              {translationProgress >= 60 && translationProgress < 90 && "Translating content..."}
              {translationProgress >= 90 && "Finalizing document..."}
            </p>
          </div>
        )}

        {/* DOWNLOAD BUTTON */}
        {translatedPDF && (
          <div>
            <button
              onClick={() => {
                downloadPDF(translatedPDF.blob, `IEP_translated_${translatedPDF.lang}.pdf`);
                setTranslatedPDF(null);
              }}
              className="w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm bg-green-600 text-white hover:bg-green-700 hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Translated PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
