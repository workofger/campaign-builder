import { useState } from 'react';
import {
  Search,
  Bot,
  ShieldCheck,
  MessageSquare,
  FileText,
  CheckCircle2,
} from 'lucide-react';

type ContractStatus = 'pending_delivery' | 'completed' | 'pricing_pending';

interface Contract {
  id: string;
  requestId: string;
  startDate: string;
  vehicleImage: string;
  pickupTime: string;
  hoursPerDay: number;
  milesPerDay: number;
  status: ContractStatus;
  statusMessage: string;
}

const ONGOING_CONTRACTS: Contract[] = [
  {
    id: '1',
    requestId: '#DD0007845',
    startDate: "Mon, 19 Mar '22",
    vehicleImage: 'https://placehold.co/58x48/f5f5f5/999?text=Van',
    pickupTime: '08:45 AM',
    hoursPerDay: 6,
    milesPerDay: 150,
    status: 'pending_delivery',
    statusMessage: 'Create delivery for tomorrow is pending',
  },
  {
    id: '2',
    requestId: '#DD0007846',
    startDate: "Tue, 20 Mar '22",
    vehicleImage: 'https://placehold.co/58x48/f5f5f5/999?text=Van',
    pickupTime: '09:00 AM',
    hoursPerDay: 8,
    milesPerDay: 200,
    status: 'completed',
    statusMessage: 'All deliveries completed for the day',
  },
  {
    id: '3',
    requestId: '#DD0007847',
    startDate: "Wed, 21 Mar '22",
    vehicleImage: 'https://placehold.co/58x48/f5f5f5/999?text=Van',
    pickupTime: '07:30 AM',
    hoursPerDay: 5,
    milesPerDay: 120,
    status: 'pending_delivery',
    statusMessage: 'Create delivery for tomorrow is pending',
  },
  {
    id: '4',
    requestId: '#DD0007848',
    startDate: "Thu, 22 Mar '22",
    vehicleImage: 'https://placehold.co/58x48/f5f5f5/999?text=Van',
    pickupTime: '10:00 AM',
    hoursPerDay: 7,
    milesPerDay: 180,
    status: 'completed',
    statusMessage: 'All deliveries completed for the day',
  },
];

const PENDING_CONTRACTS: Contract[] = [
  {
    id: '5',
    requestId: '#DD0007849',
    startDate: "Fri, 23 Mar '22",
    vehicleImage: 'https://placehold.co/58x48/f5f5f5/999?text=Van',
    pickupTime: '08:00 AM',
    hoursPerDay: 6,
    milesPerDay: 140,
    status: 'pricing_pending',
    statusMessage: 'Pricing estimate need to be shared',
  },
  {
    id: '6',
    requestId: '#DD0007850',
    startDate: "Sat, 24 Mar '22",
    vehicleImage: 'https://placehold.co/58x48/f5f5f5/999?text=Van',
    pickupTime: '09:30 AM',
    hoursPerDay: 4,
    milesPerDay: 100,
    status: 'pricing_pending',
    statusMessage: 'Pricing estimate need to be shared',
  },
];

const STATUS_STYLES: Record<
  ContractStatus,
  { bg: string; text: string; icon: typeof FileText }
> = {
  pending_delivery: {
    bg: 'bg-pr-danger/5',
    text: 'text-pr-danger',
    icon: FileText,
  },
  completed: {
    bg: 'bg-pr-success/5',
    text: 'text-pr-success',
    icon: CheckCircle2,
  },
  pricing_pending: {
    bg: 'bg-pr-yellow-orange/5',
    text: 'text-pr-yellow-orange',
    icon: FileText,
  },
};

function ContractCard({ contract }: { contract: Contract }) {
  const style = STATUS_STYLES[contract.status];
  const StatusIcon = style.icon;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 gap-6">
          <div>
            <p className="text-xs font-medium text-pr-text-secondary">Request ID</p>
            <p className="mt-0.5 text-sm font-semibold text-pr-black">
              {contract.requestId}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-pr-text-secondary">Start Date</p>
            <p className="mt-0.5 text-sm font-semibold text-pr-black">
              {contract.startDate}
            </p>
          </div>
        </div>
        <img
          src={contract.vehicleImage}
          alt="Vehicle"
          className="h-12 w-[58px] rounded-lg object-cover"
        />
      </div>

      <hr className="my-4 border-pr-outline/50" />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-bold text-pr-black">
            {contract.pickupTime}
          </p>
          <p className="text-xs text-pr-text-secondary">Reach Pickup Time</p>
        </div>
        <div>
          <p className="text-sm font-bold text-pr-black">
            {contract.hoursPerDay} Hours
          </p>
          <p className="text-xs text-pr-text-secondary">Hours per day</p>
        </div>
        <div>
          <p className="text-sm font-bold text-pr-black">
            {contract.milesPerDay} miles
          </p>
          <p className="text-xs text-pr-text-secondary">Miles per day</p>
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 ${style.bg}`}>
        <StatusIcon size={16} className={style.text} />
        <span className={`text-xs font-medium ${style.text}`}>
          {contract.statusMessage}
        </span>
      </div>
    </div>
  );
}

function ContractSection({
  title,
  contracts,
}: {
  title: string;
  contracts: Contract[];
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-bold text-pr-black">{title}</h2>
        <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-pr-success/10 px-2 text-xs font-bold text-pr-success">
          {contracts.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {contracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>
    </div>
  );
}

export function DedicatedDeliveryPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-1 flex-col bg-pr-surface-light font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-pr-outline bg-white px-6 py-3">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pr-text-secondary"
          />
          <input
            type="text"
            placeholder="Search delivery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-pr-outline bg-pr-surface-warm py-2 pl-10 pr-4 text-sm text-pr-black placeholder:text-pr-text-muted focus:border-pr-yellow focus:outline-none focus:ring-1 focus:ring-pr-yellow"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-pr-yellow/20 py-1.5 pl-2 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pr-yellow text-xs font-bold text-pr-black">
              JD
            </div>
            <span className="text-sm font-medium text-pr-black">John Doe</span>
          </div>
          <button className="rounded-lg p-2 text-pr-text-muted hover:bg-pr-surface-warm hover:text-pr-black">
            <Bot size={20} />
          </button>
          <button className="rounded-lg p-2 text-pr-text-muted hover:bg-pr-surface-warm hover:text-pr-black">
            <ShieldCheck size={20} />
          </button>
          <button className="rounded-lg p-2 text-pr-text-muted hover:bg-pr-surface-warm hover:text-pr-black">
            <MessageSquare size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* Tabs */}
        <div className="mb-8 flex gap-6 border-b border-pr-outline">
          <button
            onClick={() => setActiveTab('active')}
            className={`relative pb-3 text-sm font-semibold transition-colors ${
              activeTab === 'active'
                ? 'text-pr-black'
                : 'text-pr-text-secondary hover:text-pr-text-secondary'
            }`}
          >
            Active Contracts
            {activeTab === 'active' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-pr-yellow-orange" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`relative pb-3 text-sm font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'text-pr-black'
                : 'text-pr-text-secondary hover:text-pr-text-secondary'
            }`}
          >
            Completed Contracts
            {activeTab === 'completed' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-pr-yellow-orange" />
            )}
          </button>
        </div>

        {activeTab === 'active' && (
          <div className="space-y-10">
            <ContractSection
              title="Ongoing Contracts"
              contracts={ONGOING_CONTRACTS}
            />
            <ContractSection
              title="Pending Contracts"
              contracts={PENDING_CONTRACTS}
            />
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="flex h-48 items-center justify-center text-sm text-pr-text-secondary">
            No completed contracts to display.
          </div>
        )}
      </main>
    </div>
  );
}
