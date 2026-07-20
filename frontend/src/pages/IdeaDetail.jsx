
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    getIdea, updateIdea, deleteIdea, getGenerations, createGeneration, deleteGeneration
} from '../services/ideaService.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function IdeaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [idea, setIdea] = useState(null);
    const [generations, setGenerations] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', is_favorite: false });
    const [genForm, setGenForm] = useState({ type: 'summary', prompt: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [ideaData, genData] = await Promise.all([getIdea(id), getGenerations(id)]);
            setIdea(ideaData);
            setFormData({ title: ideaData.title, content: ideaData.content, is_favorite: ideaData.is_favorite });
            
            const sortedGens = [...genData].sort((a, b) => 
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
            setGenerations(sortedGens);
        } catch (err) {
            if (err.response?.status === 422) {
                setError('Неверный формат идентификатора идеи в адресной строке.');
            } else if (err.response?.status === 404) {
                setError('Идея не найдена.');
            } else {
                setError('Ошибка загрузки данных.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateIdea(id, formData);
            setIsEditing(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Удалить эту идею?')) {
            try {
                await deleteIdea(id);
                navigate('/ideas');
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleCreateGen = async (e) => {
        e.preventDefault();
        try {
            await createGeneration(id, genForm);
            setGenForm({ type: 'summary', prompt: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteGen = async (genId) => {
        if (window.confirm('Удалить эту генерацию?')) {
            try {
                await deleteGeneration(id, genId);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;
    
    if (error) {
        return (
            <div className="text-center py-10 max-w-2xl mx-auto">
                <p className="text-red-600 text-lg mb-6 font-medium">{error}</p>
                <Button onClick={() => navigate('/ideas')}>Вернуться к списку идей</Button>
            </div>
        );
    }

    if (!idea) return <div className="text-center py-10">Идея не найдена</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold">{idea.title}</h1>
                    <div className="space-x-2">
                        <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Отмена' : 'Редактировать'}
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>Удалить</Button>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                            label="Название"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            maxLength={50}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Содержание</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="5"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.is_favorite}
                                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <label className="ml-2 text-sm text-gray-700">Избранное</label>
                        </div>
                        <Button type="submit">Сохранить</Button>
                    </form>
                ) : (
                    <div>
                        <p className="text-gray-700 whitespace-pre-wrap mb-4">{idea.content}</p>
                        {idea.is_favorite && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Избранное</span>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Генерации</h2>
                <form onSubmit={handleCreateGen} className="mb-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={genForm.type}
                            onChange={(e) => setGenForm({ ...genForm, type: e.target.value })}
                        >
                            <option value="summary">Сводка</option>
                            <option value="tags">Теги</option>
                            <option value="critique">Критика</option>
                            <option value="expand">Расширение</option>
                        </select>
                    </div>
                    <Input
                        label="Промпт"
                        value={genForm.prompt}
                        onChange={(e) => setGenForm({ ...genForm, prompt: e.target.value })}
                        required
                    />
                    <Button type="submit">Сгенерировать</Button>
                </form>

                <div className="space-y-4">
                    {generations.map((gen) => (
                        <div key={gen.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">{gen.type}</span>
                                    {gen.created_at && (
                                        <span className="text-xs text-gray-400">
                                            {new Date(gen.created_at).toLocaleString('ru-RU')}
                                        </span>
                                    )}
                                </div>
                                <Button variant="danger" className="text-xs py-1 px-2" onClick={() => handleDeleteGen(gen.id)}>Удалить</Button>
                            </div>
                            <p className="text-sm text-gray-500 mb-3 italic">Промпт: {gen.prompt}</p>
                            
                            <div className="prose prose-sm max-w-none prose-blue">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {gen.result || '_Нет результата_'}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {generations.length === 0 && <p className="text-gray-500 text-center py-4">Пока нет генераций для этой идеи.</p>}
                </div>
            </div>
        </div>
    );
}
