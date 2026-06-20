import { supabase } from './supabase';

export async function uploadAudioOrVideo(file, folder = 'services') {
  if (!supabase) {
    throw new Error('Supabase storage is not configured.');
  }

  const bucket = 'sounds';
  const fileExt = file.name.split('.').pop() || 'bin';
  const recordId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const path = `${folder}/${recordId}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    path,
    url: data?.publicUrl || '',
    bucket,
  };
}
