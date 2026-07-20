import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { login as loginService } from '../services/authService.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/ideas';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginService(formData);
            await login();
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Вход в систему</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    label="Имя пользователя"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />
                <Input
                    label="Пароль"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <Button type="submit" className="w-full mt-4">Войти</Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
                Нет аккаунта? <Link to="/register" className="text-blue-600 hover:underline">Зарегистрироваться</Link>
            </p>
        </div>
    );
}