import { AIAccount, TaskCategory, PromptTemplate, UsageLog, AppSettings } from '../types';

export const ALLOWLISTED_EMAIL = 'viesmabuatkerja3@gmail.com';

export const DEFAULT_ACCOUNTS: AIAccount[] = [
  {
    id: 'acc-1',
    alias: 'Claude 1 (Pro) - Spesialis Soal SKD',
    email: 'creator.cpns.soal@gmail.com',
    role: 'Pembuatan Soal TWK, TIU, TKP & Pembahasan Lengkap',
    plan: 'pro',
    status: 'aktif',
    limitResetAt: null,
    notes: 'Prioritas utama pembuatan paket tryout 110 butir soal SKD & latihan bertingkat.',
    color: 'indigo',
    archived: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    alias: 'Claude 2 (Pro) - Naskah & Hook Video',
    email: 'creator.cpns.video@gmail.com',
    role: 'Storyboard, Naskah Reels/TikTok & Ide Konten Harian',
    plan: 'pro',
    status: 'aktif',
    limitResetAt: null,
    notes: 'Fokus format video 60-90 detik: Hook 3 detik, inti trik pembahasan, CTA tryout.',
    color: 'rose',
    archived: false,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    alias: 'Claude 3 (Free) - Desain & Caption Poster',
    email: 'creator.cpns.desain@gmail.com',
    role: 'Copywriting Caption IG, Headline Poster & Carousel',
    plan: 'free',
    status: 'aktif',
    limitResetAt: null,
    notes: 'Pembuatan teks infografis, passing grade STAN/IPDN/STIS & caption interaktif.',
    color: 'cyan',
    archived: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-4',
    alias: 'Claude 4 (Free) - Riset Materi & Kisi-Kisi',
    email: 'creator.cpns.riset@gmail.com',
    role: 'Riset Regulasi BKN, Pasal UUD 1945 & Sejarah Kedinasan',
    plan: 'free',
    status: 'istirahat',
    limitResetAt: null,
    notes: 'Akun cadangan untuk bedah kisi-kisi resmi MenPAN-RB dan komparasi modul.',
    color: 'amber',
    archived: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_CATEGORIES: TaskCategory[] = [
  {
    id: 'cat-soal',
    name: 'Pembuatan Soal (TWK, TIU, TKP)',
    description: 'Pembuatan butir soal SKD, opsi pengecoh realistis, kunci jawaban, dan pembahasan bertahap.',
    color: 'indigo',
    primaryAccountIds: ['acc-1'],
    isCustom: false,
  },
  {
    id: 'cat-video',
    name: 'Naskah & Ide Edit Video',
    description: 'Konsep konten Reels/TikTok, naskah narasi, visual cue, dan hook menarik untuk pejuang CPNS.',
    color: 'rose',
    primaryAccountIds: ['acc-2'],
    isCustom: false,
  },
  {
    id: 'cat-poster',
    name: 'Desain & Caption Poster',
    description: 'Teks infografis slide Instagram, jadwal pendaftaran kedinasan, dan caption call-to-action.',
    color: 'cyan',
    primaryAccountIds: ['acc-3'],
    isCustom: false,
  },
  {
    id: 'cat-riset',
    name: 'Riset & Ringkasan Materi',
    description: 'Rangkuman kisi-kisi Menpan-RB, regulasi terbaru, materi pilar kebangsaan, dan data statistik.',
    color: 'amber',
    primaryAccountIds: ['acc-4', 'acc-1'],
    isCustom: false,
  },
  {
    id: 'cat-lainnya',
    name: 'Lainnya / Admin Konten',
    description: 'Balas DM/komentar rumit, pembuatan surat promo, atau tugas operasional akun lainnya.',
    color: 'emerald',
    primaryAccountIds: ['acc-3'],
    isCustom: false,
  },
];

export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'pr-1',
    title: 'Generator Soal TWK Penalaran Sila Pancasila (HOTS)',
    categoryId: 'cat-soal',
    targetAccountId: 'acc-1',
    tags: ['TWK', 'Pancasila', 'HOTS', 'Studi Kasus'],
    usageCount: 42,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    content: `Anda adalah pakar pembuat soal SKD CPNS dan Sekolah Kedinasan standar BKN.
Buatkan 5 butir soal TWK HOTS (Higher Order Thinking Skills) dengan tema Penerapan Nilai-Nilai Pancasila dalam Era Digital dan Kehidupan Berbangsa Saat Ini.

Ketentuan:
1. Soal berupa studi kasus naratif (3-5 kalimat) yang tidak bisa ditebak langsung hanya dengan hafalan butir sila.
2. Pilihan jawaban A, B, C, D, E harus homogen panjangnya dan memiliki daya beda tinggi (pengecoh kuat).
3. Berikan Kunci Jawaban dan Pembahasan Mendalam:
   - Identifikasi kata kunci masalah.
   - Sila yang dilanggar / diamalkan beserta butir rujukannya.
   - Analisis mengapa opsi lain kurang tepat.`,
  },
  {
    id: 'pr-2',
    title: 'Generator Soal TIU Deret Angka Bertingkat & Pola Loncat',
    categoryId: 'cat-soal',
    targetAccountId: 'acc-1',
    tags: ['TIU', 'Deret Angka', 'Pola', 'Trik Cepat'],
    usageCount: 38,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    content: `Buatkan 5 paket soal TIU Deret Angka dan Huruf dengan tingkat kesulitan menengah hingga tinggi khas Sekolah Kedinasan (STAN & STIS).

Format output untuk setiap soal:
- Barisan angka / huruf (minimal 7 elemen).
- Pilihan ganda A sampai E.
- Kunci jawaban.
- Trik Pengerjaan Cepat (kurang dari 40 detik) beserta penjelasan pola lompatan / fibonacci / selisih kuadrat.`,
  },
  {
    id: 'pr-3',
    title: 'Hook & Script 60 Detik TikTok/Reels: Trik Sakti Silogisme',
    categoryId: 'cat-video',
    targetAccountId: 'acc-2',
    tags: ['Video', 'Reels', 'TikTok', 'Hook 3 Detik'],
    usageCount: 29,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    content: `Buatkan naskah video pendek (durasi 60-75 detik) untuk platform TikTok dan Instagram Reels dengan topik: "3 Kata Kunci yang Sering Bikin Salah di Soal Silogisme CPNS".

Struktur naskah:
[00:00 - 00:03] HOOK: Visual hentakan + kalimat pemantik rasa penasaran pejuang CPNS.
[00:04 - 00:20] MASALAH: Contoh soal jebakan "Semua vs Sebagian" yang 80% peserta gagal.
[00:21 - 00:45] SOLUSI RAHASIA: Rumus coret cepat tanpa mikir lama.
[00:46 - 00:60] CALL TO ACTION: Simpan video ini dan coba jawab soal latihan di kolom komentar!
Berikan juga petunjuk teks di layar (Text on Screen) dan nada bicara narator.`,
  },
  {
    id: 'pr-4',
    title: 'Caption Carousel Instagram: 5 Kesalahan Fatal Saat Tryout',
    categoryId: 'cat-poster',
    targetAccountId: 'acc-3',
    tags: ['Instagram', 'Carousel', 'Caption', 'Tips'],
    usageCount: 19,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    content: `Buatkan kerangka materi untuk 6 slide Carousel Instagram + Caption edukatif dan interaktif.
Topik: "5 Kesalahan Strategi Waktu Pengerjaan SKD yang Bikin Nilai Gugur di Ambang Batas".

Slide 1: Judul provokatif & estetis.
Slide 2-6: Kesalahan 1 s/d 5 disertai solusi taktis (urutan kerjakan TKP dulu atau TIU dulu).
Slide Terakhir: Summary & ajakan interaksi.
Caption: Tuliskan gaya santai, memotivasi, gunakan bullet points rapi, dan sertakan 10 hashtag relevan (#CPNS2026 #SekolahKedinasan #IPDN #PKNSTAN #TipsSKD).`,
  },
];

export const DEFAULT_USAGE_LOGS: UsageLog[] = [
  {
    id: 'log-1',
    accountId: 'acc-1',
    categoryId: 'cat-soal',
    load: 'berat',
    taskTitle: 'Pembuatan 40 Soal TIU & Pembahasan Tryout Akbar',
    note: 'Selesai 40 butir deret angka dan silogisme analitis tingkat tinggi.',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'log-2',
    accountId: 'acc-2',
    categoryId: 'cat-video',
    load: 'sedang',
    taskTitle: 'Storyboard Video Reels Tips SKD Nilai 450+',
    note: '3 naskah video reels selesai dirancang dengan visual cue lengkap.',
    timestamp: new Date(Date.now() - 7 * 3600000).toISOString(),
  },
  {
    id: 'log-3',
    accountId: 'acc-3',
    categoryId: 'cat-poster',
    load: 'ringan',
    taskTitle: 'Caption Jadwal Pendaftaran STAN & IPDN 2026',
    note: 'Copywriting slide carousel 6 halaman.',
    timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: 'log-4',
    accountId: 'acc-1',
    categoryId: 'cat-soal',
    load: 'sedang',
    taskTitle: 'Paket 15 Soal TWK Bela Negara Kontemporer',
    note: 'Tema radikalisme cyber dan pertahanan ekonomi digital.',
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: 'log-5',
    accountId: 'acc-4',
    categoryId: 'cat-riset',
    load: 'ringan',
    taskTitle: 'Rangkuman Peraturan BKN tentang Nilai Ambang Batas',
    note: 'Ekstraksi poin penting dari surat edaran resmi.',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  sessionTimeoutMinutes: 30,
  allowlistedEmail: ALLOWLISTED_EMAIL,
  theme: 'dark',
  lastBackupDate: null,
};
