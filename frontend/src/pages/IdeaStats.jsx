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
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-10">Загрузка...</div>;
    if (!stats) return <div className="text-center py-10">Ошибка загрузки статистики</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Статистика</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Всего идей</h3>
                    <p className="text-4xl font-bold text-blue-600">{stats.total_ideas_count}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Всего генераций</h3>
                    <p className="text-4xl font-bold text-green-600">{stats.total_generations_count}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Среднее генераций на идею</h3>
                    <p className="text-4xl font-bold text-purple-600">{stats.average_generations_per_idea.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Распределение по типам генераций</h3>
                    <div className="space-y-2">
                        {Object.entries(stats.generation_type_distribution || {}).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="capitalize font-medium">{type}</span>
                                <span className="font-semibold text-gray-600">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}