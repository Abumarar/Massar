import { useState, useMemo, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  useListPassengerRideRequests,
  useListCaptainRideRequests,
  useListRoutes,
  useListAdminCaptains,
  useUpdateAdminCaptainStatus,
  useListAdminRideRequests,
} from '@workspace/api-client-react';
import type { RideRequest, Route, AdminCaptain, AdminCaptainStatus } from '@workspace/api-client-react';

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
function IconActivity({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconCar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
function IconRoute({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconMap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconBan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}
function IconLogOut({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconKey({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_ARABIC: Record<string, string> = {
  pending:          'قيد الانتظار',
  accepted:         'تم القبول',
  captain_arriving: 'الكابتن في الطريق',
  picked_up:        'تم ركوب العميل',
  in_progress:      'الرحلة جارية',
  completed:        'مكتملة',
  cancelled:        'ملغية',
  rejected:         'مرفوضة',
  in_review:        'قيد التدقيق',
  approved:         'معتمد',
  suspended:        'موقوف',
};

const STATUS_COLORS: Record<string, string> = {
  pending:          'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  accepted:         'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  captain_arriving: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  picked_up:        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  in_progress:      'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  completed:        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled:        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  rejected:         'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  in_review:        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  approved:         'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  suspended:        'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_ARABIC[status] ?? status.replace(/_/g, ' ')}
    </span>
  );
}

function formatDate(str: string) {
  try {
    return new Date(str).toLocaleDateString('ar-JO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return str;
  }
}

function formatFare(fare: number) {
  return `${fare.toFixed(2)} د.أ`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, accent, trend,
}: {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  accent: string;
  trend?: string;
}) {
  return (
    <div className="ops-panel rounded-2xl p-5 flex flex-col gap-3 group hover:scale-[1.015] transition-transform duration-200">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-extrabold ops-display tracking-tight">{value}</p>
      {trend && (
        <p className="text-xs text-muted-foreground">{trend}</p>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

// ─── Ride Requests Table ──────────────────────────────────────────────────────
const ALL_STATUSES = ['pending','accepted','captain_arriving','picked_up','in_progress','completed','cancelled','rejected'];

function RideRequestsPanel({
  title,
  data,
  isLoading,
  refetch,
}: {
  title: string;
  data?: RideRequest[];
  isLoading: boolean;
  refetch: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSearch = !search || r.id.includes(search) || r.routeId?.includes(search) || r.passengerId?.includes(search);
      return matchStatus && matchSearch;
    });
  }, [data, statusFilter, search]);

  const counts = useMemo(() => {
    if (!data) return {};
    return data.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [data]);

  return (
    <div className="ops-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-base font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data ? `${filtered.length} من أصل ${data.length} طلب` : 'جاري التحميل…'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="search"
            placeholder="بحث برقم الطلب / المسار / الراكب…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg bg-muted border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-muted-foreground w-56"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg bg-muted border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
          >
            <option value="all">جميع الحالات</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>
                {STATUS_ARABIC[s] ?? s.replace(/_/g, ' ')} {counts[s] ? `(${counts[s]})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={refetch}
            className="p-1.5 rounded-lg bg-muted border border-[hsl(var(--border))] hover:bg-accent hover:text-accent-foreground transition-colors"
            title="تحديث البيانات"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status chips */}
      <div className="px-6 py-3 flex items-center gap-2 overflow-x-auto border-b border-[hsl(var(--border))] scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-secondary'
          }`}
        >
          الكل {data ? `(${data.length})` : ''}
        </button>
        {ALL_STATUSES.filter(s => counts[s]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary'
            }`}
          >
            {STATUS_ARABIC[s] ?? s.replace(/_/g, ' ')} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-muted/40">
              <th className="text-right px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">رقم الطلب</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">الراكب</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">المسار</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">المقاعد</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">الأجرة المقدرة</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">الحالة</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">وقت الطلب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-3" colSpan={7}>
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <IconActivity className="w-8 h-8 opacity-30" />
                    <p className="font-semibold text-sm">لا توجد طلبات رحلات مطابقة</p>
                    <p className="text-xs">جرّب تعديل خيارات الفلترة أو البحث</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-3">
                  <span className="ops-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {r.id.slice(0, 8)}…
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.passenger?.fullName ? (
                    <div>
                      <p className="font-medium">{r.passenger.fullName}</p>
                      <p className="text-xs text-muted-foreground ops-mono">{r.passenger.phone}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground ops-mono text-xs">{r.passengerId?.slice(0,8)}…</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium">{r.routeId ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                    {r.seatsRequested ?? 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-accent">{formatFare(r.estimatedFare)}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Routes Panel ─────────────────────────────────────────────────────────────
function RoutesPanel() {
  const query = useListRoutes();

  return (
    <div className="ops-panel rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">المسارات المعتمدة</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {query.data ? `${query.data.length} مسار نشط` : 'جاري التحميل…'}
          </p>
        </div>
        <button
          onClick={() => query.refetch()}
          className="p-1.5 rounded-lg bg-muted border border-[hsl(var(--border))] hover:bg-accent hover:text-accent-foreground transition-colors"
          title="تحديث المسارات"
        >
          <IconRefresh className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-[hsl(var(--border))]">
        {query.isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-2" />
          </div>
        ))}

        {query.isError && (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p className="text-sm">تعذر تحميل المسارات</p>
          </div>
        )}

        {query.data?.map((route: Route) => (
          <div key={route.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <IconMap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm">{route.name}</p>
                <p className="text-xs text-muted-foreground">
                  {route.origin} ← {route.destination}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-accent">{route.baseFare} د.أ</span>
              <IconChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}

        {query.data?.length === 0 && (
          <div className="px-6 py-8 text-center text-muted-foreground text-sm">
            لا توجد مسارات مضافة حالياً
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Overview page ────────────────────────────────────────────────────────────
function Overview() {
  const passengerQuery = useListPassengerRideRequests();
  const captainQuery = useListCaptainRideRequests();
  const routesQuery = useListRoutes();

  const allRequests = passengerQuery.data ?? [];

  const stats = useMemo(() => ({
    total: allRequests.length,
    completed: allRequests.filter(r => r.status === 'completed').length,
    inProgress: allRequests.filter(r => ['accepted','captain_arriving','picked_up','in_progress'].includes(r.status)).length,
    revenue: allRequests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.estimatedFare ?? 0), 0),
  }), [allRequests]);

  return (
    <div className="ops-fade-in space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي الطلبات"
          value={passengerQuery.isLoading ? '—' : stats.total}
          icon={IconActivity}
          accent="bg-primary/10 text-primary"
          trend="كافة طلبات الرحلات المسجلة"
        />
        <StatCard
          label="رحلات نشطة الآن"
          value={passengerQuery.isLoading ? '—' : stats.inProgress}
          icon={IconCar}
          accent="bg-blue-500/10 text-blue-500"
          trend="الرحلات الجارية حالياً"
        />
        <StatCard
          label="الرحلات المكتملة"
          value={passengerQuery.isLoading ? '—' : stats.completed}
          icon={IconUsers}
          accent="bg-green-500/10 text-green-500"
          trend="تم إنجازها بنجاح"
        />
        <StatCard
          label="الإيرادات التقديرية"
          value={passengerQuery.isLoading ? '—' : `${stats.revenue.toFixed(0)} د.أ`}
          icon={IconRoute}
          accent="bg-accent/20 text-accent"
          trend="من إجمالي الرحلات المكتملة"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Passenger requests takes 2/3 */}
        <div className="xl:col-span-2">
          <RideRequestsPanel
            title="طلبات ركاب مسار"
            data={passengerQuery.data}
            isLoading={passengerQuery.isLoading}
            refetch={passengerQuery.refetch}
          />
        </div>
        {/* Routes sidebar */}
        <div>
          <RoutesPanel />
        </div>
      </div>

      {/* Captain requests full width */}
      <RideRequestsPanel
        title="رحلات الكباتن"
        data={captainQuery.data}
        isLoading={captainQuery.isLoading}
        refetch={captainQuery.refetch}
      />
    </div>
  );
}

// ─── Layout / Nav ─────────────────────────────────────────────────────────────
type Page = 'overview' | 'passenger' | 'captain' | 'routes' | 'captains' | 'all-requests';

const NAV_ITEMS: { id: Page; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview',     label: 'لوحة التحكم العامة',   icon: IconActivity },
  { id: 'all-requests', label: 'كافة طلبات الرحلات',   icon: IconCar },
  { id: 'captains',     label: 'تدقيق واعتماد الكباتن', icon: IconShield },
  { id: 'passenger',   label: 'طلبات الركاب',         icon: IconUsers },
  { id: 'captain',     label: 'رحلات الكباتن',        icon: IconCar },
  { id: 'routes',      label: 'المسارات المعتمدة',     icon: IconMap },
];

function AllRideRequestsPage() {
  const q = useListAdminRideRequests();
  return (
    <div className="ops-fade-in">
      <RideRequestsPanel
        title="كافة طلبات رحلات الركاب (عرض الإدارة)"
        data={q.data}
        isLoading={q.isLoading}
        refetch={q.refetch}
      />
    </div>
  );
}

function PassengerPage() {
  const q = useListPassengerRideRequests();
  return (
    <div className="ops-fade-in">
      <RideRequestsPanel
        title="طلبات رحلات الركاب"
        data={q.data}
        isLoading={q.isLoading}
        refetch={q.refetch}
      />
    </div>
  );
}

function CaptainPage() {
  const q = useListCaptainRideRequests();
  return (
    <div className="ops-fade-in">
      <RideRequestsPanel
        title="رحلات الكباتن"
        data={q.data}
        isLoading={q.isLoading}
        refetch={q.refetch}
      />
    </div>
  );
}

function RoutesPage() {
  return (
    <div className="ops-fade-in max-w-2xl">
      <RoutesPanel />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  },
});

// ─── Captain Status config ────────────────────────────────────────────────────
const CAPTAIN_STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  approved:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  rejected:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant: 'approve' | 'reject' | 'review' | 'suspend' | 'pending';
  children: React.ReactNode;
}) {
  const cls = {
    approve: 'bg-green-600 hover:bg-green-700 text-white',
    reject:  'bg-red-600 hover:bg-red-700 text-white',
    review:  'bg-blue-600 hover:bg-blue-700 text-white',
    suspend: 'bg-orange-500 hover:bg-orange-600 text-white',
    pending: 'bg-muted hover:bg-secondary text-foreground border border-[hsl(var(--border))]',
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
    >
      {children}
    </button>
  );
}

// ─── Review Note Modal ────────────────────────────────────────────────────────
function ReviewNoteModal({
  open,
  captain,
  targetStatus,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  captain: AdminCaptain | null;
  targetStatus: AdminCaptainStatus;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isLoading: boolean;
}) {
  const [note, setNote] = useState('');
  if (!open || !captain) return null;

  const ACTION_LABEL: Record<string, string> = {
    approved:  'اعتماد وتفعيل',
    rejected:  'رفض الطلب',
    suspended: 'إيقاف الحساب',
    in_review: 'وضع قيد التدقيق',
    pending:   'إعادة للانتظار',
  };

  const ACTION_COLOR: Record<string, string> = {
    approved:  'bg-green-600 hover:bg-green-700 text-white',
    rejected:  'bg-red-600 hover:bg-red-700 text-white',
    suspended: 'bg-orange-500 hover:bg-orange-600 text-white',
    in_review: 'bg-blue-600 hover:bg-blue-700 text-white',
    pending:   'bg-muted border border-[hsl(var(--border))] text-foreground',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative ops-panel rounded-2xl p-6 w-full max-w-md shadow-2xl ops-fade-in text-right"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-bold mb-1">
          {ACTION_LABEL[targetStatus]} - الكابتن
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {captain.user?.fullName ?? 'كابتن'} · {captain.user?.phone ?? ''}
        </p>

        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
          ملاحظة التدقيق <span className="font-normal opacity-60">(اختياري)</span>
        </label>
        <textarea
          className="w-full text-sm px-3 py-2 rounded-lg bg-muted border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
          rows={3}
          placeholder="أضف ملاحظة أو سبب القرار..."
          value={note}
          onChange={e => setNote(e.target.value)}
          autoFocus
        />

        <div className="flex items-center gap-2 mt-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-muted border border-[hsl(var(--border))] hover:bg-secondary transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={isLoading}
            className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors disabled:opacity-40 ${ACTION_COLOR[targetStatus]}`}
          >
            {isLoading ? 'جاري الحفظ…' : ACTION_LABEL[targetStatus]}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Captain Card ─────────────────────────────────────────────────────────────
function CaptainCard({
  captain,
  onAction,
  isPending,
}: {
  captain: AdminCaptain;
  onAction: (captain: AdminCaptain, status: AdminCaptainStatus) => void;
  isPending: boolean;
}) {
  const statusCls = CAPTAIN_STATUS_COLORS[captain.status] ?? 'bg-gray-100 text-gray-800';

  return (
    <div className="ops-panel rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow ops-fade-in text-right">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-base font-bold shrink-0">
            {(captain.user?.fullName ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm">{captain.user?.fullName ?? '—'}</p>
            <p className="text-xs text-muted-foreground ops-mono">{captain.user?.phone ?? '—'}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusCls}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {STATUS_ARABIC[captain.status] ?? captain.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Vehicle info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-muted-foreground mb-0.5">نوع المركبة</p>
          <p className="font-semibold">{captain.vehicle?.makeModel ?? '—'}</p>
        </div>
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-muted-foreground mb-0.5">رقم اللوحة</p>
          <p className="font-semibold ops-mono">{captain.vehicle?.plate ?? '—'}</p>
        </div>
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-muted-foreground mb-0.5">اللون</p>
          <p className="font-semibold">{captain.vehicle?.color ?? '—'}</p>
        </div>
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-muted-foreground mb-0.5">المقاعد</p>
          <p className="font-semibold">{captain.vehicle?.totalSeats ?? '—'}</p>
        </div>
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-muted-foreground mb-0.5">الرقم الوطني (آخر 4)</p>
          <p className="font-semibold ops-mono">{captain.nationalIdLast4}</p>
        </div>
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-muted-foreground mb-0.5">تاريخ التقديم</p>
          <p className="font-semibold">{formatDate(captain.submittedAt)}</p>
        </div>
      </div>

      {/* Review note */}
      {captain.reviewNote && (
        <div className="text-xs bg-muted/60 border border-[hsl(var(--border))] rounded-lg px-3 py-2">
          <span className="font-semibold text-muted-foreground">ملاحظة الإدارة: </span>
          {captain.reviewNote}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-[hsl(var(--border))]">
        {captain.status !== 'approved' && (
          <ActionBtn variant="approve" onClick={() => onAction(captain, 'approved')} disabled={isPending}>
            <IconCheck className="w-3.5 h-3.5" /> اعتماد وتفعيل
          </ActionBtn>
        )}
        {captain.status !== 'in_review' && (
          <ActionBtn variant="review" onClick={() => onAction(captain, 'in_review')} disabled={isPending}>
            <IconEye className="w-3.5 h-3.5" /> وضع قيد التدقيق
          </ActionBtn>
        )}
        {captain.status !== 'rejected' && (
          <ActionBtn variant="reject" onClick={() => onAction(captain, 'rejected')} disabled={isPending}>
            <IconX className="w-3.5 h-3.5" /> رفض الطلب
          </ActionBtn>
        )}
        {captain.status !== 'suspended' && (
          <ActionBtn variant="suspend" onClick={() => onAction(captain, 'suspended')} disabled={isPending}>
            <IconBan className="w-3.5 h-3.5" /> إيقاف الحساب
          </ActionBtn>
        )}
        {captain.status !== 'pending' && (
          <ActionBtn variant="pending" onClick={() => onAction(captain, 'pending')} disabled={isPending}>
            إعادة للانتظار
          </ActionBtn>
        )}
      </div>
    </div>
  );
}

// ─── Captains Approval Page ───────────────────────────────────────────────────
function CaptainsApprovalPage() {
  const queryClient = useQueryClient();
  const query = useListAdminCaptains();
  const mutation = useUpdateAdminCaptainStatus();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ captain: AdminCaptain; targetStatus: AdminCaptainStatus } | null>(null);

  const captains = query.data ?? [];

  const counts = useMemo(() => {
    return captains.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [captains]);

  const filtered = useMemo(() => {
    return captains.filter(c => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const term = search.toLowerCase();
      const matchSearch = !term ||
        c.user?.fullName?.toLowerCase().includes(term) ||
        c.user?.phone?.includes(term) ||
        c.vehicle?.plate?.toLowerCase().includes(term) ||
        c.nationalIdLast4.includes(term);
      return matchStatus && matchSearch;
    });
  }, [captains, statusFilter, search]);

  const handleAction = (captain: AdminCaptain, targetStatus: AdminCaptainStatus) => {
    setModal({ captain, targetStatus });
  };

  const handleConfirm = (note: string) => {
    if (!modal) return;
    mutation.mutate(
      { id: modal.captain.id, data: { status: modal.targetStatus, reviewNote: note || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/admin/captains'] });
          setModal(null);
        },
      },
    );
  };

  const STATUSES = ['pending', 'in_review', 'approved', 'rejected', 'suspended'];

  return (
    <div className="ops-fade-in space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? 'all' : s)}
            className={`ops-panel rounded-xl p-4 text-right hover:scale-[1.02] transition-transform ${
              statusFilter === s ? 'ring-2 ring-[hsl(var(--ring))]' : ''
            }`}
          >
            <p className="text-2xl font-extrabold ops-display">{counts[s] ?? 0}</p>
            <p className="text-xs font-medium text-muted-foreground capitalize mt-1">
              {STATUS_ARABIC[s] ?? s.replace(/_/g, ' ')}
            </p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="search"
          placeholder="بحث بالاسم، رقم الهاتف، أو لوحة المركبة…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg bg-muted border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] placeholder:text-muted-foreground flex-1 max-w-sm"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'
            }`}
          >
            الكل ({captains.length})
          </button>
          {STATUSES.filter(s => counts[s]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {STATUS_ARABIC[s] ?? s.replace(/_/g, ' ')} ({counts[s]})
            </button>
          ))}
          <button
            onClick={() => query.refetch()}
            className="p-1.5 rounded-lg bg-muted border border-[hsl(var(--border))] hover:bg-accent hover:text-accent-foreground transition-colors"
            title="تحديث البيانات"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of captain cards */}
      {query.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ops-panel rounded-2xl p-5 space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {query.isError && (
        <div className="ops-panel rounded-2xl p-12 text-center">
          <IconShield className="w-10 h-10 mx-auto opacity-30 mb-3" />
          <p className="font-semibold">تعذر تحميل بيانات الكباتن</p>
          <p className="text-sm text-muted-foreground mt-1">تأكد من تشغيل الخادم وصلاحيات الحساب الإداري.</p>
        </div>
      )}

      {!query.isLoading && !query.isError && filtered.length === 0 && (
        <div className="ops-panel rounded-2xl p-12 text-center">
          <IconShield className="w-10 h-10 mx-auto opacity-30 mb-3" />
          <p className="font-semibold">لا يوجد كباتن مطابقون للبحث</p>
          <p className="text-sm text-muted-foreground mt-1">جرّب تعديل معايير الفلترة أو البحث</p>
        </div>
      )}

      {!query.isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(captain => (
            <CaptainCard
              key={captain.id}
              captain={captain}
              onAction={handleAction}
              isPending={mutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ReviewNoteModal
        open={!!modal}
        captain={modal?.captain ?? null}
        targetStatus={modal?.targetStatus ?? 'pending'}
        onClose={() => setModal(null)}
        onConfirm={handleConfirm}
        isLoading={mutation.isPending}
      />
    </div>
  );
}

interface AdminUser {
  id: string;
  phone: string;
  fullName: string;
  role: string;
}

function AdminLogin({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [username, setUsername] = useState('abumatar');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول، تأكد من صحة البيانات');
      }

      if (data.user?.role !== 'admin') {
        throw new Error('عذراً! هذا الحساب لا يملك صلاحيات الآدمن للدخول هنا.');
      }

      localStorage.setItem('massar_admin_token', data.token);
      localStorage.setItem('massar_admin_user', JSON.stringify(data.user));
      queryClient.clear();
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden ops-shell">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md ops-panel rounded-3xl p-8 shadow-2xl relative z-10 border border-[hsl(var(--border))]">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--sidebar-primary))] flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <span className="text-[hsl(var(--sidebar-primary-foreground))] font-black text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-black ops-display tracking-tight">Massar Operations</h1>
          <p className="text-xs text-muted-foreground mt-1">بوابة إدارة العمليات والتحكم (Admin Portal)</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-3">
            <IconLock className="w-3.5 h-3.5" />
            <span>منطقة محميّة — تسجيل الدخول مطلوب</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-3">
            <IconBan className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              اسم المستخدم (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="abumatar"
              className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-sm font-medium transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              كلمة المرور (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-[hsl(var(--border))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-sm font-medium transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg shadow-primary/25 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <IconRefresh className="w-4 h-4 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <IconKey className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground mt-8">
          مسار &copy; {new Date().getFullYear()} — نظام إدارة العمليات والتوصيل
        </p>
      </div>
    </div>
  );
}

function Shell({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const [page, setPage] = useState<Page>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);

  // Apply dark mode
  const rootClass = dark ? 'dark' : '';

  return (
    <div className={`${rootClass} min-h-screen flex ops-shell`}>
      {/* Sidebar */}
      <aside
        className={`ops-sidebar flex-shrink-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-60' : 'w-16'
        }`}
        style={{ color: 'hsl(var(--sidebar-foreground))' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[hsl(var(--sidebar-border))] gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--sidebar-primary))] flex items-center justify-center shrink-0">
            <span className="text-[hsl(var(--sidebar-primary-foreground))] font-black text-sm">M</span>
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-black text-sm ops-display truncate">مسار</p>
              <p className="text-[10px] opacity-75 font-semibold truncate">إدارة العمليات</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  active
                    ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]'
                    : 'hover:bg-[hsl(var(--sidebar-accent)/0.5)] opacity-70 hover:opacity-100'
                }`}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
                {active && sidebarOpen && (
                  <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[hsl(var(--sidebar-primary))]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Bottom controls */}
        <div className="p-2 border-t border-[hsl(var(--sidebar-border))] flex flex-col gap-1.5">
          {/* Admin user pill */}
          {sidebarOpen && (
            <div className="px-3 py-2 rounded-lg bg-muted/40 border border-[hsl(var(--sidebar-border))] mb-1 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {user.phone[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-right">
                <p className="text-xs font-bold truncate leading-tight ops-mono">{user.phone}</p>
                <p className="text-[10px] text-muted-foreground">مسؤول النظام (Admin)</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(var(--sidebar-accent)/0.5)] transition-colors opacity-70 hover:opacity-100 text-sm"
            title={dark ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {dark ? <IconSun className="w-4 h-4 shrink-0" /> : <IconMoon className="w-4 h-4 shrink-0" />}
            {sidebarOpen && <span>{dark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors opacity-80 hover:opacity-100 text-sm"
            title="تسجيل الخروج"
          >
            <IconLogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(var(--sidebar-accent)/0.5)] transition-colors opacity-70 hover:opacity-100 text-sm"
            title={sidebarOpen ? 'طي القائمة' : 'توسيع القائمة'}
          >
            <IconMenu className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>{sidebarOpen ? 'طي القائمة' : 'توسيع القائمة'}</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[hsl(var(--border))] bg-card shrink-0">
          <div>
            <h1 className="text-lg font-extrabold ops-display">
              {NAV_ITEMS.find(n => n.id === page)?.label ?? 'لوحة التحكم'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('ar-JO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              مباشر 🟢
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          {page === 'overview'      && <Overview />}
          {page === 'all-requests'  && <AllRideRequestsPage />}
          {page === 'captains'      && <CaptainsApprovalPage />}
          {page === 'passenger'     && <PassengerPage />}
          {page === 'captain'       && <CaptainPage />}
          {page === 'routes'        && <RoutesPage />}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('massar_admin_user');
      const token = localStorage.getItem('massar_admin_token');
      if (saved && token) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem('massar_admin_token');
    localStorage.removeItem('massar_admin_user');
    queryClient.clear();
    setAdminUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {!adminUser ? (
        <AdminLogin onLogin={(user) => setAdminUser(user)} />
      ) : (
        <Shell user={adminUser} onLogout={handleLogout} />
      )}
    </QueryClientProvider>
  );
}

export default App;