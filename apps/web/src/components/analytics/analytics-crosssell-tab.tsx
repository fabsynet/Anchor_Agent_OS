'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Plus,
  X,
  Square,
  ChevronDown,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  CrossSellOpportunity,
  CrossSellPairing,
  CrossSellCampaign,
} from '@anchor/shared';

import { api } from '@/lib/api';
import { useUser } from '@/hooks/use-user';
import { exportToCsv, exportToPdf } from '@/lib/export-utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartCard } from './chart-card';
import { ExportButtons } from './export-buttons';

/** All known policy types for gap tracking */
const ALL_POLICY_TYPES = [
  'auto',
  'home',
  'life',
  'health',
  'commercial',
  'travel',
  'umbrella',
];

/** Icon color map for gap type summary cards */
const GAP_ICON_COLORS: Record<string, string> = {
  auto: 'text-blue-600',
  home: 'text-green-600',
  life: 'text-purple-600',
  health: 'text-red-600',
  commercial: 'text-orange-600',
  travel: 'text-cyan-600',
  umbrella: 'text-yellow-600',
};

interface CampaignWithCount extends CrossSellCampaign {
  emailedCount: number;
}

interface EmailedClient {
  clientId: string;
  clientName: string;
  email: string;
  sentAt: string;
  status: string;
}

export function AnalyticsCrossSellTab() {
  const { isAdmin } = useUser();
  const [opportunities, setOpportunities] = useState<CrossSellOpportunity[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pairings state
  const [pairings, setPairings] = useState<CrossSellPairing[]>([]);
  const [showPairingForm, setShowPairingForm] = useState(false);
  const [pairingName, setPairingName] = useState('');
  const [pairingTypes, setPairingTypes] = useState('');
  const [pairingSaving, setPairingSaving] = useState(false);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<CampaignWithCount[]>([]);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [campaignScheduledAt, setCampaignScheduledAt] = useState('');
  const [campaignRecurring, setCampaignRecurring] = useState(false);
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [emailedClients, setEmailedClients] = useState<EmailedClient[]>([]);
  const [emailedLoading, setEmailedLoading] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<CrossSellOpportunity[]>(
        '/api/analytics/cross-sell',
      );
      setOpportunities(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load cross-sell data',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPairings = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await api.get<CrossSellPairing[]>(
        '/api/analytics/cross-sell/pairings',
      );
      setPairings(data);
    } catch {
      // Silently fail — pairings UI won't show data
    }
  }, [isAdmin]);

  const fetchCampaigns = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await api.get<CampaignWithCount[]>(
        '/api/analytics/cross-sell/campaigns',
      );
      setCampaigns(data);
    } catch {
      // Silently fail
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchOpportunities();
    fetchPairings();
    fetchCampaigns();
  }, [fetchOpportunities, fetchPairings, fetchCampaigns]);

  // Aggregate: count clients missing each policy type (memoized)
  const gapCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const type of ALL_POLICY_TYPES) {
      counts[type] = opportunities.filter((o) =>
        o.gaps.includes(type),
      ).length;
    }
    return counts;
  }, [opportunities]);

  // Clients with < 2 policy types (memoized)
  const fewPoliciesCount = useMemo(
    () => opportunities.filter((o) => o.fewPolicies).length,
    [opportunities],
  );

  const handleExportCsv = async () => {
    const rows = opportunities.map((o) => ({
      Client: o.clientName,
      Email: o.clientEmail ?? '',
      Phone: o.clientPhone ?? '',
      'Active Types': o.activeTypes.join(', '),
      'Missing Types': o.gaps.join(', '),
      'Policy Count': o.activeTypes.length,
    }));
    await exportToCsv(rows, 'analytics-cross-sell');
  };

  const handleExportPdf = async () => {
    await exportToPdf(
      'Cross-Sell Opportunities',
      ['Client', 'Email', 'Phone', 'Active Types', 'Missing Types', 'Policies'],
      opportunities.map((o) => [
        o.clientName,
        o.clientEmail ?? '',
        o.clientPhone ?? '',
        o.activeTypes.join(', '),
        o.gaps.join(', '),
        o.activeTypes.length,
      ]),
      'analytics-cross-sell',
    );
  };

  // ─── Pairing handlers ───────────────────────────────────────────────
  const handleCreatePairing = async () => {
    if (!pairingName.trim() || !pairingTypes.trim()) return;
    const types = pairingTypes
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (types.length < 2) {
      toast.error('A pairing needs at least 2 types');
      return;
    }
    setPairingSaving(true);
    try {
      await api.post('/api/analytics/cross-sell/pairings', {
        name: pairingName.trim(),
        types,
      });
      toast.success('Pairing created');
      setPairingName('');
      setPairingTypes('');
      setShowPairingForm(false);
      fetchPairings();
      fetchOpportunities(); // refresh gap analysis
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create pairing',
      );
    } finally {
      setPairingSaving(false);
    }
  };

  const handleDeletePairing = async (id: string) => {
    try {
      await api.delete(`/api/analytics/cross-sell/pairings/${id}`);
      toast.success('Pairing deleted');
      fetchPairings();
      fetchOpportunities();
    } catch {
      toast.error('Failed to delete pairing');
    }
  };

  // ─── Campaign handlers ──────────────────────────────────────────────
  const handleCreateCampaign = async () => {
    if (
      !campaignSubject.trim() ||
      !campaignBody.trim() ||
      !campaignScheduledAt
    )
      return;
    setCampaignSaving(true);
    try {
      await api.post('/api/analytics/cross-sell/campaigns', {
        subject: campaignSubject.trim(),
        body: campaignBody.trim(),
        scheduledAt: new Date(campaignScheduledAt).toISOString(),
        recurring: campaignRecurring,
      });
      toast.success('Campaign created');
      setCampaignSubject('');
      setCampaignBody('');
      setCampaignScheduledAt('');
      setCampaignRecurring(false);
      setShowCampaignForm(false);
      fetchCampaigns();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create campaign',
      );
    } finally {
      setCampaignSaving(false);
    }
  };

  const handleStopCampaign = async (id: string) => {
    try {
      await api.patch(`/api/analytics/cross-sell/campaigns/${id}/stop`);
      toast.success('Campaign stopped');
      fetchCampaigns();
    } catch {
      toast.error('Failed to stop campaign');
    }
  };

  const handleExpandCampaign = async (id: string) => {
    if (expandedCampaign === id) {
      setExpandedCampaign(null);
      return;
    }
    setExpandedCampaign(id);
    setEmailedLoading(true);
    try {
      const data = await api.get<EmailedClient[]>(
        `/api/analytics/cross-sell/campaigns/${id}/emails`,
      );
      setEmailedClients(data);
    } catch {
      setEmailedClients([]);
    } finally {
      setEmailedLoading(false);
    }
  };

  const getCampaignStatus = (c: CampaignWithCount) => {
    if (!c.active && c.lastRunAt) return 'Sent';
    if (!c.active) return 'Stopped';
    if (c.recurring && c.lastRunAt) return 'Recurring';
    if (c.lastRunAt) return 'Sent';
    return 'Scheduled';
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'bg-green-100 text-green-800';
      case 'Stopped':
        return 'bg-gray-100 text-gray-600';
      case 'Recurring':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (error) {
    return (
      <div className="py-12 text-center text-destructive">{error}</div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (opportunities.length === 0 && pairings.length === 0) {
    return (
      <div className="space-y-6">
        {/* Still show pairings card for admin even when no opportunities */}
        {isAdmin && (
          <PairingsCard
            pairings={pairings}
            showForm={showPairingForm}
            setShowForm={setShowPairingForm}
            name={pairingName}
            setName={setPairingName}
            types={pairingTypes}
            setTypes={setPairingTypes}
            saving={pairingSaving}
            onCreate={handleCreatePairing}
            onDelete={handleDeletePairing}
          />
        )}
        <div className="py-12 text-center text-muted-foreground">
          <ShieldAlert className="mx-auto mb-3 size-10 opacity-40" />
          No cross-sell opportunities found. All clients have full coverage.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pairings Config (admin only) */}
      {isAdmin && (
        <PairingsCard
          pairings={pairings}
          showForm={showPairingForm}
          setShowForm={setShowPairingForm}
          name={pairingName}
          setName={setPairingName}
          types={pairingTypes}
          setTypes={setPairingTypes}
          saving={pairingSaving}
          onCreate={handleCreatePairing}
          onDelete={handleDeletePairing}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ALL_POLICY_TYPES.filter((type) => gapCounts[type] > 0).map((type) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Missing {type.charAt(0).toUpperCase() + type.slice(1)}
              </CardTitle>
              <ShieldAlert
                className={`size-5 ${GAP_ICON_COLORS[type] ?? 'text-muted-foreground'}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{gapCounts[type]}</div>
              <p className="text-xs text-muted-foreground">
                {gapCounts[type] === 1 ? 'client' : 'clients'}
              </p>
            </CardContent>
          </Card>
        ))}
        {fewPoliciesCount > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under-Insured
              </CardTitle>
              <AlertTriangle className="size-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{fewPoliciesCount}</div>
              <p className="text-xs text-muted-foreground">
                {'< 2 policy types'}
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Opportunities
            </CardTitle>
            <Users className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              clients with gaps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <ExportButtons
          onExportCsv={handleExportCsv}
          onExportPdf={handleExportPdf}
          loading={loading}
        />
      </div>

      {/* Detail Table */}
      <ChartCard
        title="Coverage Gap Details"
        description="All clients with coverage gaps and cross-sell opportunities"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium text-muted-foreground">
                  Client Name
                </th>
                <th className="pb-2 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="pb-2 text-left font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="pb-2 text-left font-medium text-muted-foreground">
                  Active Types
                </th>
                <th className="pb-2 text-left font-medium text-muted-foreground">
                  Missing Types
                </th>
                <th className="pb-2 text-right font-medium text-muted-foreground">
                  # Policies
                </th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.clientId} className="border-b last:border-0">
                  <td className="py-2">
                    <Link
                      href={`/clients/${o.clientId}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {o.clientName}
                    </Link>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {o.clientEmail ?? '\u2014'}
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {o.clientPhone ?? '\u2014'}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {o.activeTypes.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {o.gaps.map((g) => (
                        <Badge
                          key={g}
                          variant="destructive"
                          className="text-xs"
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-right">{o.activeTypes.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Campaigns (admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Cross-Sell Campaigns</CardTitle>
                <CardDescription>
                  Schedule email campaigns to clients with coverage gaps
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowCampaignForm(!showCampaignForm)}
              >
                <Plus className="mr-1 size-4" />
                Create Campaign
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create Campaign Form */}
            {showCampaignForm && (
              <div className="space-y-3 rounded-lg border p-4">
                <div>
                  <Label htmlFor="campaign-subject">Subject</Label>
                  <Input
                    id="campaign-subject"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    placeholder="Protect what matters most"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-body">Body</Label>
                  <Textarea
                    id="campaign-body"
                    value={campaignBody}
                    onChange={(e) => setCampaignBody(e.target.value)}
                    placeholder="Write your cross-sell email message..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-scheduled">Scheduled Date/Time</Label>
                  <Input
                    id="campaign-scheduled"
                    type="datetime-local"
                    value={campaignScheduledAt}
                    onChange={(e) => setCampaignScheduledAt(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="campaign-recurring"
                    type="checkbox"
                    checked={campaignRecurring}
                    onChange={(e) => setCampaignRecurring(e.target.checked)}
                    className="size-4 rounded border-gray-300"
                  />
                  <Label htmlFor="campaign-recurring">Repeat monthly</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateCampaign}
                    disabled={
                      campaignSaving ||
                      !campaignSubject.trim() ||
                      !campaignBody.trim() ||
                      !campaignScheduledAt
                    }
                  >
                    {campaignSaving ? 'Creating...' : 'Create'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCampaignForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Campaigns List */}
            {campaigns.length === 0 && !showCampaignForm && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No campaigns yet. Create one to start reaching clients.
              </p>
            )}
            {campaigns.map((c) => {
              const status = getCampaignStatus(c);
              return (
                <div key={c.id} className="rounded-lg border">
                  <div
                    className="flex cursor-pointer items-center justify-between p-3"
                    onClick={() => handleExpandCampaign(c.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedCampaign === c.id ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{c.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          Scheduled:{' '}
                          {new Date(c.scheduledAt).toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCampaignStatusColor(status)}`}
                      >
                        {status}
                      </span>
                      {c.emailedCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="size-3" />
                          {c.emailedCount}
                        </span>
                      )}
                      {c.active && c.recurring && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStopCampaign(c.id);
                          }}
                        >
                          <Square className="mr-1 size-3" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded: emailed clients */}
                  {expandedCampaign === c.id && (
                    <div className="border-t px-3 pb-3 pt-2">
                      {emailedLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ) : emailedClients.length === 0 ? (
                        <p className="py-2 text-sm text-muted-foreground">
                          No emails sent yet for this campaign.
                        </p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="pb-1 text-left text-xs font-medium text-muted-foreground">
                                Client
                              </th>
                              <th className="pb-1 text-left text-xs font-medium text-muted-foreground">
                                Email
                              </th>
                              <th className="pb-1 text-left text-xs font-medium text-muted-foreground">
                                Sent
                              </th>
                              <th className="pb-1 text-left text-xs font-medium text-muted-foreground">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {emailedClients.map((ec, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-1">{ec.clientName}</td>
                                <td className="py-1 text-muted-foreground">
                                  {ec.email}
                                </td>
                                <td className="py-1 text-muted-foreground">
                                  {new Date(ec.sentAt).toLocaleDateString(
                                    'en-CA',
                                  )}
                                </td>
                                <td className="py-1">
                                  <Badge
                                    variant={
                                      ec.status === 'sent'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {ec.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Pairings Card (extracted for reuse in empty state)
// ──────────────────────────────────────────────────────────────────────────

function PairingsCard({
  pairings,
  showForm,
  setShowForm,
  name,
  setName,
  types,
  setTypes,
  saving,
  onCreate,
  onDelete,
}: {
  pairings: CrossSellPairing[];
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  types: string;
  setTypes: (v: string) => void;
  saving: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Cross-Sell Pairings</CardTitle>
            <CardDescription>
              Configure which product combinations to analyze (max 10)
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={pairings.length >= 10}
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-1 size-4" />
            Add Pairing
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Existing pairings */}
        {pairings.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">
            No custom pairings configured. Using defaults (Auto+Home,
            Life+Health, Home+Umbrella).
          </p>
        )}
        {pairings.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{p.name}</span>
              <div className="flex gap-1">
                {p.types.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onDelete(p.id)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        {/* Add form */}
        {showForm && (
          <div className="space-y-2 rounded-md border p-3">
            <div>
              <Label htmlFor="pairing-name">Name</Label>
              <Input
                id="pairing-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Auto + Home"
              />
            </div>
            <div>
              <Label htmlFor="pairing-types">
                Types (comma-separated, min 2)
              </Label>
              <Input
                id="pairing-types"
                value={types}
                onChange={(e) => setTypes(e.target.value)}
                placeholder="e.g. auto, home"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onCreate}
                disabled={saving || !name.trim() || !types.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
