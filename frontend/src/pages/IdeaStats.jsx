
import { useState, useEffect } from 'react';
import { getIdeaStats } from '../services/ideaService.js';

export default function IdeaStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getIdeaStats();
                setStats(data);
            } catch (err) {
                console.error('Ошибка загрузки статистики:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-10 text-gray-600">Загрузка статистики...</div>;
    if (!stats) return <div className="text-center py-10 text-red-600">Не удалось загрузить статистику</div>;

    const renderTypeDistribution = () => {
        const data = stats.generation_type_distribution || {};
        const entries = Object.entries(data).filter(([_, count]) => count > 0);

        if (entries.length === 0) return <p className="text-gray-500 text-sm">Нет данных</p>;

        return entries.map(([type, count]) => (
            <div key={type} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                <span className="capitalize font-medium text-gray-800">{type}</span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">{count}</span>
            </div>
        ));
    };

    const renderCountDistribution = () => {
        const data = stats.generation_count_distribution || stats["generation_сount_distribution"] || {};
        const counts = Object.keys(data);

        if (counts.length === 0) return <p className="text-gray-500 text-sm">Нет данных</p>;

        const sortedCounts = counts.sort((a, b) => parseInt(b) - parseInt(a));

        return (
            <div className="space-y-3">
                {sortedCounts.map((count) => (
                    <div key={count} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full">
                                {count} генер.
                            </span>
                            <span className="text-sm text-gray-600">
                                идей: {data[count].length}
                            </span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-1">
                            {data[count].map((title, idx) => (
                                <li key={idx} className="truncate" title={title}>
                                    {title}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Статистика</h1>
            
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Всего идей</h3>
                    <p className="text-4xl font-bold text-gray-900">{stats.total_ideas_count ?? 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Всего генераций</h3>
                    <p className="text-4xl font-bold text-gray-900">{stats.total_generations_count ?? 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">В среднем на идею</h3>
                    <p className="text-4xl font-bold text-gray-900">{(stats.average_generations_per_idea ?? 0).toFixed(2)}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        По типам генераций
                    </h3>
                    <div className="space-y-3">
                        {renderTypeDistribution()}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Активность по идеям
                    </h3>
                    <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {renderCountDistribution()}
                    </div>
                </div>
            </div>
        </div>
    );
}
