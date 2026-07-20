import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getMe, updateMe, deleteMe } from '../services/userService.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function Profile() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();
                setUser(data);
                setFormData({ username: data.username, email: data.email });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateMe(formData);
            setUser(updated);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены? Это действие необратимо.')) {
            try {
                await deleteMe();
                logout();
                navigate('/');
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;
    if (!user) return <div className="text-center py-10">Ошибка загрузки профиля</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6">Профиль</h1>
            
            {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        label="Имя пользователя"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <div className="flex space-x-4">
                        <Button type="submit">Сохранить</Button>
                        <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Отмена</Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-sm text-gray-500">Имя пользователя</label>
                        <p className="text-lg font-medium">{user.username}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="text-lg font-medium">{user.email}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Дата регистрации</label>
                        <p className="text-lg font-medium">{new Date(user.registration_date).toLocaleDateString()}</p>
                    </div>
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>Редактировать</Button>
                </div>
            )}

            <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-bold text-red-600 mb-4">Опасная зона</h2>
                <Button variant="danger" onClick={handleDelete}>Удалить аккаунт</Button>
            </div>
        </div>
    );
}