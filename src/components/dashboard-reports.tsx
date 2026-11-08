'use client';

import { useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowDown, ArrowRight, Building2, ClipboardCheck, KeyRound, RefreshCw, ShieldCheck, UserRound, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-store';
import styles from './dashboard-reports.module.css';

interface PropertyStats {
  total: number;
  listed: number;
  occupied: number;
  vacant: number;
}

interface PublicSummary {
  users: number;
  owners: number;
  tenants: number;
  properties: PropertyStats;
}

interface DashboardSummary {
  users: { total: number; active: number; pending: number; suspended: number; owners: number; tenants: number; cypress_admins: number; super_admins: number };
  properties: PropertyStats;
  tenancies: { active: number; proposed: number };
  tickets: { open: number; escalated: number; overdue: number };
  new_leads: number;
  rent_to_verify: number;
  payments_to_verify: number;
  pending_registrations: number;
  active_vouchers: number;
}

const chartColors = ['#167d65', '#d99a25', '#2289b8'];

function subscribeMotion(listener: () => void) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', listener);
  return () => preference.removeEventListener('change', listener);
}

const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverMotion = () => false;

function Workflow({ publicView }: { publicView: boolean }) {
  const steps = publicView
    ? [{ title: 'Property registration', Icon: Building2, href: '/owner-inquiry' }, { title: 'Cypress review', Icon: ShieldCheck, href: '/owner-services' }, { title: 'Tenant onboarding', Icon: KeyRound, href: '/tenants/find-property' }, { title: 'Rent & maintenance', Icon: ClipboardCheck, href: '/owner-services' }]
    : [{ title: 'Users & access', Icon: Users, href: '/owners' }, { title: 'Property registration', Icon: Building2, href: '/properties' }, { title: 'Tenancy approval', Icon: KeyRound, href: '/tenancies' }, { title: 'Rent & maintenance', Icon: ClipboardCheck, href: '/invoices' }];

  return <div className={styles.workflow}>
    <h3>{publicView ? 'Property Management Flow' : 'Operations Flow'}</h3>
    <ol aria-label="Property management workflow">
      {steps.map(({ title, Icon, href }, index) => <li key={title} style={{ animationDelay: `${index * 60}ms` }}>
        <Link href={href} className={styles.step}>
          <span className={styles.stepTop}><Icon aria-hidden="true" className="h-5 w-5 shrink-0" /><span aria-hidden="true" className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span></span>
          <span className={styles.stepTitle}>{title}</span>
        </Link>
        {index < steps.length - 1 && <><ArrowRight aria-hidden="true" className={`${styles.connector} hidden sm:block`} /><ArrowDown aria-hidden="true" className={`${styles.connector} sm:hidden`} /></>}
      </li>)}
    </ol>
  </div>;
}

function OccupancyChart({ properties, animate }: { properties: PropertyStats; animate: boolean }) {
  const other = Math.max(0, properties.total - properties.occupied - properties.vacant);
  const data = [{ name: 'Occupied', value: properties.occupied }, { name: 'Vacant', value: properties.vacant }, { name: 'Other', value: other }];
  return <div className={styles.chart}>
    <h3>Property Occupancy</h3>
    <div className={styles.plot} role="img" aria-label={`Properties: ${properties.occupied} occupied, ${properties.vacant} vacant, ${other} other`}>
      {properties.total === 0 ? <div className={styles.empty}><Building2 aria-hidden="true" /><span>No properties registered</span></div> : <>
        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={95} paddingAngle={3} isAnimationActive={animate} animationDuration={650} animationEasing="ease-out">
          {data.map((entry, index) => <Cell key={entry.name} fill={chartColors[index]} />)}
        </Pie><Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} /></PieChart></ResponsiveContainer>
        <div className={styles.donutCenter} aria-hidden="true"><strong>{data.reduce((total, entry) => total + entry.value, 0).toLocaleString('en-IN')}</strong><span>Properties</span></div>
      </>}
    </div>
    <ul className={styles.legend}>{data.map((entry, index) => <li key={entry.name}><span aria-hidden="true" className={styles.legendSwatch} style={{ background: chartColors[index] }} />{entry.name}: <strong>{entry.value}</strong></li>)}</ul>
  </div>;
}

export function DashboardReports({ publicView = false, superAdmin = false }: { publicView?: boolean; superAdmin?: boolean }) {
  const animate = useSyncExternalStore(subscribeMotion, motionAllowed, serverMotion);
  const userID = useAuth((state) => state.user?.id);
  const report = useQuery({
    queryKey: ['dashboard-reports', publicView ? 'public' : 'staff', publicView ? null : userID],
    queryFn: async () => publicView
      ? (await api.get<PublicSummary>('/public/reports/summary', { auth: false })).data
      : (await api.get<DashboardSummary>('/reports/summary')).data,
    staleTime: 60_000,
    retry: 1,
  });
  const data = report.data;
  const privateData = !publicView && data ? data as DashboardSummary : undefined;
  const publicData = publicView && data ? data as PublicSummary : undefined;
  const userCounts = privateData?.users;
  const metrics = publicData ? [
    { label: 'Active Users', value: publicData.users, Icon: Users },
    { label: 'Property Owners', value: publicData.owners, Icon: KeyRound },
    { label: 'Tenants', value: publicData.tenants, Icon: UserRound },
    { label: 'Properties', value: publicData.properties.total, Icon: Building2 },
  ] : userCounts ? [
    { label: 'Total Users', value: userCounts.total, Icon: Users },
    { label: 'Property Owners', value: userCounts.owners, Icon: KeyRound },
    { label: 'Tenants', value: userCounts.tenants, Icon: UserRound },
    { label: 'Cypress Admins', value: userCounts.cypress_admins, Icon: ShieldCheck },
  ] : [];
  const bars = publicData
    ? [{ name: 'Owners', count: publicData.owners }, { name: 'Tenants', count: publicData.tenants }]
    : userCounts ? [{ name: 'Active', count: userCounts.active }, { name: 'Pending', count: userCounts.pending }, { name: 'Suspended', count: userCounts.suspended }] : [];

  return <section aria-labelledby={publicView ? 'public-reports-heading' : 'dashboard-reports-heading'} className={`${styles.report} ${publicView ? 'py-4' : 'mt-8 border-t border-slate-200 pt-8'}`}>
    <div className={styles.header}>
      <h2 id={publicView ? 'public-reports-heading' : 'dashboard-reports-heading'} className={styles.heading}>{publicView ? 'Cypress in Numbers' : 'Portfolio Reports'}</h2>
      <div className={styles.headerActions}>
        {report.dataUpdatedAt > 0 && <time className={styles.updated} dateTime={new Date(report.dataUpdatedAt).toISOString()}>{report.isFetching ? 'Updating...' : `Updated ${new Date(report.dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}</time>}
        <button type="button" title="Refresh reports" aria-label="Refresh reports" disabled={report.isFetching} onClick={() => void report.refetch()} className={styles.refresh}><RefreshCw aria-hidden="true" className={`h-4 w-4 ${report.isFetching ? 'animate-spin' : ''}`} /></button>
      </div>
    </div>
    {report.isPending && <div role="status" className={styles.loading}><div className={styles.skeletons} aria-hidden="true">{[0, 1, 2, 3].map((index) => <span key={index} />)}</div>Loading reports...</div>}
    {report.isError && <p role="alert" className={styles.error}><AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />Reports are currently unavailable.</p>}
    {data && !report.isError && <>
      <dl className={styles.metrics}>{metrics.map(({ label, value, Icon }, index) => <div key={label} className={styles.metric} data-tone={index % 3} style={{ animationDelay: `${index * 60}ms` }}>
        <dt><span className={styles.metricIcon}><Icon aria-hidden="true" className="h-4 w-4" /></span>{label}</dt>
        <dd>{value.toLocaleString('en-IN')}</dd>
      </div>)}</dl>
      <div className={styles.charts}>
        <OccupancyChart properties={data.properties} animate={animate} />
        <div className={styles.chart}><h3>{publicView ? 'Owners & Tenants' : 'Account Status'}</h3>
          <div className={styles.plot} role="img" aria-label={bars.map((entry) => `${entry.name}: ${entry.count}`).join(', ')}><ResponsiveContainer width="100%" height="100%"><BarChart data={bars} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} width={35} tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} /><Bar dataKey="count" name="Users" maxBarSize={54} radius={[4, 4, 0, 0]} isAnimationActive={animate} animationDuration={650} animationEasing="ease-out">{bars.map((entry, index) => <Cell key={entry.name} fill={chartColors[index]} />)}</Bar>
          </BarChart></ResponsiveContainer></div>
        </div>
      </div>
      {privateData && <dl className={styles.details}>
        {[
          ['Properties', privateData.properties.total], ['Active Tenancies', privateData.tenancies.active], ['Proposed Tenancies', privateData.tenancies.proposed], ['Open Tickets', privateData.tickets.open],
          ['Escalated Tickets', privateData.tickets.escalated], ['Overdue Tickets', privateData.tickets.overdue], ['New Enquiries', privateData.new_leads], ['Pending Applications', privateData.pending_registrations],
          ['Payments to Verify', privateData.payments_to_verify], ['Rent Receipts to Verify', privateData.rent_to_verify], ['Active Vouchers', privateData.active_vouchers], ['Listed Properties', privateData.properties.listed],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>}
      {superAdmin && <div className={styles.management}>
        <Link href="/admins"><ShieldCheck aria-hidden="true" className="h-4 w-4" />Manage Cypress Admins</Link>
        <Link href="/owners"><KeyRound aria-hidden="true" className="h-4 w-4" />Manage Owners</Link>
        <Link href="/tenants"><UserRound aria-hidden="true" className="h-4 w-4" />Manage Tenants</Link>
      </div>}
    </>}
    <Workflow publicView={publicView} />
  </section>;
}