import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getIdeas, deleteIdea } from '../services/ideaService.js';
import Button from '../components/ui/Button.jsx';

export default function Ideas() {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchIdeas = async () => {
        try {
            const data = await getIdeas();
            setIdeas(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIdeas();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Удалить эту идею?')) {
            try {
                await deleteIdea(id);
                fetchIdeas();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Мои идеи</h1>
                <Link to="/ideas/new">
                    <Button>Создать идею</Button>
                </Link>
            </div>
            {ideas.length === 0 ? (
                <p className="text-gray-600">У вас пока нет идей.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {ideas.map((idea) => (
                        <div key={idea.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                            <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{idea.content}</p>
                            <div className="flex justify-between items-center mt-auto">
                                <Link to={`/ideas/${idea.id}`}>
                                    <Button variant="secondary">Подробнее</Button>
                                </Link>
                                <Button variant="danger" onClick={() => handleDelete(idea.id)}>Удалить</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}