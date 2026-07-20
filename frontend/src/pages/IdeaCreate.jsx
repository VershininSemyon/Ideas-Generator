import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIdea } from '../services/ideaService.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function IdeaCreate() {
    const [formData, setFormData] = useState({ title: '', content: '', is_favorite: false });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createIdea(formData);
            navigate('/ideas');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Новая идея</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    label="Название"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={50}
                />
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Содержание</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="5"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id="is_favorite"
                        checked={formData.is_favorite}
                        onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_favorite" className="ml-2 block text-sm text-gray-700">Избранное</label>
                </div>
                <div className="flex space-x-4">
                    <Button type="submit">Создать</Button>
                    <Button type="button" variant="secondary" onClick={() => navigate('/ideas')}>Отмена</Button>
                </div>
            </form>
        </div>
    );
}