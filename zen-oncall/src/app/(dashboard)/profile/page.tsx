// src/app/(dashboard)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Briefcase, Stethoscope, Building, MapPin, Phone, Calendar, Shield, Award, Save, Loader2 } from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  
  // Medical Professional Fields
  medical_profession?: string;
  specialty?: string;
  sub_specialty?: string;
  license_number?: string;
  years_of_experience?: number;
  
  // Work Information
  hospital_name?: string;
  department?: string;
  work_location?: string;
  shift_type?: string;
  
  // Additional Info
  bio?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language?: string;
  timezone?: string;
  
  created_at?: string;
  updated_at?: string;
};

const medicalProfessions = [
  'Physician',
  'Nurse (RN)',
  'Nurse Practitioner (NP)',
  'Physician Assistant (PA)',
  'Surgeon',
  'Anesthesiologist',
  'Radiologist',
  'Psychiatrist',
  'Pharmacist',
  'Physical Therapist',
  'Occupational Therapist',
  'Respiratory Therapist',
  'Medical Technologist',
  'Paramedic',
  'EMT',
  'Other Healthcare Professional',
];

const specialties = [
  'Emergency Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Surgery',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Anesthesiology',
  'Radiology',
  'Cardiology',
  'Oncology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'Ophthalmology',
  'Family Medicine',
  'Critical Care',
  'ICU',
  'ER',
  'Operating Room',
  'Labor & Delivery',
  'Neonatal',
  'Geriatrics',
  'Other',
];

const shiftTypes = [
  '12-hour shifts',
  '8-hour shifts',
  'Night shifts',
  'Day shifts',
  'Rotating shifts',
  'On-call',
  'Variable',
];

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get profile from profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile({
        ...profileData,
        email: user.email || '',
      });
      if (profileData.avatar_url) {
        setImageUrl(profileData.avatar_url);
      }
    } else {
      // Create default profile
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove id from profile object to avoid duplicate
    const { id, email, created_at, ...profileData } = profile;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
      });

    if (error) {
      alert(`❌ Error saving profile: ${error.message}`);
      console.error('Full error:', error);
    } else {
      alert('✅ Profile saved successfully!');
    }
    setSaving(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.email[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-slate-600">Manage your personal and professional information</p>
      </div>

      {/* Profile Picture & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your basic details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 border-4 border-cyan-100 rounded-full overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl flex items-center justify-center font-semibold">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Profile Picture</p>
              <p className="text-xs text-slate-500">Upload a professional photo (coming soon)</p>
              <Badge variant="outline" className="text-xs">
                {profile.medical_profession || 'Healthcare Professional'}
              </Badge>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="full_name"
                value={profile.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Dr. Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone_number"
                value={profile.phone_number || ''}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={profile.date_of_birth || ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Professional Information */}
      <Card className="border-t-4 border-t-cyan-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-cyan-600" />
            Medical Professional Details
          </CardTitle>
          <CardDescription>Your credentials and specialization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medical_profession" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Profession *
              </Label>
              <Select
                value={profile.medical_profession || ''}
                onValueChange={(value) => handleInputChange('medical_profession', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent>
                  {medicalProfessions.map((prof) => (
                    <SelectItem key={prof} value={prof}>
                      {prof}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Specialty *
              </Label>
              <Select
                value={profile.specialty || ''}
                onValueChange={(value) => handleInputChange('specialty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sub_specialty">Sub-Specialty / Focus Area</Label>
              <Input
                id="sub_specialty"
                value={profile.sub_specialty || ''}
                onChange={(e) => handleInputChange('sub_specialty', e.target.value)}
                placeholder="e.g., Trauma Surgery, Pediatric Cardiology"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                License Number
              </Label>
              <Input
                id="license_number"
                value={profile.license_number || ''}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                placeholder="e.g., RN123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                type="number"
                min="0"
                max="60"
                value={profile.years_of_experience || ''}
                onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value))}
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Information */}
      <Card className="border-t-4 border-t-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Work Information
          </CardTitle>
          <CardDescription>Your current workplace details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital_name" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hospital / Facility Name
              </Label>
              <Input
                id="hospital_name"
                value={profile.hospital_name || ''}
                onChange={(e) => handleInputChange('hospital_name', e.target.value)}
                placeholder="e.g., City General Hospital"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department / Unit</Label>
              <Input
                id="department"
                value={profile.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Emergency Department, ICU"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Work Location (City, State)
              </Label>
              <Input
                id="work_location"
                value={profile.work_location || ''}
                onChange={(e) => handleInputChange('work_location', e.target.value)}
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift_type">Typical Shift Type</Label>
              <Select
                value={profile.shift_type || ''}
                onValueChange={(value) => handleInputChange('shift_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Optional details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself, your interests, and what drives your passion for healthcare..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-500">
              {profile.bio?.length || 0} / 500 characters
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={profile.emergency_contact_name || ''}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                value={profile.emergency_contact_phone || ''}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                placeholder="+1 (555) 987-6543"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_language">Preferred Language</Label>
              <Select
                value={profile.preferred_language || 'English'}
                onValueChange={(value) => handleInputChange('preferred_language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={profile.timezone || 'America/New_York'}
                onValueChange={(value) => handleInputChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4 sticky bottom-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-8 text-base bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
