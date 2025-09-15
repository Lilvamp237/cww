// src/app/(dashboard)/scheduler/page.tsx
'use client'; // This will be a client component because of interactivity

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar'; // Shadcn calendar
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, PlusCircleIcon } from 'lucide-react'; // For icons

// For form handling (next step)
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


export default function SchedulerPage() {
  const supabase = createClientComponentClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('09:00'); // Default time
  const [shiftEndTime, setShiftEndTime] = useState('17:00');   // Default time
  const [shiftNotes, setShiftNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you'd fetch shifts from Supabase here and mark them on the calendar
  // For now, this is just a placeholder.

  const handleAddShift = async () => {
    if (!selectedDate || !shiftTitle || !shiftStartTime || !shiftEndTime) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Combine selectedDate with time inputs
      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = shiftStartTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [endHour, endMinute] = shiftEndTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      // Ensure end time is after start time (handle overnight shifts if needed later)
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1); // Assume it's an overnight shift if end time is earlier/same
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not logged in.');
        return;
      }

      const { error: dbError } = await supabase
        .from('shifts')
        .insert({
          user_id: user.id,
          title: shiftTitle,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: shiftNotes,
        });

      if (dbError) {
        setError(dbError.message);
      } else {
        // Shift added successfully
        setShiftTitle('');
        setShiftNotes('');
        // Optionally, refresh data here or close dialog
        setIsDialogOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Smart Shift & Life Scheduler</h1>
      <p className="text-gray-600">Plan your work shifts and personal life in one place.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              // disabled={(date) => date > new Date() || date < new Date("1900-01-01")} // Example disabled dates
              initialFocus
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Shifts for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Shift</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your upcoming work shift.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={shiftTitle}
                      onChange={(e) => setShiftTitle(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., ER Duty, Night Shift"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start-time" className="text-right">
                      Start Time
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={shiftStartTime}
                      onChange={(e) => setShiftStartTime(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end-time" className="text-right">
                      End Time
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={shiftEndTime}
                      onChange={(e) => setShiftEndTime(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      className="col-span-3"
                      placeholder="Any specific duties or patient notes"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddShift} disabled={loading}>
                    {loading ? 'Adding...' : 'Save Shift'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Placeholder for displaying shifts */}
            <p className="text-muted-foreground">No shifts scheduled for this date.</p>
            <p className="text-sm">Click "Add Shift" to add one.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}