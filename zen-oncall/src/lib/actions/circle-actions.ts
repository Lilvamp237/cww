'use server';

import { createServerClient } from '@/lib/supabase/server'; // <-- Import our new helper
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

type FormState = { error?: string; success?: string; } | null;

export async function createCircle(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createServerClient(); // <-- Use our new helper
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be logged in to create a circle.' };

  const name = formData.get('name') as string;
  if (!name || name.trim().length < 3) {
    return { error: 'Circle name must be at least 3 characters long.' };
  }

  const inviteCode = nanoid(8);

  // Insert the circle
  const { data: newCircle, error: circleError } = await supabase
    .from('circles')
    .insert({ name, created_by: user.id, invite_code: inviteCode })
    .select('id')
    .single();

  if (circleError) return { error: `Database error: ${circleError.message}` };

  // Automatically add the creator as a member
  const { error: memberError } = await supabase
    .from('circle_members')
    .insert({ circle_id: newCircle.id, user_id: user.id });

  if (memberError) {
    // If adding the member fails, we should ideally delete the circle, but for simplicity:
    console.error('Failed to add creator as member:', memberError);
  }

  revalidatePath('/circles');
  return { success: 'Circle created successfully!' };
}

export async function joinCircle(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createServerClient(); // <-- Use our new helper
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be logged in to join a circle.' };

  const inviteCode = formData.get('invite_code') as string;
  if (!inviteCode) return { error: 'Invite code is required.' };

  const { data: circle, error: findError } = await supabase
    .from('circles')
    .select('id')
    .eq('invite_code', inviteCode)
    .single();

  if (findError || !circle) return { error: 'Invalid invite code.' };

  const { error: joinError } = await supabase
    .from('circle_members')
    .insert({ circle_id: circle.id, user_id: user.id });

  if (joinError) {
    if (joinError.code === '23505') return { error: 'You are already a member of this circle.' };
    return { error: `Database error: ${joinError.message}` };
  }

  revalidatePath('/circles');
  return { success: 'Successfully joined circle!' };
}