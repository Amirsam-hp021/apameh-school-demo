/**
 * All sample data for the demo.
 *
 * Dates are generated relative to "now" so deadlines, schedules and recent
 * activity always look fresh whenever the demo is opened.
 *
 * Content fields that the client may want to see in both languages use the
 * shape `{ en: '...', fa: '...' }`. People have explicit `nameEn` / `nameFa`.
 * Teaching content (forum posts, feedback, file names) stays in English,
 * which is natural for an English language school.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deterministic pseudo-random generator so the data is stable between reloads. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seeded(42);
const between = (min, max) => Math.round(min + rand() * (max - min));

/** ISO string for a date `days` from today at the given hour/minute. */
export function daysFromNow(days, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** YYYY-MM-DD in local time. */
export function toDateKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// School settings
// ---------------------------------------------------------------------------

export const settings = {
  schoolName: { en: 'Apameh English Academy', fa: 'آموزشگاه زبان انگلیسی آپامه' },
  email: 'info@apameh-academy.example',
  phone: '+98 21 8800 1234',
  address: { en: '12 Valiasr St., Tehran', fa: 'تهران، خیابان ولیعصر، پلاک ۱۲' },
  academicYear: '2026-2027',
  currency: 'IRT',
  weights: { homework: 30, midterm: 35, final: 35 },
};

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const admin = {
  id: 'u-admin',
  role: 'admin',
  nameEn: 'Maryam Karimi',
  nameFa: 'مریم کریمی',
  email: 'maryam.karimi@apameh-academy.example',
  phone: '+98 912 100 2000',
  status: 'active',
  createdAt: daysFromNow(-400),
};

export const teachers = [
  {
    id: 't1',
    role: 'teacher',
    nameEn: 'David Miller',
    nameFa: 'دیوید میلر',
    email: 'david.miller@apameh-academy.example',
    phone: '+98 912 300 4001',
    status: 'active',
    createdAt: daysFromNow(-380),
  },
  {
    id: 't2',
    role: 'teacher',
    nameEn: 'Neda Rahimi',
    nameFa: 'ندا رحیمی',
    email: 'neda.rahimi@apameh-academy.example',
    phone: '+98 912 300 4002',
    status: 'active',
    createdAt: daysFromNow(-350),
  },
  {
    id: 't3',
    role: 'teacher',
    nameEn: 'Emily Clark',
    nameFa: 'امیلی کلارک',
    email: 'emily.clark@apameh-academy.example',
    phone: '+98 912 300 4003',
    status: 'active',
    createdAt: daysFromNow(-200),
  },
];

const studentNames = [
  ['Sara Ahmadi', 'سارا احمدی'],
  ['Ali Rezaei', 'علی رضایی'],
  ['Zahra Hosseini', 'زهرا حسینی'],
  ['Reza Mohammadi', 'رضا محمدی'],
  ['Fatemeh Karimi', 'فاطمه کریمی'],
  ['Amir Jafari', 'امیر جعفری'],
  ['Niloufar Sadeghi', 'نیلوفر صادقی'],
  ['Mohammad Hashemi', 'محمد هاشمی'],
  ['Parisa Moradi', 'پریسا مرادی'],
  ['Hossein Ebrahimi', 'حسین ابراهیمی'],
  ['Maryam Ghasemi', 'مریم قاسمی'],
  ['Arash Kazemi', 'آرش کاظمی'],
  ['Shirin Najafi', 'شیرین نجفی'],
  ['Kian Tehrani', 'کیان تهرانی'],
  ['Leila Azizi', 'لیلا عزیزی'],
  ['Omid Shirazi', 'امید شیرازی'],
  ['Yasaman Bagheri', 'یاسمن باقری'],
  ['Behnam Akbari', 'بهنام اکبری'],
  ['Mina Rostami', 'مینا رستمی'],
  ['Pouya Nouri', 'پویا نوری'],
  ['Elham Farhadi', 'الهام فرهادی'],
  ['Saeed Mousavi', 'سعید موسوی'],
  ['Hanieh Zamani', 'هانیه زمانی'],
  ['Daniel Brooks', 'دنیل بروکس'],
  ['Sophia Turner', 'سوفیا ترنر'],
  ['Kaveh Ansari', 'کاوه انصاری'],
  ['Tara Soleimani', 'تارا سلیمانی'],
  ['James Wilson', 'جیمز ویلسون'],
  ['Roya Esmaili', 'رویا اسماعیلی'],
  ['Navid Golzar', 'نوید گلزار'],
];

export const students = studentNames.map(([nameEn, nameFa], i) => {
  const n = i + 1;
  const slug = nameEn.toLowerCase().replace(/\s+/g, '.');
  return {
    id: `s${n}`,
    role: 'student',
    nameEn,
    nameFa,
    email: `${slug}@student.apameh-academy.example`,
    phone: `+98 935 ${String(100 + n).padStart(3, '0')} ${String(2000 + n * 7).slice(-4)}`,
    // Two students are inactive / suspended so filters have something to show.
    status: n === 17 ? 'inactive' : n === 29 ? 'suspended' : 'active',
    createdAt: daysFromNow(-between(20, 300)),
  };
});

export const parents = [
  {
    id: 'p1',
    role: 'parent',
    nameEn: 'Hamid Ahmadi',
    nameFa: 'حمید احمدی',
    email: 'hamid.ahmadi@example.com',
    phone: '+98 912 555 7788',
    status: 'active',
    childId: 's1',
    createdAt: daysFromNow(-180),
  },
];

/** The accounts offered on the login page (one per role). */
export const demoAccounts = {
  admin: 'u-admin',
  teacher: 't1',
  student: 's1',
  parent: 'p1',
};

// ---------------------------------------------------------------------------
// Classes and weekly schedule
// ---------------------------------------------------------------------------
// Day numbers follow JavaScript: 0 = Sunday ... 6 = Saturday.

export const classes = [
  {
    id: 'c1',
    name: 'General English A1',
    level: 'A1',
    teacherId: 't1',
    room: '101',
    color: '#1a37d0',
    progress: 62,
    studentIds: ['s1', 's2', 's3', 's4', 's5'],
    schedule: [
      { day: 6, start: '09:00', end: '10:30' },
      { day: 1, start: '09:00', end: '10:30' },
    ],
  },
  {
    id: 'c2',
    name: 'General English A2',
    level: 'A2',
    teacherId: 't1',
    room: '102',
    color: '#0d9488',
    progress: 48,
    studentIds: ['s6', 's7', 's8', 's9', 's10'],
    schedule: [
      { day: 0, start: '11:00', end: '12:30' },
      { day: 2, start: '11:00', end: '12:30' },
    ],
  },
  {
    id: 'c3',
    name: 'IELTS Prep B2',
    level: 'B2',
    teacherId: 't2',
    room: '204',
    color: '#7c3aed',
    progress: 71,
    studentIds: ['s1', 's11', 's12', 's13', 's14', 's15'],
    schedule: [
      { day: 6, start: '14:00', end: '16:00' },
      { day: 3, start: '14:00', end: '16:00' },
    ],
  },
  {
    id: 'c4',
    name: 'Business English B1',
    level: 'B1',
    teacherId: 't2',
    room: '205',
    color: '#c2410c',
    progress: 35,
    studentIds: ['s16', 's17', 's18', 's19', 's20'],
    schedule: [
      { day: 1, start: '17:00', end: '18:30' },
      { day: 3, start: '17:00', end: '18:30' },
    ],
  },
  {
    id: 'c5',
    name: 'Conversation Club B1',
    level: 'B1',
    teacherId: 't3',
    room: '110',
    color: '#be185d',
    progress: 55,
    studentIds: ['s21', 's22', 's23', 's24', 's25'],
    schedule: [
      { day: 0, start: '16:00', end: '17:30' },
      { day: 2, start: '16:00', end: '17:30' },
    ],
  },
  {
    id: 'c6',
    name: 'TOEFL Prep C1',
    level: 'C1',
    teacherId: 't3',
    room: '210',
    color: '#0369a1',
    progress: 80,
    studentIds: ['s26', 's27', 's28', 's29', 's30'],
    schedule: [
      { day: 2, start: '18:00', end: '20:00' },
      { day: 4, start: '18:00', end: '20:00' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export const materials = [
  { id: 'm1', classId: 'c1', name: 'Unit 1 - Greetings and Introductions.pdf', type: 'pdf', size: 1_850_000, uploadedAt: daysFromNow(-30), uploadedBy: 't1' },
  { id: 'm2', classId: 'c1', name: 'Present Simple Explained.mp4', type: 'video', size: 48_300_000, uploadedAt: daysFromNow(-21), uploadedBy: 't1' },
  { id: 'm3', classId: 'c1', name: 'Vocabulary Flashcards - Family.png', type: 'image', size: 640_000, uploadedAt: daysFromNow(-14), uploadedBy: 't1' },
  { id: 'm4', classId: 'c1', name: 'Unit 2 - Daily Routines.pdf', type: 'pdf', size: 2_240_000, uploadedAt: daysFromNow(-6), uploadedBy: 't1' },
  { id: 'm5', classId: 'c2', name: 'Past Simple vs Past Continuous.pdf', type: 'pdf', size: 1_120_000, uploadedAt: daysFromNow(-18), uploadedBy: 't1' },
  { id: 'm6', classId: 'c2', name: 'Listening - At the Airport.mp4', type: 'video', size: 62_000_000, uploadedAt: daysFromNow(-9), uploadedBy: 't1' },
  { id: 'm7', classId: 'c3', name: 'IELTS Writing Task 1 - Band Descriptors.pdf', type: 'pdf', size: 780_000, uploadedAt: daysFromNow(-25), uploadedBy: 't2' },
  { id: 'm8', classId: 'c3', name: 'Line Graph Sample Answer.jpg', type: 'image', size: 910_000, uploadedAt: daysFromNow(-12), uploadedBy: 't2' },
  { id: 'm9', classId: 'c3', name: 'Speaking Part 2 - Model Answers.mp4', type: 'video', size: 85_500_000, uploadedAt: daysFromNow(-4), uploadedBy: 't2' },
  { id: 'm10', classId: 'c4', name: 'Writing Professional Emails.pdf', type: 'pdf', size: 1_400_000, uploadedAt: daysFromNow(-10), uploadedBy: 't2' },
  { id: 'm11', classId: 'c6', name: 'TOEFL Integrated Writing Template.pdf', type: 'pdf', size: 520_000, uploadedAt: daysFromNow(-7), uploadedBy: 't3' },
];

// ---------------------------------------------------------------------------
// Assignments and submissions
// ---------------------------------------------------------------------------

export const assignments = [
  {
    id: 'a1',
    classId: 'c1',
    title: { en: 'Present Simple Worksheet', fa: 'کاربرگ زمان حال ساده' },
    description: {
      en: 'Complete exercises 1-4 on page 12 and upload your answers as a PDF or photo.',
      fa: 'تمرین‌های ۱ تا ۴ صفحه ۱۲ را کامل کنید و پاسخ‌ها را به صورت PDF یا عکس بارگذاری کنید.',
    },
    dueDate: daysFromNow(-10, 23, 59),
    allowedTypes: ['pdf', 'image'],
    maxSizeMb: 10,
    allowLate: false,
    status: 'closed',
    createdAt: daysFromNow(-20),
  },
  {
    id: 'a2',
    classId: 'c1',
    title: { en: 'My Daily Routine - Short Essay', fa: 'انشای کوتاه: کارهای روزانه من' },
    description: {
      en: 'Write 120-150 words about your daily routine using at least 5 adverbs of frequency.',
      fa: 'یک متن ۱۲۰ تا ۱۵۰ کلمه‌ای درباره کارهای روزانه خود بنویسید و حداقل ۵ قید تکرار به کار ببرید.',
    },
    dueDate: daysFromNow(3, 23, 59),
    allowedTypes: ['pdf', 'doc'],
    maxSizeMb: 5,
    allowLate: true,
    status: 'published',
    createdAt: daysFromNow(-5),
  },
  {
    id: 'a3',
    classId: 'c2',
    title: { en: 'Travel Story Recording', fa: 'ضبط صوتی داستان سفر' },
    description: {
      en: 'Record a 2-minute audio describing a memorable trip using past tenses.',
      fa: 'یک فایل صوتی ۲ دقیقه‌ای درباره یک سفر به‌یادماندنی با استفاده از زمان‌های گذشته ضبط کنید.',
    },
    dueDate: daysFromNow(5, 23, 59),
    allowedTypes: ['audio', 'video'],
    maxSizeMb: 50,
    allowLate: true,
    status: 'published',
    createdAt: daysFromNow(-3),
  },
  {
    id: 'a4',
    classId: 'c3',
    title: { en: 'IELTS Writing Task 1 - Line Graph', fa: 'آیلتس رایتینگ تسک ۱ - نمودار خطی' },
    description: {
      en: 'Describe the line graph in at least 150 words. Focus on overall trends and key comparisons.',
      fa: 'نمودار خطی را در حداقل ۱۵۰ کلمه توصیف کنید. روی روندهای کلی و مقایسه‌های اصلی تمرکز کنید.',
    },
    dueDate: daysFromNow(-2, 23, 59),
    allowedTypes: ['pdf', 'doc'],
    maxSizeMb: 5,
    allowLate: true,
    status: 'published',
    createdAt: daysFromNow(-12),
  },
  {
    id: 'a5',
    classId: 'c3',
    title: { en: 'Reading Practice Test 3', fa: 'آزمون تمرینی ریدینگ ۳' },
    description: {
      en: 'Complete the full reading test in 60 minutes and upload a photo of your answer sheet.',
      fa: 'آزمون کامل ریدینگ را در ۶۰ دقیقه انجام دهید و عکس پاسخ‌نامه خود را بارگذاری کنید.',
    },
    dueDate: daysFromNow(7, 23, 59),
    allowedTypes: ['pdf', 'image'],
    maxSizeMb: 10,
    allowLate: false,
    status: 'published',
    createdAt: daysFromNow(-1),
  },
  {
    id: 'a6',
    classId: 'c1',
    title: { en: 'Unit 3 Vocabulary Quiz', fa: 'کوئیز واژگان فصل ۳' },
    description: {
      en: 'Online vocabulary quiz covering food and shopping words.',
      fa: 'کوئیز آنلاین واژگان درباره کلمات غذا و خرید.',
    },
    dueDate: daysFromNow(14, 23, 59),
    allowedTypes: ['pdf'],
    maxSizeMb: 5,
    allowLate: false,
    status: 'draft',
    createdAt: daysFromNow(-1),
  },
];

/**
 * Submission status values:
 * - submitted: on time, waiting for review
 * - late: submitted after the due date, waiting for review
 * - reviewed: graded by the teacher
 * - returned: sent back to the student for revision (with feedback)
 */
export const submissions = [
  { id: 'sub1', assignmentId: 'a1', studentId: 's1', fileName: 'present-simple-sara.pdf', fileSize: 820_000, submittedAt: daysFromNow(-11, 18), status: 'reviewed', score: 88, feedback: 'Great work, Sara! Watch the third-person "s" in exercise 3.', gradedAt: daysFromNow(-8) },
  { id: 'sub2', assignmentId: 'a1', studentId: 's2', fileName: 'worksheet-ali.jpg', fileSize: 1_400_000, submittedAt: daysFromNow(-12, 20), status: 'reviewed', score: 74, feedback: 'Good effort. Review negative forms (don\'t / doesn\'t).', gradedAt: daysFromNow(-8) },
  { id: 'sub3', assignmentId: 'a1', studentId: 's3', fileName: 'zahra-ex1-4.pdf', fileSize: 610_000, submittedAt: daysFromNow(-10, 21), status: 'returned', score: 55, feedback: 'Exercise 4 is missing. Please complete it and resubmit.', gradedAt: daysFromNow(-7) },
  { id: 'sub4', assignmentId: 'a1', studentId: 's4', fileName: 'reza-worksheet.pdf', fileSize: 990_000, submittedAt: daysFromNow(-10, 22), status: 'reviewed', score: 91, feedback: 'Excellent - almost no mistakes.', gradedAt: daysFromNow(-7) },
  { id: 'sub5', assignmentId: 'a2', studentId: 's2', fileName: 'daily-routine-ali.pdf', fileSize: 210_000, submittedAt: daysFromNow(-1, 19), status: 'submitted', score: null, feedback: '', gradedAt: null },
  { id: 'sub6', assignmentId: 'a2', studentId: 's3', fileName: 'my-routine.docx', fileSize: 180_000, submittedAt: daysFromNow(0, 8), status: 'submitted', score: null, feedback: '', gradedAt: null },
  { id: 'sub7', assignmentId: 'a2', studentId: 's5', fileName: 'fatemeh-essay.pdf', fileSize: 260_000, submittedAt: daysFromNow(-2, 17), status: 'submitted', score: null, feedback: '', gradedAt: null },
  { id: 'sub8', assignmentId: 'a3', studentId: 's6', fileName: 'trip-to-shiraz.mp3', fileSize: 3_800_000, submittedAt: daysFromNow(-1, 21), status: 'submitted', score: null, feedback: '', gradedAt: null },
  { id: 'sub9', assignmentId: 'a3', studentId: 's7', fileName: 'niloufar-travel.mp4', fileSize: 24_000_000, submittedAt: daysFromNow(0, 9), status: 'submitted', score: null, feedback: '', gradedAt: null },
  { id: 'sub10', assignmentId: 'a4', studentId: 's1', fileName: 'task1-line-graph-sara.pdf', fileSize: 340_000, submittedAt: daysFromNow(-1, 10), status: 'late', score: null, feedback: '', gradedAt: null },
  { id: 'sub11', assignmentId: 'a4', studentId: 's11', fileName: 'maryam-task1.docx', fileSize: 150_000, submittedAt: daysFromNow(-3, 16), status: 'reviewed', score: 81, feedback: 'Clear overview. Add more precise data comparisons for a higher band.', gradedAt: daysFromNow(-1) },
  { id: 'sub12', assignmentId: 'a4', studentId: 's12', fileName: 'arash-line-graph.pdf', fileSize: 400_000, submittedAt: daysFromNow(-3, 22), status: 'submitted', score: null, feedback: '', gradedAt: null },
];

// ---------------------------------------------------------------------------
// Gradebook: earlier homework scores (before the assignments above) and exams.
// The weighted final grade is computed from these + graded submissions.
// ---------------------------------------------------------------------------

export const gradebook = classes.flatMap((cls) =>
  cls.studentIds.map((studentId) => ({
    classId: cls.id,
    studentId,
    homeworkScores: [between(60, 98), between(60, 98)],
    midterm: between(58, 97),
    final: cls.progress >= 70 ? between(60, 96) : null, // final exam not taken yet in most classes
  })),
);

// ---------------------------------------------------------------------------
// Attendance: one record per class session over the last four weeks.
// ---------------------------------------------------------------------------

export const attendance = (() => {
  const records = [];
  const today = new Date();
  for (let offset = 28; offset >= 1; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    classes.forEach((cls) => {
      if (!cls.schedule.some((slot) => slot.day === date.getDay())) return;
      const marks = {};
      cls.studentIds.forEach((sid) => {
        const r = rand();
        marks[sid] = r < 0.82 ? 'present' : r < 0.92 ? 'late' : 'absent';
      });
      records.push({ classId: cls.id, date: toDateKey(date), marks });
    });
  }
  return records;
})();

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

const paymentStatuses = [
  'verified', 'verified', 'pending', 'verified', 'failed',
  'verified', 'expired', 'verified', 'pending', 'verified',
  'verified', 'failed', 'verified', 'pending', 'verified',
  'expired', 'verified', 'verified', 'failed', 'verified',
];
const paymentMethods = ['online', 'card', 'online', 'cash', 'online'];

export const payments = paymentStatuses.map((status, i) => {
  const student = students[(i * 7) % students.length];
  const cls = classes.find((c) => c.studentIds.includes(student.id));
  return {
    id: `pay${i + 1}`,
    reference: `AP-${(240_310 + i * 137).toString()}`,
    studentId: student.id,
    classId: cls.id,
    amount: [4_500_000, 5_200_000, 6_800_000, 7_500_000][i % 4],
    method: paymentMethods[i % paymentMethods.length],
    status,
    date: daysFromNow(-Math.floor(i * 2.6), 9 + (i % 8), (i * 13) % 60),
  };
});

/** Verified revenue per month for the last 12 months (in Toman). */
export const monthlyRevenue = (() => {
  const values = [182, 196, 175, 210, 228, 241, 219, 205, 236, 258, 272, 264];
  const now = new Date();
  return values.map((v, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (values.length - 1 - i), 1);
    return { month: d.toISOString(), amount: v * 1_000_000 };
  });
})();

// ---------------------------------------------------------------------------
// Other expenses (from the school's current expense sheet)
// `ref` is the code that was attached to the line in the original sheet.
// `flag: 'checkDuplicate'` marks lines the office should double-check.
// ---------------------------------------------------------------------------

export const expenses = [
  { id: 'ex1', label: { en: 'Translation expense', fa: 'هزینه ترجمه' }, ref: '34', amount: 90_000 },
  { id: 'ex2', label: { en: 'Translation expense', fa: 'هزینه ترجمه' }, ref: '87', amount: 9_600 },
  { id: 'ex3', label: { en: 'Travel expenses', fa: 'هزینه سفر' }, ref: '', amount: 0 },
  { id: 'ex4', label: { en: 'Recruitment advertising', fa: 'آگهی استخدام' }, ref: '', amount: 22_900 },
  { id: 'ex5', label: { en: 'XML expenses', fa: 'هزینه XML' }, ref: 'A302', amount: 77_720, flag: 'checkDuplicate' },
  { id: 'ex6', label: { en: 'XML expenses', fa: 'هزینه XML' }, ref: 'A302', amount: 80_047, flag: 'checkDuplicate' },
  { id: 'ex7', label: { en: 'Disposal expense', fa: 'هزینه امحا' }, ref: '88', amount: 48_000 },
  { id: 'ex8', label: { en: 'Signage', fa: 'تابلو و علائم' }, ref: '', amount: 3_500 },
  { id: 'ex9', label: { en: 'Legal expenses', fa: 'هزینه‌های حقوقی' }, ref: '', amount: 280_000 },
  { id: 'ex10', label: { en: 'Ucom', fa: 'Ucom' }, ref: '', amount: 45_000 },
  { id: 'ex11', label: { en: 'Label printing', fa: 'چاپ لیبل' }, ref: '', amount: 204_325 },
];

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export const announcements = [
  {
    id: 'an1',
    title: { en: 'Autumn term timetable published', fa: 'برنامه زمانی ترم پاییز منتشر شد' },
    body: {
      en: 'The full timetable for the autumn term is now available in the Timetable section.',
      fa: 'برنامه کامل ترم پاییز اکنون در بخش برنامه زمانی در دسترس است.',
    },
    audience: 'all',
    authorId: 'u-admin',
    createdAt: daysFromNow(-1, 9),
  },
  {
    id: 'an2',
    title: { en: 'IELTS mock exam next Thursday', fa: 'آزمون آزمایشی آیلتس پنجشنبه آینده' },
    body: {
      en: 'All IELTS Prep students are invited to a full mock exam. Please arrive 15 minutes early.',
      fa: 'از همه زبان‌آموزان کلاس آمادگی آیلتس برای شرکت در آزمون آزمایشی کامل دعوت می‌شود. لطفاً ۱۵ دقیقه زودتر حاضر شوید.',
    },
    audience: 'students',
    authorId: 'u-admin',
    createdAt: daysFromNow(-3, 11),
  },
  {
    id: 'an3',
    title: { en: 'Teacher workshop: Assessing speaking', fa: 'کارگاه معلمان: ارزیابی مهارت گفتاری' },
    body: {
      en: 'A two-hour workshop on speaking assessment rubrics will be held in Room 210.',
      fa: 'کارگاهی دو ساعته درباره معیارهای ارزیابی گفتار در کلاس ۲۱۰ برگزار می‌شود.',
    },
    audience: 'teachers',
    authorId: 'u-admin',
    createdAt: daysFromNow(-5, 14),
  },
  {
    id: 'an4',
    title: { en: 'Tuition payment reminder', fa: 'یادآوری پرداخت شهریه' },
    body: {
      en: 'Second instalment payments are due by the end of this month. You can pay online.',
      fa: 'مهلت پرداخت قسط دوم شهریه تا پایان همین ماه است. امکان پرداخت آنلاین فراهم است.',
    },
    audience: 'parents',
    authorId: 'u-admin',
    createdAt: daysFromNow(-8, 10),
  },
  {
    id: 'an5',
    title: { en: 'New conversation club sessions', fa: 'جلسات جدید باشگاه مکالمه' },
    body: {
      en: 'Extra conversation club sessions are now open on Sundays and Tuesdays at 4 pm.',
      fa: 'جلسات اضافی باشگاه مکالمه اکنون یکشنبه‌ها و سه‌شنبه‌ها ساعت ۴ عصر برگزار می‌شود.',
    },
    audience: 'all',
    authorId: 'u-admin',
    createdAt: daysFromNow(-12, 16),
  },
];

// ---------------------------------------------------------------------------
// Forum (per class)
// ---------------------------------------------------------------------------

export const forumTopics = [
  {
    id: 'ft1', classId: 'c1', authorId: 't1', pinned: true, createdAt: daysFromNow(-20),
    title: 'Welcome to General English A1!',
    body: 'Use this board to ask questions about lessons and homework. Please be kind and write in English when you can.',
    replies: [
      { id: 'fr1', authorId: 's1', body: 'Thank you! Happy to be here.', createdAt: daysFromNow(-19) },
      { id: 'fr2', authorId: 's4', body: 'Hello everyone!', createdAt: daysFromNow(-19) },
    ],
  },
  {
    id: 'ft2', classId: 'c1', authorId: 's2', pinned: false, createdAt: daysFromNow(-6),
    title: 'When do we use "does" in questions?',
    body: 'I am confused about "Do you" and "Does she". Can someone explain?',
    replies: [
      { id: 'fr3', authorId: 't1', body: 'Use "does" with he, she and it. For example: "Does she work here?"', createdAt: daysFromNow(-6) },
      { id: 'fr4', authorId: 's2', body: 'Now I understand, thanks!', createdAt: daysFromNow(-5) },
    ],
  },
  {
    id: 'ft3', classId: 'c1', authorId: 's3', pinned: false, createdAt: daysFromNow(-3),
    title: 'Good apps for vocabulary practice?',
    body: 'Can you recommend any apps to practise new words every day?',
    replies: [
      { id: 'fr5', authorId: 's5', body: 'I use flashcards every morning. It really helps.', createdAt: daysFromNow(-2) },
    ],
  },
  {
    id: 'ft4', classId: 'c1', authorId: 't1', pinned: false, createdAt: daysFromNow(-1),
    title: 'Essay tips for this week',
    body: 'Remember to use adverbs of frequency like always, usually and never. Keep your sentences short and clear.',
    replies: [],
  },
  {
    id: 'ft5', classId: 'c2', authorId: 't1', pinned: true, createdAt: daysFromNow(-15),
    title: 'Recording tips for the travel story',
    body: 'Find a quiet room and speak slowly. You can record on your phone.',
    replies: [
      { id: 'fr6', authorId: 's6', body: 'Can we use MP3 format?', createdAt: daysFromNow(-14) },
      { id: 'fr7', authorId: 't1', body: 'Yes, MP3 and MP4 are both fine.', createdAt: daysFromNow(-14) },
    ],
  },
  {
    id: 'ft6', classId: 'c2', authorId: 's8', pinned: false, createdAt: daysFromNow(-4),
    title: 'Irregular verbs list',
    body: 'Does anyone have a good printable list of irregular verbs?',
    replies: [
      { id: 'fr8', authorId: 's9', body: 'There is one in the back of our book, page 140.', createdAt: daysFromNow(-4) },
    ],
  },
  {
    id: 'ft7', classId: 'c3', authorId: 't2', pinned: true, createdAt: daysFromNow(-22),
    title: 'IELTS band score guide',
    body: 'Read the band descriptors in the Materials tab before you write Task 1.',
    replies: [
      { id: 'fr9', authorId: 's11', body: 'Very useful, thank you.', createdAt: daysFromNow(-21) },
    ],
  },
  {
    id: 'ft8', classId: 'c3', authorId: 's1', pinned: false, createdAt: daysFromNow(-5),
    title: 'How long should the overview be?',
    body: 'For Task 1, should the overview be one or two sentences?',
    replies: [
      { id: 'fr10', authorId: 't2', body: 'Two sentences is ideal. Mention the main trends only, without numbers.', createdAt: daysFromNow(-5) },
      { id: 'fr11', authorId: 's12', body: 'Good question, I wondered the same.', createdAt: daysFromNow(-4) },
    ],
  },
  {
    id: 'ft9', classId: 'c3', authorId: 's13', pinned: false, createdAt: daysFromNow(-2),
    title: 'Speaking partner practice',
    body: 'Would anyone like to practise Speaking Part 3 together after class?',
    replies: [
      { id: 'fr12', authorId: 's1', body: 'Yes! I am free on Wednesdays.', createdAt: daysFromNow(-1) },
    ],
  },
  {
    id: 'ft10', classId: 'c4', authorId: 't2', pinned: false, createdAt: daysFromNow(-8),
    title: 'Email templates discussion',
    body: 'Share one formal phrase you learned this week for opening an email.',
    replies: [
      { id: 'fr13', authorId: 's16', body: '"I am writing to enquire about..."', createdAt: daysFromNow(-7) },
      { id: 'fr14', authorId: 's18', body: '"Further to our conversation..."', createdAt: daysFromNow(-7) },
    ],
  },
];

// ---------------------------------------------------------------------------
// Notifications (for the demo student)
// ---------------------------------------------------------------------------

export const notifications = [
  { id: 'n1', userId: 's1', type: 'deadline', read: false, createdAt: daysFromNow(0, 8), title: { en: 'Deadline in 3 days', fa: 'مهلت تا ۳ روز دیگر' }, body: { en: '"My Daily Routine - Short Essay" is due soon.', fa: 'مهلت «انشای کوتاه: کارهای روزانه من» نزدیک است.' } },
  { id: 'n2', userId: 's1', type: 'announcement', read: false, createdAt: daysFromNow(-1, 9), title: { en: 'New announcement', fa: 'اطلاعیه جدید' }, body: { en: 'Autumn term timetable published.', fa: 'برنامه زمانی ترم پاییز منتشر شد.' } },
  { id: 'n3', userId: 's1', type: 'forum', read: false, createdAt: daysFromNow(-1, 15), title: { en: 'New reply in forum', fa: 'پاسخ جدید در انجمن' }, body: { en: 'Arash replied to "How long should the overview be?"', fa: 'آرش به «How long should the overview be?» پاسخ داد.' } },
  { id: 'n4', userId: 's1', type: 'material', read: false, createdAt: daysFromNow(-4, 12), title: { en: 'New material uploaded', fa: 'محتوای آموزشی جدید' }, body: { en: 'Speaking Part 2 - Model Answers was added to IELTS Prep B2.', fa: 'فایل Speaking Part 2 - Model Answers به کلاس IELTS Prep B2 اضافه شد.' } },
  { id: 'n5', userId: 's1', type: 'deadline', read: false, createdAt: daysFromNow(-2, 18), title: { en: 'Deadline passed', fa: 'مهلت به پایان رسید' }, body: { en: '"IELTS Writing Task 1 - Line Graph" is now past due. Late submissions are allowed.', fa: 'مهلت «آیلتس رایتینگ تسک ۱» گذشته است. ارسال با تأخیر مجاز است.' } },
  { id: 'n6', userId: 's1', type: 'grade', read: true, createdAt: daysFromNow(-8, 10), title: { en: 'New grade posted', fa: 'نمره جدید ثبت شد' }, body: { en: 'You scored 88 on "Present Simple Worksheet".', fa: 'نمره شما در «کاربرگ زمان حال ساده» ۸۸ شد.' } },
  { id: 'n7', userId: 's1', type: 'material', read: true, createdAt: daysFromNow(-6, 11), title: { en: 'New material uploaded', fa: 'محتوای آموزشی جدید' }, body: { en: 'Unit 2 - Daily Routines was added to General English A1.', fa: 'فایل Unit 2 - Daily Routines به کلاس General English A1 اضافه شد.' } },
  { id: 'n8', userId: 's1', type: 'announcement', read: true, createdAt: daysFromNow(-3, 11), title: { en: 'New announcement', fa: 'اطلاعیه جدید' }, body: { en: 'IELTS mock exam next Thursday.', fa: 'آزمون آزمایشی آیلتس پنجشنبه آینده.' } },
  { id: 'n9', userId: 's1', type: 'forum', read: true, createdAt: daysFromNow(-5, 13), title: { en: 'Teacher replied', fa: 'پاسخ معلم' }, body: { en: 'Neda Rahimi answered your question about Task 1.', fa: 'ندا رحیمی به سؤال شما درباره تسک ۱ پاسخ داد.' } },
  { id: 'n10', userId: 's1', type: 'deadline', read: true, createdAt: daysFromNow(-11, 9), title: { en: 'Deadline tomorrow', fa: 'مهلت فردا' }, body: { en: '"Present Simple Worksheet" is due tomorrow.', fa: 'مهلت «کاربرگ زمان حال ساده» فردا است.' } },
  { id: 'n11', userId: 's1', type: 'material', read: true, createdAt: daysFromNow(-12, 16), title: { en: 'New material uploaded', fa: 'محتوای آموزشی جدید' }, body: { en: 'Line Graph Sample Answer was added to IELTS Prep B2.', fa: 'فایل Line Graph Sample Answer به کلاس IELTS Prep B2 اضافه شد.' } },
  { id: 'n12', userId: 's1', type: 'announcement', read: true, createdAt: daysFromNow(-12, 17), title: { en: 'New announcement', fa: 'اطلاعیه جدید' }, body: { en: 'New conversation club sessions.', fa: 'جلسات جدید باشگاه مکالمه.' } },
  { id: 'n13', userId: 's1', type: 'material', read: true, createdAt: daysFromNow(-14, 10), title: { en: 'New material uploaded', fa: 'محتوای آموزشی جدید' }, body: { en: 'Vocabulary Flashcards - Family was added to General English A1.', fa: 'فایل Vocabulary Flashcards - Family به کلاس General English A1 اضافه شد.' } },
  { id: 'n14', userId: 's1', type: 'forum', read: true, createdAt: daysFromNow(-19, 9), title: { en: 'Welcome to the forum', fa: 'به انجمن خوش آمدید' }, body: { en: 'David Miller started a topic in General English A1.', fa: 'دیوید میلر یک موضوع جدید در کلاس General English A1 ایجاد کرد.' } },
  { id: 'n15', userId: 's1', type: 'announcement', read: true, createdAt: daysFromNow(-25, 9), title: { en: 'Welcome to Apameh!', fa: 'به آپامه خوش آمدید!' }, body: { en: 'Your student account is ready. Explore your classes and materials.', fa: 'حساب کاربری شما آماده است. کلاس‌ها و محتوای آموزشی خود را ببینید.' } },
];

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

const auditSeed = [
  ['login', 'u-admin', '185.120.33.14'],
  ['settings.update', 'u-admin', '185.120.33.14'],
  ['login', 't1', '5.160.21.88'],
  ['material.upload', 't1', '5.160.21.88'],
  ['grade.update', 't1', '5.160.21.88'],
  ['login.failed', 's12', '91.98.44.210'],
  ['login', 's1', '91.98.12.7'],
  ['assignment.submit', 's1', '91.98.12.7'],
  ['payment.verify', 'u-admin', '185.120.33.14'],
  ['user.create', 'u-admin', '185.120.33.14'],
  ['login', 't2', '37.255.6.140'],
  ['assignment.create', 't2', '37.255.6.140'],
  ['announcement.create', 'u-admin', '185.120.33.14'],
  ['backup.create', 'u-admin', '185.120.33.14'],
  ['user.update', 'u-admin', '185.120.33.14'],
  ['login', 'p1', '2.180.9.66'],
  ['payment.failed', 's5', '91.98.70.3'],
  ['logout', 't1', '5.160.21.88'],
  ['login', 't3', '151.238.4.19'],
  ['material.upload', 't3', '151.238.4.19'],
];

export const auditLogs = auditSeed.map(([action, userId, ip], i) => ({
  id: `log${i + 1}`,
  action,
  userId,
  ip,
  date: daysFromNow(-Math.floor(i / 2), 18 - (i % 9), (i * 17) % 60),
}));

// ---------------------------------------------------------------------------
// Backups
// ---------------------------------------------------------------------------

export const backups = [
  { id: 'b1', name: 'backup-auto-01.tar.gz', type: 'automatic', status: 'completed', size: 248_000_000, createdAt: daysFromNow(0, 2) },
  { id: 'b2', name: 'backup-auto-02.tar.gz', type: 'automatic', status: 'completed', size: 246_500_000, createdAt: daysFromNow(-1, 2) },
  { id: 'b3', name: 'backup-manual-03.tar.gz', type: 'manual', status: 'completed', size: 245_900_000, createdAt: daysFromNow(-2, 15) },
  { id: 'b4', name: 'backup-auto-04.tar.gz', type: 'automatic', status: 'failed', size: 0, createdAt: daysFromNow(-2, 2) },
  { id: 'b5', name: 'backup-auto-05.tar.gz', type: 'automatic', status: 'completed', size: 243_100_000, createdAt: daysFromNow(-3, 2) },
  { id: 'b6', name: 'backup-auto-06.tar.gz', type: 'automatic', status: 'completed', size: 241_700_000, createdAt: daysFromNow(-4, 2) },
];

/** Everything grouped, used to seed the in-memory mock database. */
const mockData = {
  settings,
  users: [admin, ...teachers, ...students, ...parents],
  classes,
  materials,
  assignments,
  submissions,
  gradebook,
  attendance,
  payments,
  monthlyRevenue,
  expenses,
  announcements,
  forumTopics,
  notifications,
  auditLogs,
  backups,
};

export default mockData;
