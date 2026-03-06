import TeardownCard from './TeardownCard';
import type { TeardownWithId } from '@/lib/types';

interface TeardownGridProps {
    teardowns: TeardownWithId[];
}

export default function TeardownGrid({ teardowns }: TeardownGridProps) {
    if (teardowns.length === 0) {
        return (
            <div className="text-center py-20 px-4">
                <span className="material-symbols-outlined text-5xl text-text-secondary mb-4 block">
                    deployed_code
                </span>
                <p className="text-text-muted text-lg">No teardowns published yet.</p>
                <p className="text-text-secondary text-sm mt-2">Check back soon for intelligence reports.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teardowns.map((teardown) => (
                    <TeardownCard key={teardown.id} teardown={teardown} />
                ))}
            </div>
        </div>
    );
}
