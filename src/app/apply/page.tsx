'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FormData {
  // Section 1: Your Details
  fullName: string;
  nickname: string;
  age: string;
  gender: string;
  cityState: string;
  occupation: string;
  phone: string;
  email: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  youtube: string;
  facebook: string;
  snapchat: string;
  otherPlatforms: string;

  // Section 2: Tell Us About Yourself
  whoAreYou: string;
  whyFanFactor: string;
  whatMakesYouEntertaining: string;

  // Section 3: Quick Background
  relationshipStatus: string;
  education: string;
  personality: string[];
  conflictHandling: string;
  temperTrigger: string;
  previousTvExperience: string;

  // Section 4: Availability
  availableSixWeeks: boolean;
  comfortableFilmed: boolean;
  noHealthConditions: boolean;
  ageAndCitizenship: boolean;

  // Section 5: Video Submission
  videoLink: string;

  // Section 6: Agreement
  infoAccurate: boolean;
  consentFilming: boolean;
  understandPredictions: boolean;
  noCriminalCharges: boolean;
  understandNoGuarantee: boolean;
}

const initialFormData: FormData = {
  fullName: '',
  nickname: '',
  age: '',
  gender: '',
  cityState: '',
  occupation: '',
  phone: '',
  email: '',
  instagram: '',
  tiktok: '',
  twitter: '',
  youtube: '',
  facebook: '',
  snapchat: '',
  otherPlatforms: '',
  whoAreYou: '',
  whyFanFactor: '',
  whatMakesYouEntertaining: '',
  relationshipStatus: '',
  education: '',
  personality: [],
  conflictHandling: '',
  temperTrigger: '',
  previousTvExperience: '',
  availableSixWeeks: false,
  comfortableFilmed: false,
  noHealthConditions: false,
  ageAndCitizenship: false,
  videoLink: '',
  infoAccurate: false,
  consentFilming: false,
  understandPredictions: false,
  noCriminalCharges: false,
  understandNoGuarantee: false,
};

const personalityTraits = [
  'Outgoing / Loud',
  'Strategic / Calculating',
  'Emotional / Sensitive',
  'Funny / Playful',
  'Dramatic / Bold',
  'Loyal / Ride-or-die',
  'Competitive / Driven',
  'Chill / Easy-going',
  'Romantic / Flirty',
];

const conflictOptions = [
  'Confront it head-on',
  'Stay calm and talk it out',
  'Avoid it / Keep the peace',
  'Get emotional / Explosive',
];

const ApplyPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const totalSteps = 6;

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePersonality = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(t => t !== trait)
        : [...prev.personality, trait],
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.age || parseInt(formData.age) < 21) newErrors.age = 'Must be 21 or older';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.cityState.trim()) newErrors.cityState = 'City/State is required';
        if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = 'Valid email is required';
        }
        break;
      case 2:
        if (!formData.whoAreYou.trim()) newErrors.whoAreYou = 'This field is required';
        if (!formData.whyFanFactor.trim()) newErrors.whyFanFactor = 'This field is required';
        if (!formData.whatMakesYouEntertaining.trim()) newErrors.whatMakesYouEntertaining = 'This field is required';
        break;
      case 3:
        if (!formData.relationshipStatus) newErrors.relationshipStatus = 'Please select an option';
        if (!formData.education) newErrors.education = 'Please select an option';
        if (!formData.conflictHandling) newErrors.conflictHandling = 'Please select an option';
        break;
      case 4:
        if (!formData.availableSixWeeks) newErrors.availableSixWeeks = 'You must confirm availability';
        if (!formData.comfortableFilmed) newErrors.comfortableFilmed = 'You must confirm comfort with filming';
        if (!formData.noHealthConditions) newErrors.noHealthConditions = 'You must confirm health status';
        if (!formData.ageAndCitizenship) newErrors.ageAndCitizenship = 'You must confirm age and citizenship';
        break;
      case 5:
        if (!formData.videoLink.trim()) newErrors.videoLink = 'Video link is required';
        break;
      case 6:
        if (!formData.infoAccurate) newErrors.infoAccurate = 'You must confirm';
        if (!formData.consentFilming) newErrors.consentFilming = 'You must confirm';
        if (!formData.understandPredictions) newErrors.understandPredictions = 'You must confirm';
        if (!formData.noCriminalCharges) newErrors.noCriminalCharges = 'You must confirm';
        if (!formData.understandNoGuarantee) newErrors.understandNoGuarantee = 'You must confirm';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Application submitted:', formData);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const inputClass = (field: keyof FormData) =>
    `w-full bg-gray-800/50 border ${errors[field] ? 'border-red-500' : 'border-gray-700'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors`;

  const textareaClass = (field: keyof FormData) =>
    `w-full bg-gray-800/50 border ${errors[field] ? 'border-red-500' : 'border-gray-700'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors min-h-[100px] resize-none`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-gray-400 mb-8">
            Thank you for applying to Star Factor Season 1! We&apos;ll review your application and contact you if you&apos;re shortlisted for the next stage.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Check your email ({formData.email}) for a confirmation.
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 px-8 py-3 rounded-xl font-semibold transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl">
              SF
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Star Factor
            </span>
          </Link>
          <span className="text-sm text-gray-400">Season 1 Application</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                Contestant Application
              </span>
            </h1>
            <p className="text-gray-400">Lagos - 6 Weeks - 24/7 Live Streaming - Win Real Money</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
            {/* Step 1: Your Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-orange-400 mb-4">1. Your Details</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => updateField('fullName', e.target.value)}
                      placeholder="Your full name"
                      className={inputClass('fullName')}
                    />
                    {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nickname / Stage Name</label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={e => updateField('nickname', e.target.value)}
                      placeholder="Optional"
                      className={inputClass('nickname')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Age * (Must be 21+)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={e => updateField('age', e.target.value)}
                      placeholder="21"
                      min="21"
                      className={inputClass('age')}
                    />
                    {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={e => updateField('gender', e.target.value)}
                      className={inputClass('gender')}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">City / State *</label>
                    <input
                      type="text"
                      value={formData.cityState}
                      onChange={e => updateField('cityState', e.target.value)}
                      placeholder="Lagos, Nigeria"
                      className={inputClass('cityState')}
                    />
                    {errors.cityState && <p className="text-red-400 text-xs mt-1">{errors.cityState}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Occupation *</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={e => updateField('occupation', e.target.value)}
                      placeholder="Your occupation"
                      className={inputClass('occupation')}
                    />
                    {errors.occupation && <p className="text-red-400 text-xs mt-1">{errors.occupation}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone (WhatsApp) *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="+234..."
                      className={inputClass('phone')}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass('email')}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Social Media (Optional)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">Instagram</label>
                      <div className="flex">
                        <span className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl px-3 py-3 text-gray-500">@</span>
                        <input
                          type="text"
                          value={formData.instagram}
                          onChange={e => updateField('instagram', e.target.value)}
                          placeholder="username"
                          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-r-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">TikTok</label>
                      <div className="flex">
                        <span className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl px-3 py-3 text-gray-500">@</span>
                        <input
                          type="text"
                          value={formData.tiktok}
                          onChange={e => updateField('tiktok', e.target.value)}
                          placeholder="username"
                          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-r-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">Twitter / X</label>
                      <div className="flex">
                        <span className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl px-3 py-3 text-gray-500">@</span>
                        <input
                          type="text"
                          value={formData.twitter}
                          onChange={e => updateField('twitter', e.target.value)}
                          placeholder="username"
                          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-r-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">YouTube</label>
                      <div className="flex">
                        <span className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl px-3 py-3 text-gray-500 text-xs">youtube.com/</span>
                        <input
                          type="text"
                          value={formData.youtube}
                          onChange={e => updateField('youtube', e.target.value)}
                          placeholder="channel"
                          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-r-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">Facebook</label>
                      <div className="flex">
                        <span className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl px-3 py-3 text-gray-500 text-xs">facebook.com/</span>
                        <input
                          type="text"
                          value={formData.facebook}
                          onChange={e => updateField('facebook', e.target.value)}
                          placeholder="profile"
                          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-r-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">Snapchat</label>
                      <div className="flex">
                        <span className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-xl px-3 py-3 text-gray-500">@</span>
                        <input
                          type="text"
                          value={formData.snapchat}
                          onChange={e => updateField('snapchat', e.target.value)}
                          placeholder="username"
                          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-r-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm text-gray-500 mb-2">Other Platforms (Threads, LinkedIn, website, podcast, etc.)</label>
                    <input
                      type="text"
                      value={formData.otherPlatforms}
                      onChange={e => updateField('otherPlatforms', e.target.value)}
                      placeholder="Any other platforms..."
                      className={inputClass('otherPlatforms')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Tell Us About Yourself */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-orange-400 mb-4">2. Tell Us About Yourself</h2>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">In one sentence, who are you? *</label>
                  <textarea
                    value={formData.whoAreYou}
                    onChange={e => updateField('whoAreYou', e.target.value)}
                    placeholder="I am..."
                    className={textareaClass('whoAreYou')}
                    maxLength={200}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.whoAreYou && <p className="text-red-400 text-xs">{errors.whoAreYou}</p>}
                    <p className="text-xs text-gray-500 ml-auto">{formData.whoAreYou.length}/200</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Why do you want to be on Star Factor? *</label>
                  <textarea
                    value={formData.whyFanFactor}
                    onChange={e => updateField('whyFanFactor', e.target.value)}
                    placeholder="Tell us what excites you about the show..."
                    className={textareaClass('whyFanFactor')}
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.whyFanFactor && <p className="text-red-400 text-xs">{errors.whyFanFactor}</p>}
                    <p className="text-xs text-gray-500 ml-auto">{formData.whyFanFactor.length}/500</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">What makes you entertaining to watch? *</label>
                  <textarea
                    value={formData.whatMakesYouEntertaining}
                    onChange={e => updateField('whatMakesYouEntertaining', e.target.value)}
                    placeholder="What will keep viewers glued to their screens when you're on camera?"
                    className={textareaClass('whatMakesYouEntertaining')}
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.whatMakesYouEntertaining && <p className="text-red-400 text-xs">{errors.whatMakesYouEntertaining}</p>}
                    <p className="text-xs text-gray-500 ml-auto">{formData.whatMakesYouEntertaining.length}/500</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Quick Background */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-orange-400 mb-4">3. Quick Background</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Relationship Status *</label>
                    <select
                      value={formData.relationshipStatus}
                      onChange={e => updateField('relationshipStatus', e.target.value)}
                      className={inputClass('relationshipStatus')}
                    >
                      <option value="">Select status</option>
                      <option value="single">Single</option>
                      <option value="in-a-relationship">In a relationship</option>
                      <option value="married">Married</option>
                      <option value="its-complicated">It&apos;s complicated</option>
                    </select>
                    {errors.relationshipStatus && <p className="text-red-400 text-xs mt-1">{errors.relationshipStatus}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Highest Education *</label>
                    <select
                      value={formData.education}
                      onChange={e => updateField('education', e.target.value)}
                      className={inputClass('education')}
                    >
                      <option value="">Select education</option>
                      <option value="secondary">Secondary School</option>
                      <option value="diploma">Diploma/OND</option>
                      <option value="bachelors">Bachelor&apos;s Degree/HND</option>
                      <option value="masters">Master&apos;s Degree</option>
                      <option value="phd">PhD</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.education && <p className="text-red-400 text-xs mt-1">{errors.education}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3">How would you describe yourself? (Check all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {personalityTraits.map(trait => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => togglePersonality(trait)}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${
                          formData.personality.includes(trait)
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <span className="mr-2">{formData.personality.includes(trait) ? '✓' : '○'}</span>
                        {trait}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3">How do you typically handle conflict? *</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {conflictOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField('conflictHandling', option)}
                        className={`p-4 rounded-xl border text-sm text-left transition-all ${
                          formData.conflictHandling === option
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <span className="mr-2">{formData.conflictHandling === option ? '●' : '○'}</span>
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.conflictHandling && <p className="text-red-400 text-xs mt-2">{errors.conflictHandling}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">What&apos;s one thing that would definitely make you lose your temper?</label>
                  <textarea
                    value={formData.temperTrigger}
                    onChange={e => updateField('temperTrigger', e.target.value)}
                    placeholder="Optional - be honest!"
                    className={textareaClass('temperTrigger')}
                    maxLength={300}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Have you ever been on TV or applied to a reality show before? If yes, which one?</label>
                  <textarea
                    value={formData.previousTvExperience}
                    onChange={e => updateField('previousTvExperience', e.target.value)}
                    placeholder="Optional"
                    className={textareaClass('previousTvExperience')}
                    maxLength={300}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Availability */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-orange-400 mb-4">4. Availability</h2>
                <p className="text-gray-400 mb-6">Please confirm you can commit to the following:</p>

                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.availableSixWeeks ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.availableSixWeeks}
                      onChange={e => updateField('availableSixWeeks', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-white">I am available to live in the Star Factor house for 60 days</span>
                      {errors.availableSixWeeks && <p className="text-red-400 text-xs mt-1">{errors.availableSixWeeks}</p>}
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.comfortableFilmed ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.comfortableFilmed}
                      onChange={e => updateField('comfortableFilmed', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-white">I am comfortable being filmed and streamed 24/7</span>
                      {errors.comfortableFilmed && <p className="text-red-400 text-xs mt-1">{errors.comfortableFilmed}</p>}
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.noHealthConditions ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.noHealthConditions}
                      onChange={e => updateField('noHealthConditions', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-white">I have no serious health conditions that would prevent participation</span>
                      {errors.noHealthConditions && <p className="text-red-400 text-xs mt-1">{errors.noHealthConditions}</p>}
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.ageAndCitizenship ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.ageAndCitizenship}
                      onChange={e => updateField('ageAndCitizenship', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-white">I am at least 21 years old and a Nigerian citizen/resident</span>
                      {errors.ageAndCitizenship && <p className="text-red-400 text-xs mt-1">{errors.ageAndCitizenship}</p>}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 5: Video Submission */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-orange-400 mb-4">5. Video Submission</h2>

                <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Submit a 1-2 Minute Video</h3>
                  <p className="text-gray-300 mb-4">This is the most important part of your application! Show us your personality.</p>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span>Introduce yourself — name, age, what you do</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span>Why should we pick YOU for Star Factor?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span>Show us something memorable — a talent, a story, your vibe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span><strong className="text-white">Be yourself. Be bold. Be unforgettable.</strong></span>
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Video Link (Google Drive, YouTube unlisted, or Dropbox) *</label>
                  <input
                    type="url"
                    value={formData.videoLink}
                    onChange={e => updateField('videoLink', e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className={inputClass('videoLink')}
                  />
                  {errors.videoLink && <p className="text-red-400 text-xs mt-1">{errors.videoLink}</p>}
                  <p className="text-xs text-gray-500 mt-2">Make sure the link is publicly accessible or has sharing enabled.</p>
                </div>
              </div>
            )}

            {/* Step 6: Agreement */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-orange-400 mb-4">6. Agreement</h2>
                <p className="text-gray-400 mb-6">By checking below, I confirm that:</p>

                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.infoAccurate ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.infoAccurate}
                      onChange={e => updateField('infoAccurate', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-white">All information provided is true and accurate</span>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.consentFilming ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.consentFilming}
                      onChange={e => updateField('consentFilming', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-white">I consent to being filmed and broadcast 24/7 if selected</span>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.understandPredictions ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.understandPredictions}
                      onChange={e => updateField('understandPredictions', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-white">I understand viewers may interact with the show through predictions and voting</span>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.noCriminalCharges ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.noCriminalCharges}
                      onChange={e => updateField('noCriminalCharges', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-white">I have no pending criminal charges</span>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.understandNoGuarantee ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.understandNoGuarantee}
                      onChange={e => updateField('understandNoGuarantee', e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-white">I understand this application does not guarantee selection</span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 px-8 py-3 rounded-xl font-semibold transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Questions? DM us <a href="https://instagram.com/starfactorlive" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">@starfactorlive</a> on Instagram or <a href="https://x.com/starfactortv" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">@starfactortv</a> on Twitter</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplyPage;
