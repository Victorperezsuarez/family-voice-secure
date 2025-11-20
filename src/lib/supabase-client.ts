import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upload audio file to Supabase Storage
export async function uploadAudio(file: Blob, fileName: string) {
  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(`audio/${fileName}`, file, {
      contentType: 'audio/webm',
      upsert: false
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('recordings')
    .getPublicUrl(data.path);

  return publicUrl;
}

// Save recording metadata
export async function saveRecording(recording: any) {
  const { data, error } = await supabase
    .from('recordings')
    .insert(recording)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all recordings with family member info
export async function getRecordings(userId: string) {
  const { data, error } = await supabase
    .from('recordings')
    .select(`
      *,
      family_member:family_members(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Save family member
export async function saveFamilyMember(member: any) {
  const { data, error } = await supabase
    .from('family_members')
    .insert(member)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all family members
export async function getFamilyMembers(userId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
