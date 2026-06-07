import { useMemo, useState } from 'react'
import { KeyRound, Link as LinkIcon, Loader2, Phone, Save, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import defaultAvatar from '../assets/default-avatar.svg'
import { useAuth } from '../hooks/useAuth.jsx'
import { toastError, toastSuccess } from '../utils/toast'

const tabs = ['Profile', 'Security']

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  )
}

function TextInput(props) {
  const { className = '', ...inputProps } = props

  return (
    <input
      {...inputProps}
      className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
    />
  )
}

export default function SettingsPage() {
  const { currentUser, userProfile, resetPassword, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [profileForm, setProfileForm] = useState({
    fullName: userProfile?.displayName || currentUser?.displayName || 'SportsHub User',
    contactNumber: userProfile?.contactNumber || '+63 912 345 6789',
    bio: userProfile?.bio || 'SportsHub member focused on building better community sports experiences.',
    socialLinks: userProfile?.socialLinks || 'https://facebook.com/sportshub\nhttps://instagram.com/sportshub',
  })

  const roleInfo = useMemo(() => {
    const role = userProfile?.role || 'PLAYER'
    if (role === 'COACH') return 'Team registration, roster requests, schedules, and event registration tools.'
    if (role === 'FACILITATOR') return 'Payments, team coordination, sports support, and schedule operations.'
    if (role === 'COMMUNITY_ORGANIZER' || role === 'ADMIN') return 'Community setup, user approvals, events, analytics, and sport management.'
    return 'Team membership, schedules, requests, and payment status.'
  }, [userProfile?.role])

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }))
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setSavingProfile(true)

    try {
      if (currentUser?.uid) {
        await updateUser(currentUser.uid, {
          displayName: profileForm.fullName,
          contactNumber: profileForm.contactNumber,
          bio: profileForm.bio,
          socialLinks: profileForm.socialLinks,
        })
      } else {
        toastSuccess('Profile saved locally.')
      }
    } catch {
      toastError('Unable to save profile right now.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()

    if (passwordForm.newPassword.length < 6) {
      toastError('Password must be at least 6 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toastError('Passwords do not match.')
      return
    }

    await resetPassword(passwordForm.newPassword)
    setPasswordForm({ newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Account settings</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{profileForm.fullName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{roleInfo}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-bold text-slate-950">{currentUser?.email || 'user@sportshub.local'}</p>
            <p className="mt-1 font-semibold uppercase text-slate-500">{userProfile?.role || 'PLAYER'}</p>
          </div>
        </div>
      </section>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            {tab === 'Profile' ? <UserRound className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Profile' ? (
        <form className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[16rem_1fr] sm:p-6" onSubmit={handleProfileSave}>
          <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-50 p-5 text-center">
            <img src={currentUser?.photoURL || defaultAvatar} alt="" className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-sm" />
            <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
              Change picture
            </button>
            <p className="text-xs leading-5 text-slate-500">Placeholder upload control prepared for future storage integration.</p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name">
                <TextInput value={profileForm.fullName} onChange={(event) => updateProfileField('fullName', event.target.value)} />
              </Field>
              <Field label="Email">
                <TextInput disabled value={currentUser?.email || 'user@sportshub.local'} />
              </Field>
            </div>
            <Field label="Contact Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <TextInput value={profileForm.contactNumber} onChange={(event) => updateProfileField('contactNumber', event.target.value)} className="w-full pl-10" />
              </div>
            </Field>
            <Field label="Bio">
              <textarea
                value={profileForm.bio}
                onChange={(event) => updateProfileField('bio', event.target.value)}
                rows={4}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </Field>
            <Field label="Social Links">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  value={profileForm.socialLinks}
                  onChange={(event) => updateProfileField('socialLinks', event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </Field>
            <button
              disabled={savingProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-fit"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save profile
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handlePasswordSave}>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Change password</h2>
              <p className="mt-1 text-sm text-slate-600">Use a strong password with at least 6 characters.</p>
            </div>
            <Field label="New Password">
              <TextInput
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                placeholder="New password"
              />
            </Field>
            <Field label="Confirm Password">
              <TextInput
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                placeholder="Confirm password"
              />
            </Field>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-fit">
              <KeyRound className="h-4 w-4" />
              Update password
            </button>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">Forgot password</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use the sign-in page forgot password flow to receive a secure Firebase reset link at your account email.</p>
            <Link
              to="/forgot-password"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Send reset email
            </Link>
          </section>
        </div>
      )}
    </div>
  )
}
