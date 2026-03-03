import { getSupabaseBrowserClient } from '@/lib/supabase';

export type UploadResult = {
  path: string;
  publicUrl: string;
};

function extFromFile(file: File): string {
  const byName = file.name.split('.').pop();
  if (byName && byName !== file.name) return byName.toLowerCase();
  const byType = file.type.split('/').pop();
  return (byType || 'bin').toLowerCase();
}

export async function uploadToPublicBucket(params: {
  bucket: string;
  pathPrefix: string;
  file: File;
}): Promise<UploadResult> {
  const { bucket, pathPrefix, file } = params;
  const supabase = getSupabaseBrowserClient();

  const ext = extFromFile(file);
  const safePrefix = pathPrefix.replace(/^\/+/, '').replace(/\/+$/, '');
  const path = `${safePrefix}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    const message = (uploadError as any)?.message ? String((uploadError as any).message) : String(uploadError);
    const lower = message.toLowerCase();
    if (lower.includes('bucket') && lower.includes('not found')) {
      throw new Error(
        `Supabase Storage bucket not found: "${bucket}". Create it in Supabase Dashboard (Storage) or fix the bucket name in code.`
      );
    }
    throw new Error(`Supabase Storage upload failed (bucket: "${bucket}"): ${message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data.publicUrl;
  if (!publicUrl) throw new Error('Failed to get public URL');

  return { path, publicUrl };
}
