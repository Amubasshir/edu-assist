import { supabase } from './supabase';

// Upload translated PDF to Supabase Storage
export async function uploadTranslatedPDF(pdfBytes, fileName, userId, orgId, language) {
  try {
    const filePath = `${orgId}/${userId}/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from('translated-pdfs')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) throw error;

    return {
      filePath,
      publicUrl: supabase.storage
        .from('translated-pdfs')
        .getPublicUrl(filePath).data.publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Save translation record to database
export async function saveTranslationRecord(metadata) {
  try {
    const { data, error } = await supabase
      .from('document_translations')
      .insert([{
        user_id: metadata.userId,
        org_id: metadata.orgId,
        original_filename: metadata.originalFileName,
        translated_filename: metadata.translatedFileName,
        source_language: 'en',
        target_language: metadata.language,
        file_size: metadata.fileSize,
        storage_path: metadata.storagePath,
        translation_date: new Date().toISOString(),
        status: 'completed'
      }]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

// Get translation history for user
export async function getTranslationHistory(userId, orgId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('document_translations')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .order('translation_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('History fetch error:', error);
    throw error;
  }
}

// Delete old translations (cleanup utility)
export async function cleanupOldTranslations(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Get old records
    const { data: oldRecords, error: fetchError } = await supabase
      .from('document_translations')
      .select('storage_path')
      .lt('translation_date', cutoffDate.toISOString());

    if (fetchError) throw fetchError;

    // Delete files from storage
    for (const record of oldRecords || []) {
      if (record.storage_path) {
        await supabase.storage
          .from('translated-pdfs')
          .remove([record.storage_path]);
      }
    }

    // Delete records from database
    const { error: deleteError } = await supabase
      .from('document_translations')
      .delete()
      .lt('translation_date', cutoffDate.toISOString());

    if (deleteError) throw deleteError;

    return { deletedCount: oldRecords?.length || 0 };
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
}