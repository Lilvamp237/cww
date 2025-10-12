// src/app/(dashboard)/scheduler/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClientComponentClient } from '@/lib/supabase/client';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircleIcon, EditIcon, Trash2Icon, BriefcaseIcon, HeartIcon, LayoutGridIcon, CheckCircle2, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types
type Shift = {
  id: number;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  category?: string;
  color?: string;
};

type PersonalTask = {
  id: number;
  user_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority: string;
  category: string;
  completed: boolean;
  completed_at?: string | null;
};

type Habit = {
  id: number;
  user_id: string;
  name: string;
  description?: string | null;
  frequency: string;
  target_count: number;
  icon?: string | null;
  color?: string;
  active: boolean;
};

type HabitLog = {
  id: number;
  habit_id: number;
  user_id: string;
  log_date: string;
  count: number;
  notes?: string | null;
};

export default function SchedulerPage() {
  const supabase = createClientComponentClient();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'work' | 'personal'>('all');
  
  // Date state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Dialog states
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedTask, setSelectedTask] = useState<PersonalTask | null>(null);

  // Shift form states
  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('09:00');
  const [shiftEndTime, setShiftEndTime] = useState('17:00');
  const [shiftNotes, setShiftNotes] = useState('');
  const [shiftColor, setShiftColor] = useState('#3b82f6');
  
  // Task form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskCategory, setTaskCategory] = useState('personal');
  
  // Habit form states
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitFrequency, setHabitFrequency] = useState('daily');
  const [habitTargetCount, setHabitTargetCount] = useState(1);
  const [habitColor, setHabitColor] = useState('#10b981');
  
  // Data states
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick add state
  const [quickAddText, setQuickAddText] = useState('');

  // Fetch all data
  const fetchShifts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('shifts').select('*').eq('user_id', user.id).order('start_time');
      if (error) setError(error.message);
      else setShifts(data || []);
    }
  }, [supabase]);

  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('personal_tasks').select('*').eq('user_id', user.id).order('due_date');
      if (error) setError(error.message);
      else setTasks(data || []);
    }
  }, [supabase]);

  const fetchHabits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('habits').select('*').eq('user_id', user.id).eq('active', true);
      if (error) setError(error.message);
      else setHabits(data || []);
    }
  }, [supabase]);

  const fetchHabitLogs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('habit_logs').select('*').eq('user_id', user.id);
      if (error) setError(error.message);
      else setHabitLogs(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    fetchShifts();
    fetchTasks();
    fetchHabits();
    fetchHabitLogs();
  }, [fetchShifts, fetchTasks, fetchHabits, fetchHabitLogs]);

  // Shift handlers
  const handleAddShift = () => {
    setIsEditMode(false);
    setSelectedShift(null);
    setShiftTitle('');
    setShiftStartTime('09:00');
    setShiftEndTime('17:00');
    setShiftNotes('');
    setShiftColor('#3b82f6');
    setIsShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setIsEditMode(true);
    setSelectedShift(shift);
    setShiftTitle(shift.title);
    setShiftStartTime(format(parseISO(shift.start_time), 'HH:mm'));
    setShiftEndTime(format(parseISO(shift.end_time), 'HH:mm'));
    setShiftNotes(shift.notes || '');
    setShiftColor(shift.color || '#3b82f6');
    setIsShiftDialogOpen(true);
  };

  const handleSaveShift = async () => {
    if (!selectedDate || !shiftTitle.trim()) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startDateTime = `${dateStr}T${shiftStartTime}:00`;
    const endDateTime = `${dateStr}T${shiftEndTime}:00`;

    const shiftData = {
      user_id: user.id,
      title: shiftTitle,
      start_time: startDateTime,
      end_time: endDateTime,
      notes: shiftNotes,
      category: 'work',
      color: shiftColor,
    };

    if (isEditMode && selectedShift) {
      const { error } = await supabase.from('shifts').update(shiftData).eq('id', selectedShift.id);
      if (error) setError(error.message);
      else await fetchShifts();
    } else {
      const { error } = await supabase.from('shifts').insert([shiftData]);
      if (error) setError(error.message);
      else await fetchShifts();
    }

    setLoading(false);
    setIsShiftDialogOpen(false);
  };

  const handleDeleteShift = async (shiftId: number) => {
    setLoading(true);
    const { error } = await supabase.from('shifts').delete().eq('id', shiftId);
    if (error) setError(error.message);
    else await fetchShifts();
    setLoading(false);
  };

  // Task handlers
  const handleAddTask = () => {
    setIsEditMode(false);
    setSelectedTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueTime('');
    setTaskPriority('medium');
    setTaskCategory('personal');
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: PersonalTask) => {
    setIsEditMode(true);
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskDueTime(task.due_time || '');
    setTaskPriority(task.priority);
    setTaskCategory(task.category);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = async () => {
    if (!selectedDate || !taskTitle.trim()) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const taskData = {
      user_id: user.id,
      title: taskTitle,
      description: taskDescription,
      due_date: format(selectedDate, 'yyyy-MM-dd'),
      due_time: taskDueTime || null,
      priority: taskPriority,
      category: taskCategory,
    };

    if (isEditMode && selectedTask) {
      const { error } = await supabase.from('personal_tasks').update(taskData).eq('id', selectedTask.id);
      if (error) setError(error.message);
      else await fetchTasks();
    } else {
      const { error } = await supabase.from('personal_tasks').insert([taskData]);
      if (error) setError(error.message);
      else await fetchTasks();
    }

    setLoading(false);
    setIsTaskDialogOpen(false);
  };

  const handleToggleTaskComplete = async (task: PersonalTask) => {
    const { error } = await supabase.from('personal_tasks').update({
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null,
    }).eq('id', task.id);
    
    if (error) setError(error.message);
    else await fetchTasks();
  };

  const handleDeleteTask = async (taskId: number) => {
    setLoading(true);
    const { error } = await supabase.from('personal_tasks').delete().eq('id', taskId);
    if (error) setError(error.message);
    else await fetchTasks();
    setLoading(false);
  };

  // Habit handlers
  const handleAddHabit = () => {
    setHabitName('');
    setHabitDescription('');
    setHabitFrequency('daily');
    setHabitTargetCount(1);
    setHabitColor('#10b981');
    setIsHabitDialogOpen(true);
  };

  const handleSaveHabit = async () => {
    if (!habitName.trim()) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const habitData = {
      user_id: user.id,
      name: habitName,
      description: habitDescription,
      frequency: habitFrequency,
      target_count: habitTargetCount,
      color: habitColor,
      active: true,
    };

    const { error } = await supabase.from('habits').insert([habitData]);
    if (error) setError(error.message);
    else await fetchHabits();

    setLoading(false);
    setIsHabitDialogOpen(false);
  };

  const handleLogHabit = async (habitId: number) => {
    if (!selectedDate) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const logDate = format(selectedDate, 'yyyy-MM-dd');
    const existingLog = habitLogs.find(log => log.habit_id === habitId && log.log_date === logDate);

    if (existingLog) {
      const { error } = await supabase.from('habit_logs').update({
        count: existingLog.count + 1,
      }).eq('id', existingLog.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('habit_logs').insert([{
        habit_id: habitId,
        user_id: user.id,
        log_date: logDate,
        count: 1,
      }]);
      if (error) setError(error.message);
    }
    
    await fetchHabitLogs();
  };

  // Quick add handler
  const handleQuickAdd = async () => {
    if (!quickAddText.trim() || !selectedDate) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    // Simple parsing: if contains "shift" or time pattern, create shift, otherwise task
    const lowerText = quickAddText.toLowerCase();
    const timePattern = /(\d{1,2}):(\d{2})/g;
    const times = quickAddText.match(timePattern);
    
    if (lowerText.includes('shift') || (times && times.length >= 2)) {
      // Create shift
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const shiftData = {
        user_id: user.id,
        title: quickAddText.replace(/shift/gi, '').replace(timePattern, '').trim() || 'Quick Shift',
        start_time: `${dateStr}T${times?.[0] || '09:00'}:00`,
        end_time: `${dateStr}T${times?.[1] || '17:00'}:00`,
        category: 'work',
        color: '#3b82f6',
      };
      const { error } = await supabase.from('shifts').insert([shiftData]);
      if (error) setError(error.message);
      else await fetchShifts();
    } else {
      // Create task
      const taskData = {
        user_id: user.id,
        title: quickAddText,
        due_date: format(selectedDate, 'yyyy-MM-dd'),
        priority: 'medium',
        category: 'personal',
      };
      const { error } = await supabase.from('personal_tasks').insert([taskData]);
      if (error) setError(error.message);
      else await fetchTasks();
    }

    setQuickAddText('');
    setLoading(false);
  };

  // Filter data based on active tab
  const shiftsForSelectedDay = shifts.filter(shift => 
    selectedDate && isSameDay(parseISO(shift.start_time), selectedDate)
  );

  const tasksForSelectedDay = tasks.filter(task => 
    selectedDate && task.due_date && isSameDay(parseISO(task.due_date), selectedDate)
  );

  const habitsForSelectedDay = habits.map(habit => {
    const logDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const log = habitLogs.find(l => l.habit_id === habit.id && l.log_date === logDate);
    return { ...habit, loggedToday: log ? log.count : 0 };
  });

  // Calendar modifiers
  const workDays = shifts.map(shift => startOfDay(parseISO(shift.start_time)));
  const taskDays = tasks.filter(t => t.due_date).map(task => startOfDay(parseISO(task.due_date!)));
  const allActivityDays = [...workDays, ...taskDays];

  const modifiers = {
    hasWork: workDays,
    hasTask: taskDays,
    hasActivity: allActivityDays,
  };

  const modifiersClassNames = {
    hasWork: activeTab === 'work' || activeTab === 'all' ? 'bg-blue-500 text-white font-bold' : '',
    hasTask: activeTab === 'personal' || activeTab === 'all' ? 'bg-green-500 text-white font-bold' : '',
    hasActivity: activeTab === 'all' ? 'bg-primary text-primary-foreground font-bold' : '',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Scheduler</h1>
          <p className="text-gray-600">Manage your work shifts, personal tasks, and habits</p>
        </div>
        <Button onClick={handleAddHabit} variant="outline">
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Habit
        </Button>
      </div>

      {/* Quick Add */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Quick add: 'Shift 09:00 17:00' or 'Buy groceries'"
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <Button onClick={handleQuickAdd} disabled={loading || !quickAddText.trim()}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for filtering view */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'work' | 'personal')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            <LayoutGridIcon className="mr-2 h-4 w-4" /> All
          </TabsTrigger>
          <TabsTrigger value="work">
            <BriefcaseIcon className="mr-2 h-4 w-4" /> Work
          </TabsTrigger>
          <TabsTrigger value="personal">
            <HeartIcon className="mr-2 h-4 w-4" /> Personal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  initialFocus
                />
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddShift} variant="default">
                    <BriefcaseIcon className="mr-2 h-4 w-4" /> Add Shift
                  </Button>
                  <Button size="sm" onClick={handleAddTask} variant="outline">
                    <HeartIcon className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shifts */}
                {shiftsForSelectedDay.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <BriefcaseIcon className="mr-2 h-4 w-4" /> Work Shifts
                    </h3>
                    <div className="space-y-2">
                      {shiftsForSelectedDay.map(shift => (
                        <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderLeftWidth: '4px', borderLeftColor: shift.color || '#3b82f6' }}>
                          <div>
                            <p className="font-semibold">{shift.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(shift.start_time), 'h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')}
                            </p>
                            {shift.notes && <p className="text-xs text-muted-foreground mt-1">{shift.notes}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditShift(shift)}>
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this shift? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteShift(shift.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {tasksForSelectedDay.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <HeartIcon className="mr-2 h-4 w-4" /> Personal Tasks
                    </h3>
                    <div className="space-y-2">
                      {tasksForSelectedDay.map(task => (
                        <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${task.completed ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <button onClick={() => handleToggleTaskComplete(task)}>
                              {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                              {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {task.priority}
                                </span>
                                <span className="text-xs text-muted-foreground">{task.category}</span>
                                {task.due_time && <span className="text-xs text-muted-foreground">{task.due_time}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)}>
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this task?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Habits */}
                {habitsForSelectedDay.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Daily Habits</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {habitsForSelectedDay.map(habit => (
                        <button
                          key={habit.id}
                          onClick={() => handleLogHabit(habit.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            habit.loggedToday >= habit.target_count
                              ? 'bg-green-50 border-green-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <p className="font-medium">{habit.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {habit.loggedToday} / {habit.target_count} {habit.frequency}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {shiftsForSelectedDay.length === 0 && tasksForSelectedDay.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No events scheduled for this day. Add a shift or task to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="work" className="space-y-6">
          {/* Similar layout but filtered for work only */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Work Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{ hasWork: workDays }}
                  modifiersClassNames={{ hasWork: 'bg-blue-500 text-white font-bold' }}
                  initialFocus
                />
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Work Shifts - {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}</CardTitle>
                <Button size="sm" onClick={handleAddShift}>
                  <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Shift
                </Button>
              </CardHeader>
              <CardContent>
                {shiftsForSelectedDay.length > 0 ? (
                  <div className="space-y-2">
                    {shiftsForSelectedDay.map(shift => (
                      <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderLeftWidth: '4px', borderLeftColor: shift.color || '#3b82f6' }}>
                        <div>
                          <p className="font-semibold">{shift.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(shift.start_time), 'h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')}
                          </p>
                          {shift.notes && <p className="text-xs text-muted-foreground mt-1">{shift.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditShift(shift)}>
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this shift?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteShift(shift.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No shifts scheduled for this day.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {/* Similar layout but filtered for personal only */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Personal Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{ hasTask: taskDays }}
                  modifiersClassNames={{ hasTask: 'bg-green-500 text-white font-bold' }}
                  initialFocus
                />
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Personal Tasks - {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}</CardTitle>
                <Button size="sm" onClick={handleAddTask}>
                  <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasksForSelectedDay.length > 0 ? (
                  <div className="space-y-2">
                    {tasksForSelectedDay.map(task => (
                      <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${task.completed ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-3 flex-1">
                          <button onClick={() => handleToggleTaskComplete(task)}>
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                            {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority}
                              </span>
                              <span className="text-xs text-muted-foreground">{task.category}</span>
                              {task.due_time && <span className="text-xs text-muted-foreground">{task.due_time}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)}>
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this task?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No tasks for this day.</p>
                )}

                {/* Habits section */}
                {habitsForSelectedDay.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Daily Habits</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {habitsForSelectedDay.map(habit => (
                        <button
                          key={habit.id}
                          onClick={() => handleLogHabit(habit.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            habit.loggedToday >= habit.target_count
                              ? 'bg-green-50 border-green-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <p className="font-medium">{habit.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {habit.loggedToday} / {habit.target_count} {habit.frequency}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Shift Dialog */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
            <DialogDescription>
              {selectedDate && `For ${format(selectedDate, 'PPP')}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shift-title">Shift Title</Label>
              <Input id="shift-title" value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} placeholder="e.g., Morning Shift" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shift-start">Start Time</Label>
                <Input type="time" id="shift-start" value={shiftStartTime} onChange={(e) => setShiftStartTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="shift-end">End Time</Label>
                <Input type="time" id="shift-end" value={shiftEndTime} onChange={(e) => setShiftEndTime(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="shift-color">Color</Label>
              <Input type="color" id="shift-color" value={shiftColor} onChange={(e) => setShiftColor(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="shift-notes">Notes (Optional)</Label>
              <Textarea id="shift-notes" value={shiftNotes} onChange={(e) => setShiftNotes(e.target.value)} placeholder="Any additional details..." />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShiftDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveShift} disabled={loading || !shiftTitle.trim()}>
              {loading ? 'Saving...' : isEditMode ? 'Update Shift' : 'Add Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {selectedDate && `Due ${format(selectedDate, 'PPP')}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input id="task-title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g., Buy groceries" />
            </div>
            <div>
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea id="task-description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Additional details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-category">Category</Label>
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger id="task-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="hydration">Hydration</SelectItem>
                    <SelectItem value="rest">Rest</SelectItem>
                    <SelectItem value="errand">Errand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="task-time">Due Time (Optional)</Label>
              <Input type="time" id="task-time" value={taskDueTime} onChange={(e) => setTaskDueTime(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTask} disabled={loading || !taskTitle.trim()}>
              {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Habit Dialog */}
      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
            <DialogDescription>Track healthy behaviors daily</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input id="habit-name" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="e.g., Drink water" />
            </div>
            <div>
              <Label htmlFor="habit-description">Description (Optional)</Label>
              <Input id="habit-description" value={habitDescription} onChange={(e) => setHabitDescription(e.target.value)} placeholder="Why this habit matters" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="habit-frequency">Frequency</Label>
                <Select value={habitFrequency} onValueChange={setHabitFrequency}>
                  <SelectTrigger id="habit-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="habit-target">Target Count</Label>
                <Input type="number" id="habit-target" value={habitTargetCount} onChange={(e) => setHabitTargetCount(parseInt(e.target.value) || 1)} min={1} />
              </div>
            </div>
            <div>
              <Label htmlFor="habit-color">Color</Label>
              <Input type="color" id="habit-color" value={habitColor} onChange={(e) => setHabitColor(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHabitDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveHabit} disabled={loading || !habitName.trim()}>
              {loading ? 'Creating...' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
