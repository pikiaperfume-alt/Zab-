export const moods = [
  { key: 'relaxed', label: 'Relaxed', emoji: '😌' },
  { key: 'stressed', label: 'Stressed', emoji: '😟' },
  { key: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { key: 'focus', label: 'Need Focus', emoji: '⚡' },
  { key: 'motivation', label: 'Need Motivation', emoji: '❤️' },
  { key: 'talk', label: 'Need Someone to Talk To', emoji: '🤝' },
  { key: 'goal', label: 'Working Towards a Goal', emoji: '🎯' },
];

export const moodRecommendations = {
  relaxed: ['Light ambient meditation', 'Nature soundscape', 'Gratitude journaling prompt'],
  stressed: ['3-minute breathing reset', 'Guided body scan', 'Talk to your tutor'],
  sleepy: ['Delta sleep music', 'Sleep story: Quiet Harbor', 'Wind-down breathing'],
  focus: ['Binaural focus session', 'Pomodoro breathing', 'Morning Routine Club'],
  motivation: ['AI pep talk', 'Goal-setting session with tutor', 'Entrepreneurs Circle'],
  talk: ['Message your tutor', 'Emotional Support Community', 'AI companion chat'],
  goal: ['Accountability check-in', 'Personal Growth Club', 'Weekly progress journal'],
};

export const sessions = [
  { id: 's1', title: 'Morning Calm', type: 'Meditation', duration: '10 min', tier: 'free', cover: '🌅' },
  { id: 's2', title: 'Deep Focus Flow', type: 'Binaural', duration: '25 min', tier: 'pro', cover: '⚡' },
  { id: 's3', title: 'Quiet Harbor', type: 'Sleep Story', duration: '18 min', tier: 'sleep', cover: '🌙' },
  { id: 's4', title: 'Box Breathing', type: 'Breathing', duration: '4 min', tier: 'free', cover: '🫁' },
  { id: 's5', title: 'Theta Drift', type: 'Sleep Music', duration: '45 min', tier: 'sleep', cover: '✨' },
  { id: 's6', title: 'Letting Go', type: 'Meditation', duration: '15 min', tier: 'pro', cover: '🍃' },
];

export const clubs = [
  { id: 'c1', name: 'Meditation Circle', emoji: '🧘', members: 4210, description: 'Daily guided sits and silent sessions, beginners welcome.' },
  { id: 'c2', name: 'Morning Routine Club', emoji: '🌅', members: 2870, description: 'Build a calm, consistent start to your day with others.' },
  { id: 'c3', name: 'Reading Club', emoji: '📚', members: 1530, description: 'Monthly picks on mindfulness, psychology, and growth.' },
  { id: 'c4', name: 'Fitness & Wellness', emoji: '💪', members: 3360, description: 'Movement as medicine — gentle challenges, shared wins.' },
  { id: 'c5', name: 'Creative Minds', emoji: '🎨', members: 980, description: 'Art, journaling, and expression as a wellbeing practice.' },
  { id: 'c6', name: 'Entrepreneurs Circle', emoji: '🌍', members: 2110, description: 'Founders supporting founders through the hard days.' },
  { id: 'c7', name: 'Music Therapy Club', emoji: '🎵', members: 1240, description: 'Sound healing sessions and collaborative playlists.' },
  { id: 'c8', name: 'Emotional Support Community', emoji: '❤️', members: 5040, description: 'A safe, moderated space to share and be heard.' },
  { id: 'c9', name: 'Personal Growth Club', emoji: '🌱', members: 1870, description: 'Goal-setting, accountability partners, weekly reflection.' },
];

export const tutors = [
  { id: 't1', name: 'Aisha Nakato', specialty: 'Stress & Anxiety', rating: 4.9, sessions: 412, avatarColor: '#D946A8', bio: 'Certified mindfulness coach focused on practical stress tools for busy professionals.' },
  { id: 't2', name: 'Daniel Kintu', specialty: 'Sleep Coaching', rating: 4.8, sessions: 298, avatarColor: '#8B5CF6', bio: 'Helps clients rebuild healthy sleep routines using CBT-I informed techniques.' },
  { id: 't3', name: 'Grace Achieng', specialty: 'Goal Setting & Accountability', rating: 5.0, sessions: 351, avatarColor: '#C9A8F0', bio: 'Works with founders and creatives to turn intention into consistent action.' },
  { id: 't4', name: 'Samuel Okello', specialty: 'Emotional Wellbeing', rating: 4.9, sessions: 503, avatarColor: '#F0A8D8', bio: 'Trauma-informed guide for emotional regulation and self-compassion practices.' },
];

export const projects = [
  { id: 'p1', title: 'Build a Community Garden', emoji: '🌳', goal: 4000000, raised: 2350000, currency: 'UGX', backers: 184, timeline: '8 weeks', description: 'A shared green space for a Kampala neighborhood to grow food and gather.' },
  { id: 'p2', title: 'Books for 200 Children', emoji: '📚', goal: 6000000, raised: 4120000, currency: 'UGX', backers: 261, timeline: '4 weeks', description: 'Stock a school library with age-appropriate books across subjects.' },
  { id: 'p3', title: 'Plant 1,000 Trees', emoji: '🌱', goal: 5000000, raised: 1800000, currency: 'UGX', backers: 96, timeline: '12 weeks', description: 'Reforestation along the lake shore with a local environmental group.' },
  { id: 'p4', title: 'Youth Startup Launchpad', emoji: '💡', goal: 8000000, raised: 3260000, currency: 'UGX', backers: 142, timeline: '10 weeks', description: 'Seed funding and mentorship for five youth-led micro businesses.' },
];

export const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    tagline: 'Start your practice',
    features: ['Relaxation music', 'Nature sounds', 'Basic meditation', 'Daily breathing', 'Limited AI', 'Join public clubs'],
  },
  {
    id: 'sleep',
    name: 'Sleep+',
    price: 9900,
    tagline: 'Rest, deeply',
    features: ['Everything in Free', 'Theta sessions', 'Delta sleep music', 'Sleep stories', 'Offline downloads', 'Smart sleep timer'],
  },
  {
    id: 'pro',
    name: 'ZAB Pro',
    price: 24900,
    tagline: 'Grow, supported',
    featured: true,
    features: ['Everything in Sleep+', 'Personal wellness tutor', 'Unlimited AI guidance', 'Personalized meditation plans', 'Wellness clubs', 'Priority booking', 'Journaling & mood tracking', 'Unlimited offline access', 'Cross-device sync', 'Early access to new content'],
  },
];
