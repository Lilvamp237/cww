// src/lib/actions/circle-actions.ts
'use server';

// Use the dedicated helper for Server Actions
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'; 
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

// This is the required signature for useFormState
type FormState = {
  error?: string;
  success?: string;
} | null;


export async function createCircle(prevState: FormState, formData: FormData): Promise<FormState> {
  // Use createServerActionClient - it's synchronous and designed for this
  const supabase = createServerActionClient({ cookies }); 
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create a circle.' };
  }

  const name = formData.get('name') as string;
  if (!name || name.trim().length < 3) {
    return { error: 'Circle name must be at least 3 characters long.' };
  }

  const inviteCode = nanoid(8);

  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .insert({ name, created_by: user.id, invite_code: inviteCode })
    .select()
    .single();

  if (circleError) {
    console.error('Create Circle Error:', circleError);
    return { error: `Database error: ${circleError.message}` };
  }

  const { error: memberError } = await supabase
    .from('circle_members')
    .insert({ circle_id: circle.id, user_id: user.id });

  if (memberError) {
    console.error('Add Member Error:', memberError);
    return { error: `Database error: ${memberError.message}` };
  }

  revalidatePath('/circles');
  return { success: 'Circle created successfully!' };
}

export async function joinCircle(prevState: FormState, formData: FormData): Promise<FormState> {
  // Use createServerActionClient here as well
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to join a circle.' };
  }

  const inviteCode = formData.get('invite_code') as string;
  if (!inviteCode) {
    return { error: 'Invite code is required.' };
  }

  const { data: circle, error: findError } = await supabase
    .from('circles')
    .select('id')
    .eq('invite_code', inviteCode)
    .single();

  if (findError || !circle) {
    return { error: 'Invalid invite code.' };
  }

  const { error: joinError } = await supabase
    .from('circle_members')
    .insert({ circle_id: circle.id, user_id: user.id });

  if (joinError) {
    if (joinError.code === '23505') { // Unique constraint violation
      return { error: 'You are already a member of this circle.' };
    }
    console.error('Join Circle Error:', joinError);
    return { error: `Database error: ${joinError.message}` };
  }

  revalidatePath('/circles');
  return { success: 'Successfully joined circle!' };
}