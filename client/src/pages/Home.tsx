// Transcripta Midnight Gold Editorial — bilingual, premium transcription landing page.
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { isNotificationImportant } from "@shared/notifications";
import { ArrowLeft, ArrowRight, ArrowUpLeft, Bell, Check, Clock3, FileText, GripVertical, Headphones, History, Instagram, LockKeyhole, Mail, Menu, Calculator, Download, FileUp, MessageCircle, Mic2, Monitor, Moon, Pause, Play, Send, ShieldCheck, Sparkles, Sun, UsersRound, Video, Volume2, VolumeX, X, Zap } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const logo = "/Logo.png";
const heroImage = "/manus-storage/transcripta-hero_2eca4f66.jpg";
const processImage = "/manus-storage/transcripta-process_38dd6b0b.jpg";
const waveformImage = "/manus-storage/transcripta-waveform_f528b9e5.jpg";
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_BATCH_BYTES = 200 * 1024 * 1024;
const MAX_UPLOAD_RETRIES = 2;

const sampleAudio = [
  "/manus-storage/demo-audio-01_de77af70.mp3",
  "/manus-storage/demo-audio-02_8c6be352.mp3",
  "/manus-storage/demo-audio-03_819e41ad.mp3",
];

type Lang = "ar" | "en";
const copy = {
  ar: {
    dir: "rtl", switch: "English", tagline: "تفريغ صوتي احترافي", nav: ["الخدمات", "نماذج الأعمال", "الأسعار", "كيف نعمل؟", "تواصل معنا"],
    order: "اطلب خدمتك", menu: "فتح القائمة", badge: "استوديو التفريغ الذي يفهم صوتك", hero: ["من الصوت", "إلى نص", "جاهز للاستخدام."],
    intro: "نحوّل التسجيلات الصوتية والفيديوهات والبودكاست والمقابلات إلى نص واضح، منسق، واحترافي — بالعربي والإنجليزي.", send: "أرسل ملفك الآن", viewPricing: "شاهد الأسعار", private: "سرية تامة", fast: "تسليم سريع", polished: "تنسيق احترافي", live: "LIVE", listen: "استمع إلى العينة", play: "تشغيل", pause: "إيقاف", download: "تحميل العينة", request: "اطلب تفريغ ملفك",
    servicesEyebrow: "WHAT WE TRANSCRIBE / 01", servicesTitle: ["صوتك،", "بكل تفاصيله."], servicesIntro: "لا نكتفي بتحويل الكلام إلى كلمات. نعيد ترتيب المحتوى ليصبح وثيقة يمكنك قراءتها، البحث فيها، ومشاركتها بثقة.",
    services: [{ title: "تفريغ صوتي", text: "نحوّل التسجيلات الصوتية الواضحة إلى نص مرتب، قابل للبحث والمراجعة والاستخدام." }, { title: "تحويل الفيديو إلى نص", text: "استخرج محتوى الفيديوهات التعليمية، المقابلات، والاجتماعات في ملف نصي منظم." }, { title: "تحديد المتحدثين", text: "نرتب الحوار باسم كل متحدث لتصبح المقابلات والاجتماعات أسهل في القراءة." }, { title: "مراجعة وتنسيق", text: "تنظيف النص، إضافة علامات الترقيم، تقسيم الفقرات وتسليمه بالصورة التي تحتاجها." }],
    samplesEyebrow: "SELECTED WORK SAMPLES / 02", samplesTitle: ["شوف الفرق،", "قبل وبعد."], samplesIntro: "أمثلة توضيحية لطريقة تحويل الكلام الخام إلى نص منظم، قابل للقراءة والمراجعة والاستخدام.", demo: "هذه نماذج Demo تعليمية وليست شهادات أو تقييمات عملاء.", raw: "النص الخام", edited: "النص المنسق", sampleCta: "عايز تشوف عينة من ملفك؟", sampleText: "ابعت دقيقة من التسجيل ونوضح لك شكل النتيجة قبل التنفيذ.", sampleButton: "اطلب عينة الآن",
    samples: [{ label: "تفريغ صوتي", before: "عندك تسجيل صوتي أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقالات", captions: "عندك تسجيل صوتي أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقالات", cueStarts: [0, 3.6], after: "لديك تسجيل صوتي أو فيديو؟ نحوله إلى نص واضح ومنسق، مناسب لتفريغ البودكاست والمقالات." }, { label: "مقابلة متعددة المتحدثين", before: "أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بين", captions: "أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بين", cueStarts: [0, 2.6], after: "نحوّل التسجيل إلى نص منظم، ونرتب محتوى البودكاست والمقابلات والمحاضرات بوضوح." }, { label: "تنسيق فيديو", before: "تحويله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بالعربي والإنجليزي", captions: "تحويله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بالعربي والإنجليزي", cueStarts: [0, 1.6], after: "تفريغ منسق للفيديوهات والمحتوى المسموع بالعربية والإنجليزية، جاهز للمراجعة والاستخدام." }], formTitle: "احسب تكلفة طلبك", formIntro: "ارفع الملف واحصل على تقدير أولي خلال ثوانٍ. الملف لا يتم رفعه إلى الموقع.", chooseFile: "اختيار ملف صوتي أو فيديو", service: "نوع الخدمة", languageLabel: "لغة التسجيل", speakersLabel: "عدد المتحدثين", selectService: "اختر نوع الخدمة", selectLanguage: "اختر اللغة", speakerOption: "متحدث واحد", multipleSpeakers: "أكثر من متحدث", estimate: "التكلفة التقديرية", duration: "مدة الملف", finalNote: "السعر النهائي يتحدد بعد فحص جودة التسجيل وتفاصيله.", sendWhatsApp: "أرسل التفاصيل عبر واتساب", noFile: "اختر ملفًا لحساب المدة والتكلفة", audioService: "تفريغ صوتي أساسي", reviewedService: "تفريغ + مراجعة وتنسيق", speakerService: "تحديد المتحدثين", podcastService: "بودكاست أو مقابلة", foreignService: "لغة أجنبية", videoService: "تحويل فيديو إلى نص", minutes: "دقيقة", selectRequired: "يرجى اختيار نوع الخدمة واللغة.",
    pricingEyebrow: "CLEAR STARTING PRICES / 03", pricingTitle: ["بداية واضحة.", "قرار أسهل."], pricingIntro: "الأسعار التالية تبدأ من، والسعر النهائي يتحدد بعد معرفة مدة الملف، اللغة، وعدد المتحدثين.", from: "من", per: "جنيه / 10 دقائق", final: "السعر النهائي بعد فحص الملف", video: "تحويل الفيديو يبدأ من 50 جنيه", foreign: "اللغات الأجنبية تبدأ من 80 جنيه", urgent: "الطلبات المستعجلة بتسعير خاص", popular: "الأكثر طلبًا",
    prices: [{ title: "تفريغ أساسي", price: "40", detail: "تحويل الصوت إلى نص واضح" }, { title: "مراجعة وتنسيق", price: "60", detail: "تفريغ + مراجعة + تنسيق احترافي" }, { title: "تحديد المتحدثين", price: "80", detail: "مثالي للمقابلات والاجتماعات" }, { title: "بودكاست ومقابلات", price: "70", detail: "التسعير حسب وضوح التسجيل" }],
    howEyebrow: "FROM FILE TO FINISHED TEXT / 04", howTitle: ["ست خطوات،", "ولا خطوة زائدة."], steps: ["تواصل معنا وأرسل تفاصيل الملف", "نراجع المدة واللغة ونحدد السعر", "نبدأ التفريغ والتنسيق بدقة", "نرسل لك معاينة أو نؤكد التسليم", "تستلم ملفك بالصيغة المناسبة", "نظل متاحين لأي تعديل مطلوب"], safe: "ملفك في أيدٍ أمينة",
    contactEyebrow: "READY WHEN YOU ARE / 05", contactTitle: ["عندك تسجيل؟", "خلّيه نصًا مفيدًا."], contactText: "أرسل الملف، وسنرد عليك بالسعر النهائي ومدة التنفيذ قبل بدء العمل.", whatsapp: "واتساب", telegram: "تيليجرام", rights: "كل الحقوق محفوظة.", footer: "من الصوت والفيديو إلى نص احترافي.", themeLight: "التبديل للوضع النهاري", themeDark: "التبديل للوضع الليلي", themeSystem: "اتباع مظهر الجهاز", themeSwitch: "تبديل المظهر"
  },
  en: {
    dir: "ltr", switch: "العربية", tagline: "Professional transcription", nav: ["Services", "Work samples", "Pricing", "How it works", "Contact"],
    order: "Request a quote", menu: "Open menu", badge: "The transcription studio that gets your voice", hero: ["From audio", "to text", "ready to use."],
    intro: "We turn audio, video, podcasts, and interviews into clear, polished, professional text — in Arabic and English.", send: "Send your file", viewPricing: "View pricing", private: "Full privacy", fast: "Fast delivery", polished: "Expert formatting", live: "LIVE", listen: "Listen to the sample", play: "Play", pause: "Pause", download: "Download sample", request: "Transcribe your file",
    servicesEyebrow: "WHAT WE TRANSCRIBE / 01", servicesTitle: ["Your voice,", "in every detail."], servicesIntro: "We do more than turn speech into words. We shape your content into a document you can read, search, and share with confidence.",
    services: [{ title: "Audio transcription", text: "Clear audio recordings turned into organized text, ready to search, review, and use." }, { title: "Video to text", text: "Extract lessons, interviews, and meetings into a structured text document." }, { title: "Speaker identification", text: "We label each speaker so interviews and meetings are easier to follow." }, { title: "Review & formatting", text: "Clean text, punctuation, paragraph structure, and delivery in the format you need." }],
    samplesEyebrow: "SELECTED WORK SAMPLES / 02", samplesTitle: ["See the difference,", "before and after."], samplesIntro: "Illustrative examples of turning raw speech into organized, readable text ready for review and reuse.", demo: "These are educational Demo samples, not customer testimonials or ratings.", raw: "Raw transcript", edited: "Edited text", sampleCta: "Want a sample from your file?", sampleText: "Send one minute of audio and we will show you the expected result.", sampleButton: "Request a sample",
    samples: [{ label: "Audio transcription", before: "عندك تسجيل صوتي أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقالات", captions: "عندك تسجيل صوتي أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقالات", cueStarts: [0, 3.6], after: "You have an audio or video recording? We turn it into clear, organized text for podcasts and articles." }, { label: "Interview formatting", before: "أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بين", captions: "أو فيديو أتحوله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بين", cueStarts: [0, 2.6], after: "We organize podcasts, interviews, and lectures into a clear, review-ready transcript." }, { label: "Video formatting", before: "تحويله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بالعربي والإنجليزي", captions: "تحويله إلى نص واضح ومنسق.\nتفريغ البودكاست والمقابلات والمحاضرات بالعربي والإنجليزي", cueStarts: [0, 1.6], after: "Polished transcription for Arabic and English video and spoken content, ready to use." }], formTitle: "Estimate your request", formIntro: "Choose an audio or video file and get an initial estimate in seconds. The file stays on your device.", chooseFile: "Choose an audio or video file", service: "Service type", languageLabel: "Recording language", speakersLabel: "Speakers", selectService: "Select a service", selectLanguage: "Select a language", speakerOption: "One speaker", multipleSpeakers: "Multiple speakers", estimate: "Estimated cost", duration: "File duration", finalNote: "The final price is confirmed after reviewing the recording quality and details.", sendWhatsApp: "Send details via WhatsApp", noFile: "Choose a file to calculate duration and cost", audioService: "Basic audio transcription", reviewedService: "Transcription + review & formatting", speakerService: "Speaker identification", podcastService: "Podcast or interview", foreignService: "Foreign language", videoService: "Video to text", minutes: "minutes", selectRequired: "Please select a service and language.",
    pricingEyebrow: "CLEAR STARTING PRICES / 03", pricingTitle: ["Clear starting points.", "An easier decision."], pricingIntro: "Starting prices are listed below. The final quote depends on duration, language, and number of speakers.", from: "from", per: "EGP / 10 minutes", final: "Final quote after file review", video: "Video to text from 50 EGP", foreign: "Foreign languages from 80 EGP", urgent: "Rush requests quoted separately", popular: "Most popular",
    prices: [{ title: "Basic transcription", price: "40", detail: "Audio converted into clear text" }, { title: "Review & formatting", price: "60", detail: "Transcription + review + professional formatting" }, { title: "Speaker identification", price: "80", detail: "Ideal for interviews and meetings" }, { title: "Podcasts & interviews", price: "70", detail: "Quoted according to audio clarity" }],
    howEyebrow: "FROM FILE TO FINISHED TEXT / 04", howTitle: ["Six steps,", "nothing extra."], steps: ["Contact us and share your file details", "We review duration, language, and price", "We transcribe and format with care", "We send a preview or confirm delivery", "You receive the file in your preferred format", "We remain available for requested edits"], safe: "Your file is in safe hands",
    contactEyebrow: "READY WHEN YOU ARE / 05", contactTitle: ["Have a recording?", "Make it useful text."], contactText: "Send the file and we will reply with the final price and delivery time before work begins.", whatsapp: "WhatsApp", telegram: "Telegram", rights: "All rights reserved.", footer: "From audio and video to professional text.", themeLight: "Switch to light mode", themeDark: "Switch to dark mode", themeSystem: "Follow device appearance", themeSwitch: "Toggle appearance"
  }
} as const;

function ContactButton({ children, href = "https://wa.me/201211303375", variant = "gold" }: { children: React.ReactNode; href?: string; variant?: "gold" | "ghost" }) {
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={`inline-flex items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 active:scale-[.97] ${variant === "gold" ? "bg-[#e8b94d] text-[#07111f] shadow-[0_12px_34px_rgba(232,185,77,.2)] hover:-translate-y-0.5 hover:bg-[#f4ce72]" : "border border-[#e8b94d]/35 bg-white/[.03] text-[#f4f0e8] hover:border-[#e8b94d] hover:bg-[#e8b94d]/10"}`}>{children}</a>;
}

function AudioPlayer({ src, label, playLabel, pauseLabel, captions, cueStarts }: { src: string; label: string; playLabel: string; pauseLabel: string; captions: string[]; cueStarts: readonly number[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const activeCue = captions.length ? Math.max(0, Math.min(captions.length - 1, cueStarts.reduce((active, start, index) => current >= start ? index : active, 0))) : 0;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { await audio.play(); setPlaying(true); } else { audio.pause(); setPlaying(false); }
  };
  const formatTime = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;

  return <div className="rounded-xl border border-[#e8b94d]/20 bg-[#07111f]/80 p-4" dir="ltr">
    <audio ref={audioRef} src={src} preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => { const next = event.currentTarget; setCurrent(next.currentTime); setProgress(next.duration ? (next.currentTime / next.duration) * 100 : 0); }} onEnded={() => { setPlaying(false); setProgress(0); setCurrent(0); }} />
    <div className="flex items-center gap-3">
      <button type="button" onClick={toggle} aria-label={playing ? pauseLabel : playLabel} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8b94d] text-[#07111f] transition hover:bg-[#f4ce72] active:scale-95">{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
      <div className="min-w-0 flex-1"><div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-xs font-bold text-[#f4f0e8]">{label}</span><span className="font-mono text-[10px] text-[#8b929b]">{formatTime(current)} / {formatTime(duration)}</span></div><input aria-label={label} type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => { const audio = audioRef.current; if (!audio || !audio.duration) return; const next = Number(event.target.value); audio.currentTime = (next / 100) * audio.duration; setProgress(next); }} className="h-1.5 w-full cursor-pointer accent-[#e8b94d]" /></div>
    </div>
    <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">{captions.map((caption, index) => <p key={`${caption}-${index}`} className={`rounded-md px-2 py-1 text-xs leading-6 transition-colors duration-200 ${index === activeCue && playing ? "bg-[#e8b94d]/15 text-[#f4f0e8]" : "text-[#8b929b]"}`}>{caption}</p>)}</div>
  </div>;
}

type Notice = { id: string; kind: "info" | "success" | "error"; title: string; message: string; read: boolean; important: boolean };
type NoticeInput = Omit<Notice, "id" | "read" | "important"> & { important?: boolean };

function NoticeToast({ notice, onClose, isAr }: { notice: Notice; onClose: () => void; isAr: boolean }) {
  const accent = notice.kind === "success" ? "#9bd7ae" : notice.kind === "error" ? "#f4a3a3" : "#e8b94d";
  return <div role="status" aria-live="polite" dir={isAr ? "rtl" : "ltr"} className="theme-day-notice fixed bottom-5 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-3 rounded-2xl border bg-[#07111f]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur" style={{ borderColor: `${accent}66` }}>
    <div className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 16px ${accent}` }} /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#f4f0e8]">{notice.title}</p><p className="mt-1 text-xs leading-6 text-[#a7a59e]">{notice.message}</p></div><button type="button" onClick={onClose} className="rounded-full p-1 text-[#8b929b] transition hover:bg-white/10 hover:text-[#f4f0e8]" aria-label={isAr ? "إغلاق الإشعار" : "Close notification"}><X size={15} /></button></div>
  </div>;
}

type QuoteFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  duration: number;
  status: "pending" | "uploading" | "uploaded" | "error" | "cancelled";
  progress: number;
  uploaded?: { key: string; url: string; fileName: string; size: number; contentType: string };
};

function RequestQuoteForm({ isAr, t }: { isAr: boolean; t: (typeof copy)[Lang] }) {
  const [files, setFiles] = useState<QuoteFile[]>([]);
  const [service, setService] = useState("");
  const [recordingLanguage, setRecordingLanguage] = useState("");
  const [speakers, setSpeakers] = useState("1");
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [noticeHistory, setNoticeHistory] = useState<Notice[]>([]);
  const [noticeHistoryOpen, setNoticeHistoryOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sessionKey] = useState(() => {
    if (typeof window === "undefined") return "transcripta-session-placeholder";
    const existing = window.localStorage.getItem("transcripta-session-key");
    if (existing) return existing;
    const created = crypto.randomUUID(); window.localStorage.setItem("transcripta-session-key", created); return created;
  });
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playNotificationTone = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 720;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.2);
    oscillator.addEventListener("ended", () => void context.close());
  };
  const uploadRequests = useRef(new Map<string, XMLHttpRequest>());
  const retryTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null);
  const createRequest = trpc.requestQuote.create.useMutation();
  const notificationConfig = trpc.notificationConfig.useQuery();
  const notificationLog = trpc.notificationLog.list.useQuery();
  const createNotificationLog = trpc.notificationLog.create.useMutation();
  const markNotificationLogRead = trpc.notificationLog.markRead.useMutation();
  const clearNotificationLog = trpc.notificationLog.clear.useMutation();
  useEffect(() => { if (notificationLog.data) setNoticeHistory(notificationLog.data.map((item) => ({ id: String(item.id), title: item.title, message: item.content, kind: item.kind, read: Boolean(item.readAt), important: Boolean(item.important) }))); }, [notificationLog.data]);
  const notify = (input: NoticeInput) => { const eventKey = input.kind === "success" ? "upload_success" : input.kind === "error" ? "upload_error" : undefined; const configured = eventKey ? notificationConfig.data?.find((setting) => setting.eventKey === eventKey) : undefined; const next: Notice = { ...input, id: `${Date.now()}-${Math.random()}`, read: false, important: input.important ?? isNotificationImportant(configured, input.kind === "success" || input.kind === "error") }; setNotice(next); setNoticeHistory((current) => [next, ...current].slice(0, 8)); createNotificationLog.mutate({ title: next.title, content: next.message, kind: next.kind, important: next.important }); if (next.important) playNotificationTone(); if (noticeTimer.current) clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(null), 4200); };
  const markNoticeRead = (id: string) => { setNoticeHistory((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)); const numericId = Number(id); if (Number.isInteger(numericId)) markNotificationLogRead.mutate({ id: numericId }); };
  const rates: Record<string, number> = { basic: 40, reviewed: 60, speakers: 80, podcast: 70, foreign: 80, video: 50 };
  const serviceLabels: Record<string, string> = { basic: t.audioService, reviewed: t.reviewedService, speakers: t.speakerService, podcast: t.podcastService, foreign: t.foreignService, video: t.videoService };
  const totalDuration = files.reduce((total, entry) => total + entry.duration, 0);
  const minutes = Math.max(1, Math.ceil(totalDuration / 60));
  const estimate = service && totalDuration ? Math.ceil(minutes / 10) * rates[service] : 0;
  const uploading = files.some((entry) => entry.status === "uploading");
  const formatDuration = (value: number) => value ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}` : "—";
  const formatSize = (value: number) => value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`;
  const patchFile = (id: string, patch: Partial<QuoteFile>) => setFiles((current) => current.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  const uploadFile = (entry: QuoteFile, attempt = 0) => {
    retryTimers.current.delete(entry.id);
    patchFile(entry.id, { status: "uploading", progress: attempt > 0 ? entry.progress : 0 }); setError("");
    if (attempt === 0) notify({ kind: "info", title: isAr ? "بدأ رفع الملف" : "Upload started", message: isAr ? `جارٍ رفع ${entry.name} بأمان.` : `${entry.name} is uploading securely.` });
    const request = new XMLHttpRequest(); uploadRequests.current.set(entry.id, request);
    request.open("POST", "/api/uploads/request-file");
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.setRequestHeader("X-File-Name", encodeURIComponent(entry.file.name));
    request.setRequestHeader("X-File-Type", entry.file.type || "application/octet-stream");
    request.upload.onprogress = event => { if (event.lengthComputable) patchFile(entry.id, { progress: Math.round((event.loaded / event.total) * 100) }); };
    request.onload = () => {
      uploadRequests.current.delete(entry.id);
      if (request.status >= 200 && request.status < 300) { patchFile(entry.id, { status: "uploaded", progress: 100, uploaded: JSON.parse(request.responseText) }); notify({ kind: "success", title: isAr ? "اكتمل الرفع" : "Upload complete", message: isAr ? `تم رفع ${entry.name} بنجاح.` : `${entry.name} was uploaded successfully.` }); }
      else { patchFile(entry.id, { status: "error" }); setError(isAr ? "تعذر رفع أحد الملفات. تحقق من الصيغة والحجم." : "One file could not be uploaded. Check its format and size."); notify({ kind: "error", title: isAr ? "فشل الرفع" : "Upload failed", message: isAr ? `تعذر رفع ${entry.name}. تحقق من الصيغة والحجم.` : `${entry.name} could not be uploaded. Check its format and size.` }); }
    };
    request.onerror = () => {
      uploadRequests.current.delete(entry.id);
      if (attempt < MAX_UPLOAD_RETRIES) {
        const retryNumber = attempt + 1;
        patchFile(entry.id, { status: "uploading" });
        notify({ kind: "info", title: isAr ? "إعادة محاولة الرفع" : "Retrying upload", message: isAr ? `انقطع الاتصال. ستتم إعادة المحاولة ${retryNumber} من ${MAX_UPLOAD_RETRIES}.` : `The connection was interrupted. Retrying ${retryNumber} of ${MAX_UPLOAD_RETRIES}.` });
        const timer = setTimeout(() => uploadFile(entry, retryNumber), 700 * retryNumber);
        retryTimers.current.set(entry.id, timer);
        return;
      }
      patchFile(entry.id, { status: "error" }); setError(isAr ? "انقطع الاتصال أثناء رفع أحد الملفات." : "The connection was interrupted while uploading a file."); notify({ kind: "error", title: isAr ? "فشل الرفع بعد المحاولة" : "Upload failed after retries", message: isAr ? `تعذر رفع ${entry.name} بعد عدة محاولات.` : `${entry.name} could not be uploaded after several attempts.` });
    };
    request.onabort = () => { uploadRequests.current.delete(entry.id); patchFile(entry.id, { status: "cancelled", progress: 0 }); notify({ kind: "info", title: isAr ? "تم إلغاء الرفع" : "Upload cancelled", message: isAr ? `تم إلغاء رفع ${entry.name}.` : `The upload for ${entry.name} was cancelled.` }); };
    request.send(entry.file);
  };
  const handleSelectedFiles = (selected: FileList | File[]) => {
    setError("");
    const incoming = Array.from(selected);
    const oversized = incoming.find((file) => file.size > MAX_FILE_BYTES);
    const existingBytes = files.reduce((total, entry) => total + entry.size, 0);
    const incomingBytes = incoming.reduce((total, file) => total + file.size, 0);
    if (oversized) {
      const message = isAr ? `الملف ${oversized.name} يتجاوز الحد الأقصى 50MB.` : `${oversized.name} exceeds the 50MB per-file limit.`;
      setError(message); notify({ kind: "error", title: isAr ? "حجم الملف كبير" : "File is too large", message }); return;
    }
    if (existingBytes + incomingBytes > MAX_BATCH_BYTES) {
      const message = isAr ? "إجمالي دفعة الملفات يجب ألا يتجاوز 200MB." : "The total batch size must not exceed 200MB.";
      setError(message); notify({ kind: "error", title: isAr ? "تجاوز حجم الدفعة" : "Batch size exceeded", message }); return;
    }
    if (incoming.length) notify({ kind: "info", title: isAr ? "تمت إضافة الملفات" : "Files added", message: isAr ? `تمت إضافة ${incoming.length} ملف/ملفات للمراجعة قبل الرفع.` : `${incoming.length} file(s) added for review before upload.` });
    incoming.forEach((file) => {
      const id = `${file.name}-${file.lastModified}-${Math.random()}`;
      const entry: QuoteFile = { id, file, name: file.name, size: file.size, type: file.type, duration: 0, status: "pending", progress: 0 };
      setFiles((current) => [...current, entry]);
      const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio"); media.preload = "metadata";
      media.onloadedmetadata = () => { patchFile(id, { duration: Number.isFinite(media.duration) ? media.duration : 0 }); URL.revokeObjectURL(media.src); };
      media.onerror = () => { setError(isAr ? `تعذر قراءة مدة ${file.name}.` : `Could not read the duration of ${file.name}.`); URL.revokeObjectURL(media.src); };
      media.src = URL.createObjectURL(file);
    });
  };
  const startUploads = () => { const pending = files.filter((entry) => entry.status === "pending"); if (!pending.length) return; notify({ kind: "info", title: isAr ? "جاري تجهيز الملفات" : "Preparing files", message: isAr ? `سيبدأ رفع ${pending.length} ملف/ملفات الآن.` : `${pending.length} file(s) will start uploading now.` }); pending.forEach(uploadFile); };
  const beginReplace = (id: string) => { replaceTargetId.current = id; replaceInputRef.current?.click(); };
  const onReplaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; const targetId = replaceTargetId.current;
    if (!file || !targetId) return;
    const existing = files.find((entry) => entry.id === targetId);
    if (!existing) return;
    const replacementBytes = files.reduce((total, entry) => total + (entry.id === targetId ? 0 : entry.size), 0) + file.size;
    if (file.size > MAX_FILE_BYTES || replacementBytes > MAX_BATCH_BYTES) {
      setError(isAr ? "حجم الملف أو إجمالي الدفعة يتجاوز الحد المسموح." : "The file or total batch exceeds the allowed size limit."); return;
    }
    const next: QuoteFile = { ...existing, file, name: file.name, size: file.size, type: file.type, duration: 0, status: "pending", progress: 0, uploaded: undefined };
    setFiles((current) => current.map((entry) => entry.id === targetId ? next : entry));
    const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio"); media.preload = "metadata";
    media.onloadedmetadata = () => { patchFile(targetId, { duration: Number.isFinite(media.duration) ? media.duration : 0 }); URL.revokeObjectURL(media.src); };
    media.onerror = () => { setError(isAr ? `تعذر قراءة مدة ${file.name}.` : `Could not read the duration of ${file.name}.`); URL.revokeObjectURL(media.src); };
    media.src = URL.createObjectURL(file); replaceTargetId.current = null; event.target.value = ""; notify({ kind: "success", title: isAr ? "تم استبدال الملف" : "File replaced", message: isAr ? "تم تحديث الملف، ويمكنك بدء رفعه من جديد." : "The file was updated and can be uploaded again." });
  };
  const cancelUpload = (id: string) => { const timer = retryTimers.current.get(id); if (timer) { clearTimeout(timer); retryTimers.current.delete(id); patchFile(id, { status: "cancelled", progress: 0 }); return; } const request = uploadRequests.current.get(id); if (request) request.abort(); else patchFile(id, { status: "cancelled" }); };
  const reorderFiles = (sourceId: string, targetId: string) => { if (sourceId === targetId) return; setFiles((current) => { const sourceIndex = current.findIndex((entry) => entry.id === sourceId); const targetIndex = current.findIndex((entry) => entry.id === targetId); if (sourceIndex < 0 || targetIndex < 0) return current; const next = [...current]; const [moved] = next.splice(sourceIndex, 1); next.splice(targetIndex, 0, moved); return next; }); };
  const removeFile = (id: string) => { cancelUpload(id); setFiles((current) => current.filter((entry) => entry.id !== id)); };
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files?.length) handleSelectedFiles(event.target.files); event.target.value = ""; };
  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => { event.preventDefault(); setIsDragActive(false); if (event.dataTransfer.files?.length) handleSelectedFiles(event.dataTransfer.files); };
  const sendWhatsApp = async () => {
    if (!service || !recordingLanguage) { setError(t.selectRequired); notify({ kind: "error", title: isAr ? "بيانات ناقصة" : "Missing details", message: t.selectRequired }); return; }
    if (uploading) { setError(isAr ? "انتظر اكتمال رفع الملفات أولًا." : "Please wait for all uploads to finish."); notify({ kind: "info", title: isAr ? "الرفع مستمر" : "Upload in progress", message: isAr ? "انتظر حتى تكتمل الملفات قبل إرسال الطلب." : "Wait until all files finish uploading before sending the request." }); return; }
    const uploadedEntries = files.filter((entry) => entry.status === "uploaded" && entry.uploaded);
    if (files.some((entry) => entry.status === "error" || entry.status === "pending")) { setError(isAr ? "راجع الملفات ثم اضغط بدء الرفع أو احذف الملفات غير المكتملة." : "Review the files, start their upload, or remove incomplete files."); notify({ kind: "error", title: isAr ? "راجع الملفات أولًا" : "Review files first", message: isAr ? "ابدأ رفع الملفات المعلقة أو احذف الملفات غير المكتملة." : "Start pending uploads or remove incomplete files." }); return; }
    try {
      await Promise.all(uploadedEntries.map((entry) => createRequest.mutateAsync({ fileKey: entry.uploaded!.key, fileUrl: entry.uploaded!.url, fileName: entry.uploaded!.fileName, contentType: entry.uploaded!.contentType, fileSize: entry.uploaded!.size, durationSeconds: entry.duration ? Math.round(entry.duration) : undefined, service, language: recordingLanguage, speakers: Number(speakers), estimatedPrice: estimate || undefined })));
    } catch { setError(isAr ? "تعذر حفظ الطلب. حاول مرة أخرى." : "The request could not be saved. Please try again."); notify({ kind: "error", title: isAr ? "تعذر حفظ الطلب" : "Could not save request", message: isAr ? "حاول مرة أخرى أو تواصل معنا مباشرة." : "Please try again or contact us directly." }); return; }
    const fileReference = uploadedEntries.length ? uploadedEntries.map((entry) => `${entry.uploaded!.url} (key: ${entry.uploaded!.key})`).join("\n") : (isAr ? "سأرسل الملفات في المحادثة" : "I will attach the files in the chat");
    const fileSummary = files.length ? files.map((entry) => `${entry.name} (${formatSize(entry.size)}, ${formatDuration(entry.duration)})`).join("\n") : fileReference;
    const message = isAr ? `مرحبًا Transcripta، أريد طلب تفريغ.\nالملفات:\n${fileSummary}\nروابط التخزين:\n${fileReference}\nإجمالي المدة: ${formatDuration(totalDuration)} (${minutes} دقيقة تقريبًا)\nالخدمة: ${serviceLabels[service]}\nاللغة: ${recordingLanguage}\nالمتحدثون: ${speakers === "1" ? t.speakerOption : t.multipleSpeakers}\nالتكلفة التقديرية: ${estimate} جنيه\nأرجو تأكيد السعر النهائي ومدة التنفيذ.` : `Hello Transcripta, I would like a transcription quote.\nFiles:\n${fileSummary}\nStorage references:\n${fileReference}\nTotal duration: ${formatDuration(totalDuration)} (about ${minutes} minutes)\nService: ${serviceLabels[service]}\nLanguage: ${recordingLanguage}\nSpeakers: ${speakers === "1" ? t.speakerOption : t.multipleSpeakers}\nEstimated cost: EGP ${estimate}\nPlease confirm the final quote and delivery time.`;
    notify({ kind: "success", title: isAr ? "تم حفظ طلبك" : "Request saved", message: isAr ? "تم تجهيز التفاصيل، وسيتم فتح واتساب لإرسالها." : "Your details are ready. WhatsApp will open to send them." });
    window.open(`https://wa.me/201211303375?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };
  return <section id="quote" className="theme-day-form relative overflow-hidden border-y border-[#e8b94d]/20 bg-[#081522] py-24 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(90deg,transparent_0%,rgba(232,185,77,.22)_12%,transparent_13%,transparent_18%,rgba(232,185,77,.12)_19%,transparent_20%,transparent_31%,rgba(232,185,77,.18)_32%,transparent_33%,transparent_100%)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(232,185,77,.11),transparent_34%)]" />
    {notice && <NoticeToast notice={notice} onClose={() => setNotice(null)} isAr={isAr} />}
    <div className="relative z-30 mx-auto max-w-7xl px-5 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={() => setSoundEnabled((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-[#e8b94d]/25 bg-[#07111f]/80 px-3 py-2 text-xs text-[#c9c6bd] transition hover:border-[#e8b94d] hover:text-[#e8b94d]" aria-pressed={soundEnabled}>
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}{soundEnabled ? (isAr ? "الصوت مفعّل" : "Sound on") : (isAr ? "تفعيل صوت التنبيهات" : "Enable notification sound")}
        </button>
        <button type="button" onClick={() => setNoticeHistoryOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-[#e8b94d]/25 bg-[#07111f]/80 px-3 py-2 text-xs text-[#c9c6bd] transition hover:border-[#e8b94d] hover:text-[#e8b94d]" aria-expanded={noticeHistoryOpen}>
          <History size={14} />{isAr ? "سجل الإشعارات" : "Notification history"}{noticeHistory.filter((item) => !item.read).length > 0 && <span className="rounded-full bg-[#e8b94d] px-1.5 text-[10px] font-bold text-[#07111f]">{noticeHistory.filter((item) => !item.read).length}</span>}
        </button>
      </div>
      {noticeHistoryOpen && <div className="mb-5 ml-auto max-w-md rounded-2xl border border-[#e8b94d]/25 bg-[#07111f]/95 p-4 shadow-2xl backdrop-blur" aria-live="polite">
        <div className="mb-3 flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-bold text-[#f4f0e8]"><Bell size={15} className="text-[#e8b94d]" />{isAr ? "آخر الإشعارات" : "Recent notifications"}</p>{noticeHistory.length > 0 && <button type="button" onClick={() => { setNoticeHistory([]); clearNotificationLog.mutate(); }} className="text-xs text-[#8b929b] hover:text-[#e8b94d]">{isAr ? "مسح السجل" : "Clear history"}</button>}</div>
        {noticeHistory.length === 0 ? <p className="text-xs text-[#8b929b]">{isAr ? "لا توجد إشعارات بعد." : "No notifications yet."}</p> : <div className="space-y-2">{noticeHistory.map((item) => <button type="button" key={item.id} onClick={() => markNoticeRead(item.id)} className={`block w-full rounded-xl border p-3 text-start transition ${item.read ? "border-white/10 bg-white/[.02] opacity-65" : "border-[#e8b94d]/30 bg-[#e8b94d]/[.06]"}`}><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-[#f4f0e8]">{item.title}</p>{!item.read && <span className="h-2 w-2 rounded-full bg-[#e8b94d]" aria-label={isAr ? "غير مقروء" : "Unread"} />}</div><p className="mt-1 text-xs leading-5 text-[#8b929b]">{item.message}</p></button>)}</div>}
      </div>}
    </div>
    <div className="relative mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
      <div className="self-center">
        <p className="eyebrow">REQUEST / 06</p>
        <h2 className="section-title mt-4">{t.formTitle}</h2>
        <p className="mt-6 max-w-md text-lg leading-9 text-[#a7a59e]">{t.formIntro}</p>
        <div className="mt-8 flex items-center gap-3 text-sm text-[#e8b94d]"><FileUp size={18} /> {isAr ? "اختر ملفًا أو اسحب عدة ملفات — تُرفع بأمان" : "Choose or drop multiple files — uploaded securely"}</div>
      </div>
      <div className="rounded-[1.6rem] border border-[#e8b94d]/25 bg-[#07111f]/85 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4 text-[10px] font-bold tracking-[.18em] text-[#8b929b]"><span>TRANSCRIPT / REQUEST BRIEF</span><span className="text-[#e8b94d]">06</span></div>
        <label onDragOver={(event) => { event.preventDefault(); setIsDragActive(true); }} onDragEnter={(event) => { event.preventDefault(); setIsDragActive(true); }} onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragActive(false); }} onDrop={onDrop} className={`group flex min-h-28 cursor-pointer items-center gap-4 rounded-xl border border-dashed p-5 transition-all duration-200 ${isDragActive ? "border-[#f4ce72] bg-[#e8b94d]/20 shadow-[0_0_0_4px_rgba(232,185,77,.12),0_18px_45px_rgba(232,185,77,.16)] -translate-y-0.5" : "border-[#e8b94d]/45 bg-[#e8b94d]/[.06] hover:border-[#e8b94d] hover:bg-[#e8b94d]/10"}`}>
          <FileUp className={`shrink-0 text-[#e8b94d] transition-transform duration-200 ${isDragActive ? "scale-110 -translate-y-1" : "group-hover:-translate-y-0.5"}`} size={25} />
          <span className="min-w-0"><span className="block truncate font-bold text-[#f4f0e8]">{isDragActive ? (isAr ? "أفلت الملفات هنا" : "Drop your files here") : (files.length ? (isAr ? "إضافة ملفات أخرى" : "Add more files") : t.chooseFile)}</span><span className="mt-1 block text-xs text-[#8b929b]">MP3, WAV, M4A, MP4, MOV · max 50 MB each · {isAr ? "يمكن اختيار عدة ملفات" : "multiple files supported"}</span></span>
          <input type="file" accept="audio/*,video/*" multiple onChange={onFileChange} className="sr-only" />
        </label><input ref={replaceInputRef} type="file" accept="audio/*,video/*" onChange={onReplaceChange} className="sr-only" />
        {files.some((entry) => entry.status === "pending") && <button type="button" onClick={startUploads} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8b94d]/45 bg-[#e8b94d]/[.08] px-4 py-3 text-sm font-bold text-[#e8b94d] transition hover:bg-[#e8b94d]/15">{isAr ? "مراجعة الملفات وبدء الرفع" : "Review files and start upload"}</button>}
        {files.length > 0 && <div className="mt-4 space-y-2">
          {files.map((entry, index) => <div key={entry.id} draggable={!uploading} onDragStart={() => setDraggedFileId(entry.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (draggedFileId) reorderFiles(draggedFileId, entry.id); setDraggedFileId(null); }} onDragEnd={() => setDraggedFileId(null)} className={`rounded-xl border p-3 transition-colors ${draggedFileId === entry.id ? "border-[#e8b94d] opacity-60" : entry.status === "uploaded" ? "border-[#9bd7ae]/30 bg-[#9bd7ae]/[.06]" : entry.status === "error" ? "border-[#f4a3a3]/40 bg-[#f4a3a3]/[.06]" : "border-white/10 bg-white/[.03]"}`}>
            <div className="flex items-start gap-3"><GripVertical size={16} className="mt-1 shrink-0 cursor-grab text-[#8b929b]" aria-label={isAr ? "اسحب لإعادة ترتيب الملف" : "Drag to reorder file"} /><FileText size={18} className="mt-0.5 shrink-0 text-[#e8b94d]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#f4f0e8]">{index + 1}. {entry.name}</p><p className="mt-1 text-xs text-[#8b929b]">{formatSize(entry.size)} · {formatDuration(entry.duration)} · {entry.status === "uploaded" ? (isAr ? "تم الرفع" : "Uploaded") : entry.status === "uploading" ? (isAr ? `جارٍ الرفع ${entry.progress}%` : `Uploading ${entry.progress}%`) : entry.status === "cancelled" ? (isAr ? "ملغى" : "Cancelled") : entry.status === "error" ? (isAr ? "فشل الرفع" : "Upload failed") : (isAr ? "في الانتظار" : "Pending")}</p>{entry.status === "uploading" && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#e8b94d] transition-[width] duration-150" style={{ width: `${entry.progress}%` }} /></div>}</div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => entry.status === "uploading" ? cancelUpload(entry.id) : beginReplace(entry.id)} className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-[#8b929b] transition hover:border-[#e8b94d] hover:text-[#e8b94d]" aria-label={entry.status === "uploading" ? (isAr ? "إلغاء الرفع" : "Cancel upload") : (isAr ? "استبدال الملف" : "Replace file")} title={entry.status === "uploading" ? (isAr ? "إلغاء الرفع" : "Cancel upload") : (isAr ? "استبدال الملف" : "Replace file")}>{entry.status === "uploading" ? (isAr ? "إلغاء" : "Cancel") : (isAr ? "استبدال" : "Replace")}</button><button type="button" onClick={() => removeFile(entry.id)} className="rounded-full border border-white/10 p-1.5 text-[#8b929b] transition hover:border-[#e8b94d] hover:text-[#e8b94d]" aria-label={isAr ? "حذف الملف" : "Remove file"} title={isAr ? "حذف الملف" : "Remove file"}><X size={15} /></button></div></div>
          </div>)}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#8b929b]"><span>{files.length} {isAr ? "ملف/ملفات محددة" : "file(s) selected"} · {formatSize(files.reduce((total, entry) => total + entry.size, 0))} / 200 MB</span><button type="button" onClick={() => { files.forEach((entry) => cancelUpload(entry.id)); setFiles([]); setError(""); }} className="text-[#e8b94d] transition hover:text-[#f4ce72]">{isAr ? "إزالة الكل واستبدال الملفات" : "Remove all and replace"}</button></div>
        </div>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm text-[#c9c6bd]"><span className="mb-2 block">{t.service}</span><select value={service} onChange={(event) => setService(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1b2d] px-4 py-3 text-sm text-[#f4f0e8] outline-none focus:border-[#e8b94d]"><option value="">{t.selectService}</option><option value="basic">{t.audioService}</option><option value="reviewed">{t.reviewedService}</option><option value="speakers">{t.speakerService}</option><option value="podcast">{t.podcastService}</option><option value="foreign">{t.foreignService}</option><option value="video">{t.videoService}</option></select></label><label className="text-sm text-[#c9c6bd]"><span className="mb-2 block">{t.languageLabel}</span><select value={recordingLanguage} onChange={(event) => setRecordingLanguage(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1b2d] px-4 py-3 text-sm text-[#f4f0e8] outline-none focus:border-[#e8b94d]"><option value="">{t.selectLanguage}</option><option value={isAr ? "العربية" : "Arabic"}>{isAr ? "العربية" : "Arabic"}</option><option value={isAr ? "الإنجليزية" : "English"}>{isAr ? "الإنجليزية" : "English"}</option><option value={isAr ? "لغة أخرى" : "Other"}>{isAr ? "لغة أخرى" : "Other"}</option></select></label></div>
        <label className="mt-4 block text-sm text-[#c9c6bd]"><span className="mb-2 block">{t.speakersLabel}</span><select value={speakers} onChange={(event) => setSpeakers(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1b2d] px-4 py-3 text-sm text-[#f4f0e8] outline-none focus:border-[#e8b94d]"><option value="1">{t.speakerOption}</option><option value="2">{t.multipleSpeakers}</option></select></label>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-white/[.03] p-4"><span className="block text-xs text-[#8b929b]">{t.duration}</span><strong className="mt-2 block font-display text-2xl text-[#f4f0e8]">{formatDuration(totalDuration)}</strong></div><div className="rounded-xl border border-[#e8b94d]/30 bg-[#e8b94d]/[.08] p-4"><span className="block text-xs text-[#8b929b]">{t.estimate}</span><strong className="mt-2 block font-display text-2xl text-[#e8b94d]">{estimate ? `${estimate} ${isAr ? "جنيه" : "EGP"}` : "—"}</strong></div></div>
        {error && <p className="mt-4 text-sm text-[#f4a3a3]">{error}</p>}{!files.length && <p className="mt-4 text-xs text-[#8b929b]">{t.noFile}</p>}<p className="mt-4 text-xs leading-6 text-[#8b929b]">{t.finalNote}</p>
        <button type="button" onClick={sendWhatsApp} disabled={createRequest.isPending || uploading} className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#e8b94d] px-6 py-3.5 text-sm font-bold text-[#07111f] shadow-[0_12px_34px_rgba(232,185,77,.2)] transition hover:-translate-y-0.5 hover:bg-[#f4ce72] active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60"><MessageCircle size={18} /> {createRequest.isPending ? (isAr ? "جارٍ حفظ الطلب…" : "Saving request…") : uploading ? (isAr ? "جارٍ رفع الملفات…" : "Uploading files…") : t.sendWhatsApp}</button>
      </div>
    </div>
  </section>;
}

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { theme, preference, setPreference } = useTheme();
  const [language, setLanguage] = useState<Lang>(() => (localStorage.getItem("transcripta-language") as Lang) || "ar");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = copy[language];
  const isAr = language === "ar";
  useEffect(() => { localStorage.setItem("transcripta-language", language); document.documentElement.lang = language; document.documentElement.dir = t.dir; }, [language, t.dir]);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  const navIds = ["services", "samples", "pricing", "how", "contact"];
  const isDark = theme === "dark";
  const themeLabel = preference === "system" ? t.themeSystem : isDark ? t.themeLight : t.themeDark;
  const themeIcon = preference === "system" ? <Monitor size={16} /> : isDark ? <Sun size={16} /> : <Moon size={16} />;
  const handleThemePreferenceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPreference(event.target.value as "light" | "dark" | "system");
  };
  const themeOptions = <>
    <option value="light">{t.themeLight}</option>
    <option value="dark">{t.themeDark}</option>
    <option value="system">{t.themeSystem}</option>
  </>;
  return <main dir={t.dir} className={`theme-transition min-h-screen overflow-hidden bg-[#07111f] text-[#f4f0e8] ${isDark ? "theme-dark" : "theme-light"}`}>
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-2 sm:gap-3" aria-label="Transcripta home"><img src={logo} alt="Transcripta" className="h-12 w-12 rounded-full object-cover ring-1 ring-[#e8b94d]/40" /><div className="hidden text-right sm:block"><div className="font-display text-lg font-bold tracking-[.18em] text-[#f4f0e8]">TRANS<span className="text-[#e8b94d]">CRIPTA</span></div><div className="text-[10px] tracking-[.18em] text-[#b8b5ad]">{t.tagline}</div></div></a>
        <nav className="hidden items-center gap-7 text-sm text-[#c9c6bd] xl:flex">{t.nav.map((item, i) => <a key={item} href={`#${navIds[i]}`} className="transition-colors hover:text-[#e8b94d]">{item}</a>)}</nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><label className="theme-picker inline-flex items-center gap-2 rounded-full border border-[#e8b94d]/45 px-3 py-2 text-[#e8b94d] transition hover:bg-[#e8b94d]/10" title={themeLabel}><span aria-hidden="true">{themeIcon}</span><span className="sr-only">{t.themeSwitch}</span><select value={preference} onChange={handleThemePreferenceChange} className="theme-select max-w-[4.5rem] bg-transparent text-xs font-bold text-[#e8b94d] outline-none sm:max-w-[7.5rem]" aria-label={`${t.themeSwitch}: ${themeLabel}`}>{themeOptions}</select></label><button onClick={() => setLanguage(isAr ? "en" : "ar")} className="rounded-full border border-[#e8b94d]/45 px-2.5 py-2 text-xs font-bold text-[#e8b94d] transition hover:bg-[#e8b94d]/10 sm:px-4" aria-label={`Switch to ${t.switch}`}>{t.switch}</button><div className="hidden xl:block"><ContactButton>{t.order} <ArrowLeft size={16} /></ContactButton></div><button className="rounded-full border border-white/15 p-2 text-[#e8b94d] xl:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={t.menu}>{menuOpen ? <X /> : <Menu />}</button></div>
      </div>
      {menuOpen && <div className="border-t border-white/10 bg-[#07111f] px-5 py-5 xl:hidden"><div className="flex flex-col gap-5 text-sm text-[#f4f0e8]">{t.nav.map((item, i) => <a key={item} href={`#${navIds[i]}`} onClick={() => setMenuOpen(false)}>{item}</a>)}<label className="theme-picker inline-flex w-fit items-center gap-2 rounded-full border border-[#e8b94d]/45 px-4 py-2 text-xs font-bold text-[#e8b94d]"><span aria-hidden="true">{themeIcon}</span><span className="sr-only">{t.themeSwitch}</span><select value={preference} onChange={handleThemePreferenceChange} className="theme-select bg-transparent text-xs font-bold text-[#e8b94d] outline-none" aria-label={`${t.themeSwitch}: ${themeLabel}`}>{themeOptions}</select></label><button onClick={() => setLanguage(isAr ? "en" : "ar")} className="w-fit rounded-full border border-[#e8b94d]/45 px-4 py-2 text-xs font-bold text-[#e8b94d]">{t.switch}</button><ContactButton>{t.order} <ArrowLeft size={16} /></ContactButton></div></div>}
    </header>
    <section id="top" className="relative isolate flex min-h-[760px] items-center border-b border-white/10 pt-28"><div className="theme-hero-overlay absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_36%,rgba(232,185,77,.14),transparent_27%),linear-gradient(115deg,#07111f_18%,rgba(7,17,31,.78)_56%,rgba(7,17,31,.45))]" /><div className="theme-hero-image absolute inset-y-0 left-0 -z-20 w-full bg-cover bg-center opacity-55 mix-blend-screen" style={{ backgroundImage: `url(${heroImage})` }} /><div className="theme-hero-fade absolute bottom-0 left-0 right-0 -z-10 h-48 bg-gradient-to-t from-[#07111f] to-transparent" /><div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8"><div className="max-w-2xl"><div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#e8b94d]/30 bg-[#07111f]/55 px-4 py-2 text-xs font-bold text-[#e8b94d] backdrop-blur"><span className="h-2 w-2 animate-pulse rounded-full bg-[#e8b94d]" /> {t.badge}</div><h1 className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-[#f4f0e8] sm:text-6xl lg:text-8xl">{t.hero[0]}<br /><span className="text-gold-gradient">{t.hero[1]}</span><br />{t.hero[2]}</h1><p className="mt-7 max-w-xl text-lg leading-9 text-[#c9c6bd] sm:text-xl">{t.intro}</p><div className="mt-9 flex flex-wrap gap-3"><ContactButton>{t.send} <Send size={17} /></ContactButton><ContactButton variant="ghost" href="#pricing">{t.viewPricing} <ArrowUpLeft size={17} /></ContactButton></div><div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-sm text-[#a7a59e]"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#e8b94d]" /> {t.private}</span><span className="flex items-center gap-2"><Zap size={17} className="text-[#e8b94d]" /> {t.fast}</span><span className="flex items-center gap-2"><Sparkles size={17} className="text-[#e8b94d]" /> {t.polished}</span></div></div><div className="relative hidden min-h-[480px] lg:block"><div className="theme-hero-card absolute right-0 top-8 h-[430px] w-[370px] rounded-[2rem] border border-[#e8b94d]/25 bg-[#0b1b2d]/65 p-5 shadow-2xl backdrop-blur"><div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs text-[#a7a59e]"><span>TRANSCRIPT / 001</span><span className="text-[#e8b94d]">{t.live}</span></div><div className="mt-10 space-y-5 text-right"><div className="h-2 w-2/3 rounded-full bg-[#e8b94d]/75" /><div className="h-2 w-11/12 rounded-full bg-white/15" /><div className="h-2 w-4/5 rounded-full bg-white/15" /><div className="mt-8 h-px bg-[#e8b94d]/30" /><div className="flex items-start gap-3"><span className="rounded bg-[#e8b94d]/15 px-2 py-1 text-[10px] text-[#e8b94d]">00:42</span><p className="text-sm leading-7 text-[#e6e2da]">{isAr ? "كل فكرة تستحق أن تبقى واضحة، حتى بعد انتهاء التسجيل." : "Every idea deserves to stay clear, even after the recording ends."}</p></div><div className="flex items-start gap-3"><span className="rounded bg-[#e8b94d]/15 px-2 py-1 text-[10px] text-[#e8b94d]">01:18</span><p className="text-sm leading-7 text-[#e6e2da]">{isAr ? "نرتب الحوار، نحدد المتحدثين، ونجهز النص للاستخدام." : "We structure dialogue, label speakers, and prepare text for use."}</p></div></div><div className="absolute -bottom-10 -left-12 flex h-28 w-28 items-center justify-center rounded-full border border-[#e8b94d]/50 bg-[#e8b94d] text-[#07111f] shadow-xl"><Play size={30} fill="currentColor" /></div></div></div></div></section>
    <section id="services" className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8"><div className="mb-14 grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><div><p className="eyebrow">{t.servicesEyebrow}</p><h2 className="section-title mt-4">{t.servicesTitle[0]}<br /><span>{t.servicesTitle[1]}</span></h2></div><p className="max-w-xl self-end text-lg leading-9 text-[#a7a59e]">{t.servicesIntro}</p></div><div className="grid gap-4 border-t border-white/10 pt-7 md:grid-cols-2 lg:grid-cols-4">{t.services.map((service, index) => { const Icon = [Mic2, Video, UsersRound, FileText][index]; return <article key={service.title} className={`group relative overflow-hidden rounded-[1rem] border border-white/10 border-r-2 border-r-[#e8b94d]/25 bg-[#0b1b2d]/70 p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#e8b94d]/50 ${index === 0 ? "lg:col-span-2" : index === 1 ? "lg:translate-y-10" : index === 3 ? "lg:-translate-y-6" : ""}`}><div className="mb-14 flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e8b94d]/35 bg-[#e8b94d]/10 text-[#e8b94d]"><Icon size={22} /></div><span className="font-display text-xs tracking-[.2em] text-[#e8b94d]">0{index + 1}</span></div><h3 className="font-display text-2xl font-bold text-[#f4f0e8]">{service.title}</h3><p className="mt-4 text-sm leading-8 text-[#a7a59e]">{service.text}</p><ArrowUpLeft className="absolute bottom-6 left-6 text-[#e8b94d]/35" size={20} /></article> })}</div></section>
    <section id="samples" className="theme-day-samples border-y border-white/10 bg-[#07111f] py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-14 grid gap-6 lg:grid-cols-[1fr_.8fr] lg:items-end"><div><p className="eyebrow">{t.samplesEyebrow}</p><h2 className="section-title mt-4">{t.samplesTitle[0]}<br /><span>{t.samplesTitle[1]}</span></h2></div><div className="max-w-md justify-self-end"><p className="text-lg leading-9 text-[#a7a59e]">{t.samplesIntro}</p><p className="mt-4 text-xs leading-6 text-[#e8b94d]/80">{t.demo}</p></div></div><div className="grid gap-5 border-t border-white/10 pt-7 lg:grid-cols-3">{t.samples.map((sample, index) => <article key={sample.label} className={`group overflow-hidden rounded-[1rem] border border-white/10 border-t-2 border-t-[#e8b94d]/25 bg-[#0b1b2d]/70 ${index === 1 ? "lg:translate-y-8" : ""}`}><div className="flex items-center justify-between border-b border-white/10 px-6 py-4"><span className="text-sm font-bold text-[#f4f0e8]">{sample.label}</span><span className="font-display text-xs tracking-[.18em] text-[#e8b94d]">0{index + 1}</span></div><div className="grid gap-3 p-5"><AudioPlayer src={sampleAudio[index]} label={t.listen} playLabel={t.play} pauseLabel={t.pause} captions={sample.captions.split("\\n")} cueStarts={sample.cueStarts} /><div className="flex flex-wrap gap-2"><a href={sampleAudio[index]} download className="inline-flex items-center gap-2 rounded-full border border-[#e8b94d]/25 px-3 py-2 text-[11px] font-bold text-[#e8b94d] transition hover:border-[#e8b94d] hover:bg-[#e8b94d]/10"><Download size={14} /> {t.download}</a><ContactButton href={`https://wa.me/201211303375?text=${encodeURIComponent(`${t.request}: ${sample.label}`)}`} variant="ghost">{t.request} <Send size={14} /></ContactButton></div><div className="rounded-xl border border-white/10 bg-[#07111f] p-5"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-[#8b929b]">{t.raw}</div><p className="whitespace-pre-line text-sm leading-8 text-[#a7a59e]">{sample.before}</p></div><div className="flex items-center gap-3 px-2 text-[#e8b94d]"><div className="h-px flex-1 bg-[#e8b94d]/30" /><ArrowLeft size={16} /><div className="h-px flex-1 bg-[#e8b94d]/30" /></div><div className="rounded-xl border border-[#e8b94d]/30 bg-[#e8b94d]/[.07] p-5"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-[#e8b94d]"><Check size={13} /> {t.edited}</div><p className="whitespace-pre-line text-sm leading-8 text-[#f4f0e8]">{sample.after}</p></div></div></article>)}</div><div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#e8b94d]/25 bg-[#0b1b2d] p-6 text-center sm:flex-row sm:text-right"><div><p className="font-display text-lg font-bold text-[#f4f0e8]">{t.sampleCta}</p><p className="mt-1 text-sm text-[#a7a59e]">{t.sampleText}</p></div><ContactButton>{t.sampleButton} <Send size={16} /></ContactButton></div></div></section>
    <RequestQuoteForm isAr={isAr} t={t} />
    <section id="pricing" className="theme-day-pricing relative overflow-hidden border-y border-white/10 bg-[#0a1828] py-28"><div className="absolute inset-0 bg-cover bg-center opacity-[.035] mix-blend-screen" style={{ backgroundImage: `url(${waveformImage})` }} /><div className="relative mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">{t.pricingEyebrow}</p><h2 className="section-title mt-4">{t.pricingTitle[0]}<br /><span>{t.pricingTitle[1]}</span></h2></div><p className="max-w-sm text-sm leading-8 text-[#a7a59e]">{t.pricingIntro}</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{t.prices.map((item, index) => <article key={item.title} className={`relative rounded-2xl border p-6 ${index === 1 ? "border-[#e8b94d] bg-[#e8b94d] text-[#07111f] shadow-[0_22px_60px_rgba(232,185,77,.16)]" : "border-white/10 bg-[#07111f]/80"}`}><div className="flex items-center justify-between"><span className={`text-sm font-bold ${index === 1 ? "text-[#07111f]/70" : "text-[#a7a59e]"}`}>{item.title}</span>{index === 1 && <span className="rounded-full bg-[#07111f] px-3 py-1 text-[10px] font-bold text-[#e8b94d]">{t.popular}</span>}</div><div className="mt-10 flex items-end gap-2"><span className={`font-display text-6xl font-bold ${index === 1 ? "text-[#07111f]" : "text-[#e8b94d]"}`}>{item.price}</span><span className={`mb-2 text-sm ${index === 1 ? "text-[#07111f]/70" : "text-[#a7a59e]"}`}>{t.per}</span></div><p className={`mt-5 min-h-12 text-sm leading-7 ${index === 1 ? "text-[#07111f]/75" : "text-[#a7a59e]"}`}>{item.detail}</p><div className={`mt-7 flex items-center gap-2 border-t pt-4 text-xs font-bold ${index === 1 ? "border-[#07111f]/15" : "border-white/10"}`}><Check size={15} /> {t.final}</div></article>)}</div><div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#a7a59e]"><span className="flex items-center gap-2"><Video size={16} className="text-[#e8b94d]" /> {t.video}</span><span className="flex items-center gap-2"><Headphones size={16} className="text-[#e8b94d]" /> {t.foreign}</span><span className="flex items-center gap-2"><Clock3 size={16} className="text-[#e8b94d]" /> {t.urgent}</span></div></div></section>
    <section id="how" className="mx-auto max-w-7xl px-5 py-28 lg:px-8"><div className="grid items-center gap-16 lg:grid-cols-[.95fr_1.05fr]"><div className="relative order-2 overflow-hidden rounded-[2rem] border border-[#e8b94d]/25 lg:order-1"><img src={processImage} alt={t.safe} className="aspect-[4/3] w-full object-cover opacity-85" /><div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-transparent to-transparent" /><div className="absolute bottom-6 right-6 left-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#07111f]/75 p-4 backdrop-blur"><span className="text-sm text-[#f4f0e8]">{t.safe}</span><LockKeyhole size={20} className="text-[#e8b94d]" /></div></div><div className="order-1 lg:order-2"><p className="eyebrow">{t.howEyebrow}</p><h2 className="section-title mt-4">{t.howTitle[0]}<br /><span>{t.howTitle[1]}</span></h2><div className="mt-10 space-y-6">{t.steps.map((step, i) => <div key={step} className="flex items-center gap-5 border-b border-white/10 pb-5"><span className="font-display text-sm text-[#e8b94d]">0{i + 1}</span><span className="text-base text-[#e6e2da]">{step}</span><Check size={16} className="mr-auto text-[#e8b94d]" /></div>)}</div></div></div></section>
    <section id="contact" className="relative border-t border-[#e8b94d]/35 bg-[#0b1b2d] py-20"><div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-5 md:flex-row md:items-end lg:px-8"><div><p className="font-display text-xs font-bold tracking-[.18em] text-[#e8b94d]">{t.contactEyebrow}</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">{t.contactTitle[0]}<br />{t.contactTitle[1]}</h2><p className="mt-5 max-w-lg text-lg leading-8 text-[#a7a59e]">{t.contactText}</p></div><div className="flex flex-wrap gap-3"><ContactButton href="https://wa.me/201211303375" variant="ghost">{t.whatsapp} <MessageCircle size={17} /></ContactButton><ContactButton href="https://t.me/Transcripta" variant="ghost">{t.telegram} <Send size={17} /></ContactButton></div></div></section>
    <footer className="bg-[#07111f] py-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 md:flex-row md:items-end lg:px-8"><div className="flex items-center gap-4"><img src={logo} alt="Transcripta" className="h-14 w-14 rounded-full object-cover ring-1 ring-[#e8b94d]/40" /><div><div className="font-display text-xl font-bold tracking-[.16em]">TRANS<span className="text-[#e8b94d]">CRIPTA</span></div><p className="mt-1 text-sm text-[#a7a59e]">{t.footer}</p></div></div><div className="flex flex-wrap gap-5 text-[#a7a59e]"><a href="https://www.instagram.com/transcripta_x" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-[#e8b94d]"><Instagram size={20} /></a><a href="https://t.me/Transcripta" target="_blank" rel="noreferrer" aria-label="Telegram" className="transition-colors hover:text-[#e8b94d]"><Send size={20} /></a><a href="mailto:mahmoudbedox@gmail.com" aria-label="Email" className="transition-colors hover:text-[#e8b94d]"><Mail size={20} /></a><a href="tel:+201211303375" aria-label="Phone" className="transition-colors hover:text-[#e8b94d]"><MessageCircle size={20} /></a></div><p className="text-xs text-[#6f7780]">© 2026 Transcripta. {t.rights}</p></div></footer>
  </main>;
}
