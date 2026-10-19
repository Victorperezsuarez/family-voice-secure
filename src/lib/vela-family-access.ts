import { supabase } from '@/lib/supabase-client';

export type VelaFamilyRole = 'admin' | 'contributor' | 'view-only';

/** Family membership is created by the database trigger, not the client. */
export async function createVelaFamily(name: string, userId: string) {
  const familyName = name.trim();
  if (!familyName) throw new Error('Family name is required');
  const { data, error } = await supabase
    .from('families')
    .insert({ name: familyName, created_by: userId })
    .select('id, name, created_by')
    .single();
  if (error) throw error;
  return data;
}

/** Return token once; never persist it in localStorage or application logs. */
export async function issueVelaFamilyInvitation(
  familyId: string, email: string, role: VelaFamilyRole = 'contributor'
) {
  const { data, error } = await supabase.rpc('vela_issue_family_invitation', {
    p_family_id: familyId,
    p_email: email.trim().toLowerCase(),
    p_role: role,
  });
  if (error) throw error;
  const invitation = data?.[0];
  if (!invitation?.invitation_token) throw new Error('Invitation could not be created');
  return invitation as { invitation_id: string; invitation_token: string };
}

export async function acceptVelaFamilyInvitation(token: string) {
  const { data, error } = await supabase.rpc('vela_accept_family_invitation', {
    p_token: token,
  });
  if (error) throw error;
  return data as string;
}
