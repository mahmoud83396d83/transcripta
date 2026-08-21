import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bell, Check, Download, FileAudio, RefreshCw, Search, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

type RequestStatus = "new" | "in_progress" | "completed";

const settingLabels: Record<string, { ar: string; en: string }> = {
  new_request: { ar: "طلب تفريغ جديد", en: "New quote request" },
  upload_success: { ar: "نجاح رفع الملف", en: "Upload success" },
  upload_error: { ar: "فشل رفع الملف", en: "Upload error" },
};

const statusLabels: Record<RequestStatus, string> = {
  new: "جديد",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
};

export default function Admin() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/admin" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("all");
  const requestFilters = useMemo(() => ({ query: search.trim() || undefined, status: statusFilter === "all" ? undefined : statusFilter }), [search, statusFilter]);
  const requests = trpc.admin.requests.useQuery(requestFilters, { enabled: Boolean(user?.role === "admin") });
  const notifications = trpc.admin.notifications.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const settings = trpc.admin.notificationSettings.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const utils = trpc.useUtils();
  const markRead = trpc.admin.markNotificationRead.useMutation({ onSuccess: () => utils.admin.notifications.invalidate() });
  const updateSetting = trpc.admin.updateNotificationSetting.useMutation({ onSuccess: () => utils.admin.notificationSettings.invalidate() });
  const updateStatus = trpc.admin.updateRequestStatus.useMutation({ onSuccess: () => utils.admin.requests.invalidate() });

  const unreadCount = useMemo(() => notifications.data?.filter((item) => !item.readAt).length ?? 0, [notifications.data]);
  const exportRequests = () => {
    const rows = requests.data ?? [];
    const header = ["ID", "File", "Service", "Language", "Status", "Size", "Duration seconds", "Estimated price", "Created at"];
    const csv = [header, ...rows.map((request) => [request.id, request.fileName, request.service ?? "", request.language ?? "", statusLabels[request.status], request.fileSize, request.durationSeconds ?? "", request.estimatedPrice ?? "", new Date(request.createdAt).toISOString()])]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `transcripta-requests-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#071322] text-[#f7f1e6] grid place-items-center">جاري التحقق من الصلاحيات…</div>;
  }

  if (user.role !== "admin") {
    return <div className="min-h-screen bg-[#071322] text-[#f7f1e6] grid place-items-center p-6"><div className="max-w-md text-center"><ShieldAlert className="mx-auto mb-4 text-[#e8b84b]" /><h1 className="text-2xl font-bold">غير مصرح بالدخول</h1><p className="mt-2 text-white/60">هذه الصفحة متاحة لمالك الموقع أو المستخدمين الإداريين فقط.</p></div></div>;
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#071322] px-4 py-8 text-[#f7f1e6] sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-[#e8b84b]/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs uppercase tracking-[0.3em] text-[#e8b84b]">Transcripta Control Room</p><h1 className="mt-2 text-3xl font-bold">لوحة الطلبات والتنبيهات</h1><p className="mt-2 text-white/60">إدارة الطلبات، مراجعة إشعارات الموقع، وتخصيص الأولويات.</p></div>
          <div className="flex flex-wrap gap-2"><Button onClick={exportRequests} variant="outline" className="border-[#e8b84b]/40 bg-transparent text-[#f7f1e6] hover:bg-[#e8b84b]/10"><Download className="ml-2 h-4 w-4" /> تصدير CSV</Button><Button onClick={() => { void utils.admin.requests.invalidate(); void utils.admin.notifications.invalidate(); }} variant="outline" className="border-[#e8b84b]/40 bg-transparent text-[#f7f1e6] hover:bg-[#e8b84b]/10"><RefreshCw className="ml-2 h-4 w-4" /> تحديث البيانات</Button></div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3"><Stat label="إجمالي الطلبات المعروضة" value={requests.data?.length ?? 0} icon={<FileAudio />} /><Stat label="الإشعارات غير المقروءة" value={unreadCount} icon={<Bell />} /><Stat label="المستخدم الإداري" value={user.name || user.email || "Admin"} icon={<ShieldAlert />} /></section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <Panel title="طلبات التفريغ" icon={<FileAudio />}>
            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
              <label className="relative block"><Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-white/40" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث باسم الملف أو الخدمة أو اللغة" className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-10 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e8b84b]" /></label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | RequestStatus)} className="rounded-xl border border-white/10 bg-[#0c1c2e] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e8b84b]"><option value="all">كل الحالات</option><option value="new">جديد</option><option value="in_progress">قيد التنفيذ</option><option value="completed">مكتمل</option></select>
            </div>
            <div className="space-y-3">{requests.data?.length ? requests.data.map((request) => <article key={request.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{request.fileName}</h3><p className="mt-1 text-xs text-white/50">{request.service || "خدمة غير محددة"} · {request.language || "لغة غير محددة"}</p></div><span className="text-xs text-[#e8b84b]">#{request.id}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/60 sm:grid-cols-4"><span>{formatBytes(request.fileSize)}</span><span>{request.durationSeconds ? `${Math.ceil(request.durationSeconds / 60)} دقيقة` : "المدة غير متاحة"}</span><span>{request.estimatedPrice ? `${request.estimatedPrice} جنيه` : "بدون تقدير"}</span><span>{new Date(request.createdAt).toLocaleDateString("ar-EG")}</span></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3"><span className={`rounded-full px-3 py-1 text-xs ${request.status === "completed" ? "bg-emerald-400/15 text-emerald-300" : request.status === "in_progress" ? "bg-[#e8b84b]/15 text-[#e8b84b]" : "bg-white/10 text-white/65"}`}>{statusLabels[request.status]}</span><select value={request.status} onChange={(event) => updateStatus.mutate({ id: request.id, status: event.target.value as RequestStatus })} disabled={updateStatus.isPending} className="rounded-lg border border-white/10 bg-[#0c1c2e] px-2 py-1 text-xs text-white outline-none focus:border-[#e8b84b]"><option value="new">جديد</option><option value="in_progress">قيد التنفيذ</option><option value="completed">مكتمل</option></select></div></article>) : <Empty text="لا توجد طلبات مطابقة للبحث والتصفية الحالية." />}</div>
          </Panel>

          <Panel title="سجل الإشعارات" icon={<Bell />}><div className="space-y-3">{notifications.data?.length ? notifications.data.map((notice) => <article key={notice.id} className={`rounded-xl border p-4 ${notice.readAt ? "border-white/10 bg-white/[0.02]" : "border-[#e8b84b]/50 bg-[#e8b84b]/10"}`}><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{notice.title}</h3>{!notice.readAt && <span className="rounded-full bg-[#e8b84b] px-2 py-0.5 text-[10px] text-[#071322]">جديد</span>}</div><p className="mt-1 text-sm text-white/65">{notice.content}</p><p className="mt-2 text-[11px] text-white/40">{new Date(notice.createdAt).toLocaleString("ar-EG")}</p></div>{!notice.readAt && <Button size="sm" variant="ghost" onClick={() => markRead.mutate({ id: notice.id })} className="text-[#e8b84b] hover:bg-[#e8b84b]/10"><Check className="h-4 w-4" /></Button>}</div></article>) : <Empty text="لا توجد إشعارات بعد." />}</div></Panel>
        </section>

        <Panel title="إعدادات أولوية الإشعارات" icon={<SlidersHorizontal />}><div className="grid gap-3 md:grid-cols-3">{(settings.data || []).map((setting) => { const label = settingLabels[setting.eventKey] || { ar: setting.eventKey, en: setting.eventKey }; return <div key={setting.eventKey} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{label.ar}</h3><p className="text-xs text-white/40">{label.en}</p></div><button type="button" onClick={() => updateSetting.mutate({ eventKey: setting.eventKey, priority: setting.priority, enabled: !Boolean(setting.enabled) })} className={`rounded-full px-2 py-1 text-[11px] ${setting.enabled ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/50"}`}>{setting.enabled ? "مفعل" : "متوقف"}</button></div><div className="mt-4 flex items-center justify-between"><span className="text-sm text-white/60">الأولوية: {setting.priority}</span><Button size="sm" variant="outline" onClick={() => updateSetting.mutate({ eventKey: setting.eventKey, priority: setting.priority >= 3 ? 0 : setting.priority + 1, enabled: Boolean(setting.enabled) })} className="border-[#e8b84b]/30 bg-transparent text-[#e8b84b]">رفع الأولوية</Button></div></div> })}</div>{!settings.data?.length && <Empty text="لم تُنشأ إعدادات مخصصة بعد. ستظهر عند تسجيل أول إعداد." />}</Panel>
      </div>
    </main>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#e8b84b]/20 bg-[#0c1c2e] p-5 shadow-2xl shadow-black/20"><div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4"><span className="text-[#e8b84b]">{icon}</span><h2 className="text-xl font-bold">{title}</h2></div>{children}</section>; }
function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) { return <div className="rounded-2xl border border-[#e8b84b]/20 bg-[#0c1c2e] p-5"><div className="flex items-center justify-between text-[#e8b84b]"><span className="text-sm text-white/60">{label}</span>{icon}</div><strong className="mt-3 block text-2xl">{value}</strong></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>; }
function formatBytes(bytes: number) { if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
