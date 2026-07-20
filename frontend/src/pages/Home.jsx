import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/ui/Button.jsx';

export default function Home() {
    const { user } = useAuth();

    const features = [
        {
            icon: '💡',
            title: 'Генерация идей',
            description: 'Создавайте и сохраняйте свои идеи в удобном формате с возможностью помечать избранные.',
        },
        {
            icon: '🤖',
            title: 'AI-помощник',
            description: 'Получайте сводки, теги, критику и расширения для ваших идей с помощью искусственного интеллекта.',
        },
        {
            icon: '📊',
            title: 'Аналитика',
            description: 'Отслеживайте статистику по вашим идеям и генерациям в удобном дашборде.',
        },
        {
            icon: '🔒',
            title: 'Безопасность',
            description: 'Ваши данные защищены современными методами аутентификации и шифрования.',
        },
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Генератор идей
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Превращайте свои мысли в структурированные идеи с помощью искусственного интеллекта. 
                            Создавайте, развивайте и анализируйте свои концепции.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user ? (
                                <Link to="/ideas">
                                    <Button className="text-lg px-8 py-3">
                                        Перейти к идеям
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register">
                                        <Button className="text-lg px-8 py-3">
                                            Начать бесплатно
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button variant="secondary" className="text-lg px-8 py-3">
                                            Войти
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                        Возможности платформы
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                        Как это работает
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Создайте идею
                            </h3>
                            <p className="text-gray-600">
                                Опишите свою идею в свободной форме. Добавьте название и содержание.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Получите помощь AI
                            </h3>
                            <p className="text-gray-600">
                                Используйте AI для генерации сводок, тегов, критики или расширения идеи.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Анализируйте и развивайте
                            </h3>
                            <p className="text-gray-600">
                                Отслеживайте статистику и развивайте свои идеи на основе полученных инсайтов.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-blue-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Готовы начать?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Присоединяйтесь к тысячам пользователей, которые уже используют нашу платформу для развития своих идей.
                    </p>
                    {!user && (
                        <Link to="/register">
                            <Button variant="secondary" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100">
                                Создать аккаунт
                            </Button>
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}