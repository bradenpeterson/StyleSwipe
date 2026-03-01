import { supabase } from '../../lib/supabase';

export const ONBOARDING_MAPPINGS = {
  gender: {
    Female: 'female',
    Male: 'male',
    'Non-binary': 'non_binary',
    'Prefer not to say': 'prefer_not_to_say',
  },
  ageRange: {
    '18-24': '18_24',
    '25-34': '25_34',
    '35-44': '35_44',
    '45-54': '45_54',
    '55+': '55_plus',
  },
};

async function updateProfile(userId, patch) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export async function saveOnboardingGender(userId, label) {
  await updateProfile(userId, {
    gender: ONBOARDING_MAPPINGS.gender[label] ?? null,
  });
}

export async function saveOnboardingAgeRange(userId, label) {
  await updateProfile(userId, {
    age_range: ONBOARDING_MAPPINGS.ageRange[label] ?? null,
  });
}

export async function saveOnboardingStyleGoals(userId, goals) {
  await updateProfile(userId, {
    style_goals: Array.from(goals).map((goal) => goal.toLowerCase()),
  });
}
