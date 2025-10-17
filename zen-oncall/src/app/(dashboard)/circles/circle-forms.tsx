'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createCircle, joinCircle } from '@/lib/actions/circle-actions';
import { useEffect, useRef } from 'react';

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Submitting...' : children}</Button>;
}

export function CreateCircleForm() {
  const [state, formAction] = useActionState(createCircle, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form on successful submission
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form action={formAction} ref={formRef} className="space-y-4">
      <Input name="name" placeholder="e.g., ER Night Shift Team" required />
      <SubmitButton>Create Circle</SubmitButton>
      {state?.error && <p className="text-sm text-red-500 pt-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500 pt-2">{state.success}</p>}
    </form>
  );
}

export function JoinCircleForm() {
  const [state, formAction] = useActionState(joinCircle, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);
  
  return (
    <form action={formAction} ref={formRef} className="space-y-4">
      <Input name="invite_code" placeholder="Enter invite code" required />
      <SubmitButton>Join Circle</SubmitButton>
      {state?.error && <p className="text-sm text-red-500 pt-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500 pt-2">{state.success}</p>}
    </form>
  );
}