// src/app/(dashboard)/scheduler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, PlusCircleIcon, EditIcon, Trash2Icon } from 'lucide-react';
import { type DayPicker } from 'react-day-picker'; // For modifier styles
import { Day } from 'react-day-picker'; // Make sure to add 'Day' to this import


// Define a type for our Shift object
export type Shift = {
  id: number;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes: string | null;
};

export default function SchedulerPage() {
  const supabase = createClientComponentClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // State for managing dialogs
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // States for the form
  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('09:00');
  const [shiftEndTime, setShiftEndTime] = useState('17:00');
  const [shiftNotes, setShiftNotes] = useState('');
  
  // States for data handling
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch shifts on component mount
  const fetchShifts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('shifts').select('*').eq('user_id', user.id).order('start_time');
      if (error) setError(error.message);
      else setShifts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // --- NEW: Function to open the dialog for editing ---
  const handleEditClick = (shift: Shift) => {
    setIsEditMode(true);
    setSelectedShift(shift);
    setShiftTitle(shift.title);
    setShiftStartTime(format(parseISO(shift.start_time), 'HH:mm'));
    setShiftEndTime(format(parseISO(shift.end_time), 'HH:mm'));
    setShiftNotes(shift.notes || '');
    setError(null);
    setIsShiftDialogOpen(true);
  };
  
  // --- NEW: Function to open the dialog for adding a new shift ---
  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedShift(null);
    setShiftTitle('');
    setShiftStartTime('09:00');
    setShiftEndTime('17:00');
    setShiftNotes('');
    setError(null);
    setIsShiftDialogOpen(true);
  };
  
  // --- UPDATED: Combined function for both adding and updating a shift ---
  const handleSaveShift = async () => {
    if (!selectedDate && !isEditMode || !shiftTitle || !shiftStartTime || !shiftEndTime) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);

    const dateToUse = isEditMode ? parseISO(selectedShift!.start_time) : selectedDate!;
    
    const startDateTime = new Date(dateToUse);
    startDateTime.setHours(parseInt(shiftStartTime.split(':')[0]), parseInt(shiftStartTime.split(':')[1]));

    const endDateTime = new Date(dateToUse);
    endDateTime.setHours(parseInt(shiftEndTime.split(':')[0]), parseInt(shiftEndTime.split(':')[1]));

    if (endDateTime <= startDateTime) endDateTime.setDate(endDateTime.getDate() + 1);

    const shiftData = {
      title: shiftTitle,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      notes: shiftNotes,
    };

    let dbError = null;
    if (isEditMode) {
      const { error } = await supabase.from('shifts').update(shiftData).match({ id: selectedShift!.id });
      dbError = error;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('shifts').insert({ ...shiftData, user_id: user!.id });
      dbError = error;
    }

    if (dbError) {
      setError(dbError.message);
    } else {
      setIsShiftDialogOpen(false);
      await fetchShifts();
    }
    setLoading(false);
  };

  // --- NEW: Function to delete a shift ---
  const handleDeleteShift = async (shiftId: number) => {
    setLoading(true);
    const { error } = await supabase.from('shifts').delete().match({ id: shiftId });
    if (error) {
      setError(error.message);
    } else {
      await fetchShifts(); // Refresh list after deleting
    }
    setLoading(false);
  };

  // Filter shifts for the selected date
  const shiftsForSelectedDay = shifts.filter(shift => 
    selectedDate && isSameDay(parseISO(shift.start_time), selectedDate)
  );

  // --- NEW: Create modifiers for the calendar ---
  const shiftDays = shifts.map(shift => startOfDay(parseISO(shift.start_time)));
  const modifiers: DayPicker['modifiers'] = { hasShift: shiftDays };
  const modifiersStyles: DayPicker['modifiersStyles'] = {
    hasShift: {
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Smart Shift & Life Scheduler</h1>
      <p className="text-gray-600">Plan your work shifts and personal life in one place.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {/* UPDATED CALENDAR COMPONENT */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              initialFocus
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Shifts for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}</CardTitle>
            <Button size="sm" onClick={handleAddClick}>
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Shift
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading shifts...</p> : shiftsForSelectedDay.length > 0 ? (
              <ul className="space-y-4">
                {shiftsForSelectedDay.map((shift) => (
                  <li key={shift.id} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{shift.title}</h3>
                        <p className="text-sm text-muted-foreground">{format(parseISO(shift.start_time), 'p')} - {format(parseISO(shift.end_time), 'p')}</p>
                        {shift.notes && <p className="text-sm mt-2 pt-2 border-t">{shift.notes}</p>}
                      </div>
                      {/* NEW: Edit and Delete Buttons */}
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(shift)}>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. This will permanently delete this shift.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteShift(shift.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <CalendarIcon className="mx-auto h-12 w-12" />
                <p className="mt-4">No shifts scheduled for this date.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* UPDATED SHIFT DIALOG (for both Add and Edit) */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details for your shift.' : `Fill in the details for your upcoming shift on ${selectedDate ? format(selectedDate, 'PPP') : ''}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form fields are the same */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right">Start Time</Label>
              <Input id="start-time" type="time" value={shiftStartTime} onChange={(e) => setShiftStartTime(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right">End Time</Label>
              <Input id="end-time" type="time" value={shiftEndTime} onChange={(e) => setShiftEndTime(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea id="notes" value={shiftNotes} onChange={(e) => setShiftNotes(e.target.value)} className="col-span-3" />
            </div>
            {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveShift} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}