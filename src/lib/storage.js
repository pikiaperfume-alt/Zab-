import { supabase } from './supabase';

export const DEFAULT_MEDIA_BUCKET = 'sounds';

export function isRemoteUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export function isStoragePath(value) {
  return typeof value === 'string' && value.includes('/') && !isRemoteUrl(value);
}

export function resolveMediaUrl(pathOrUrl, bucket = DEFAULT_MEDIA_BUCKET) {
  if (!pathOrUrl) return '';
  if (isRemoteUrl(pathOrUrl)) return pathOrUrl;
  if (!supabase) return '';

  const { data } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);
  return data?.publicUrl || '';
}

export async function uploadMediaFile(bucket, path, file, options = {}) {
  if (!supabase) {
    throw new Error('Supabase storage is not configured.');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      ...options,
    });

  if (error) {
    throw error;
  }

  return { path };
}

export async function createSignedMediaUrl(path, bucket = DEFAULT_MEDIA_BUCKET, expiresIn = 3600) {
  if (!supabase) {
    throw new Error('Supabase storage is not configured.');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data?.signedUrl || '';
}
