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

// Get all family members for a family
export async function getFamilyMembers(familyId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
// Get the authenticated user's family membership
export async function getCurrentUserFamily() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from('family_users')
    .select('family_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
} 
// Get memories for a family
export async function getFamilyMemories(familyId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select(`
      *,
      family_member:family_members(
        id,
        name,
        relationship
      )
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
