import MetricCard from './MetricCard';

interface MetricsGridProps {
    total: number;
    live: number;
    draft: number;
    growth: string;
}

export default function MetricsGrid({ total, live, draft, growth }: MetricsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Total Teardowns" value={total} color="text-primary" />
            <MetricCard label="Live Status" value={live} color="text-emerald" />
            <MetricCard label="Draft Items" value={draft} color="text-amber" />
            <MetricCard label="Monthly Growth" value={growth} color="text-white" />
        </div>
    );
}
