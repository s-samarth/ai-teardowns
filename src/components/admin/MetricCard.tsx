interface MetricCardProps {
    label: string;
    value: string | number;
    color?: string;
}

export default function MetricCard({ label, value, color = 'text-white' }: MetricCardProps) {
    return (
        <div className="bg-background-admin border border-border-dark rounded-lg p-5">
            <p
                className="text-text-secondary text-xs tracking-[0.15em] uppercase mb-3"
                style={{ fontFamily: 'var(--font-mono)' }}
            >
                {label}
            </p>
            <p className={`text-3xl font-bold ${color}`} style={{ fontFamily: 'var(--font-mono)' }}>
                {value}
            </p>
        </div>
    );
}
