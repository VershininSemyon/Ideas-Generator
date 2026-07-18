
from gigachat import GigaChat

from config.settings import settings


class LlmApiClient:
    def __init__(
        self,
        api_key: str,
        model: str = "GigaChat"
    ):
        self._model = model
        self._api_key = api_key

        self._client = GigaChat(
            credentials=self._api_key,
            scope="GIGACHAT_API_PERS",
            verify_ssl_certs=False
        )

    @property
    def model(self) -> str:
        return self._model

    @property
    def api_key(self) -> str:
        return self._api_key

    def produce_prompt(
        self,
        idea_title: str,
        idea_content: str,
        answer_type: str,
        user_prompt: str
    ) -> str:
        instructions = {
            "summary": (
                "Сделай краткую выжимку (summary) этой идеи. Выдели суть, основную проблему "
                "и предлагаемое решение. Пиши лаконично, структурированно, используя списки."
            ),
            "tags": (
                "Сгенерируй список релевантных тегов (ключевых слов) для этой идеи. "
                "Верни результат строго в виде строки с тегами через запятую (например: ИИ, Стартап, Автоматизация). "
                "Не добавляй лишнего текста."
            ),
            "critique": (
                "Проведи конструктивную критику идеи. Укажи на потенциальные слабые места, "
                "риски при реализации, скрытые сложности и барьеры. Предложи 2-3 вектора для улучшения."
            ),
            "expand": (
                "Разверни и детализируй эту идею. Распиши возможные шаги реализации, "
                "целевую аудиторию, потенциальные фичи и масштабирование проекта."
            )
        }

        task_instruction = instructions.get(
            answer_type.lower(),
            "Проанализируй идею и ответь в соответствии с контекстом."
        )

        user_modifier = f"\nДополнительное пожелание пользователя: {user_prompt}" if user_prompt.strip() else ""

        prompt = f"""Ты — профессиональный ассистент по анализу и развитию стартап-идей.
            Твоя задача — обработать сырую идею пользователя в соответствии с заданным типом действия.

            [ТИП ДЕЙСТВИЯ]
            {task_instruction}{user_modifier}

            [ДАННЫЕ ИДЕИ]
            Название идеи: {idea_title}
            Описание идеи: {idea_content}

            [ТРЕБОВАНИЯ К ОТВЕТУ]
            1. Отвечай строго на языке предоставленной идеи (по умолчанию на русском).
            2. Будь объективен, избегай "воды" и общих фраз.
            3. Форматируй текст с помощью Markdown (списки, жирный шрифт), если это уместно для этого типа действия.
            4. Выдавай только результат выполнения задачи, без лишних вступлений вроде "Вот твой ответ:".
        """
        return prompt

    def send_request_to_llm(self, prompt: str) -> str:
        response = self._client.chat(prompt)
        return response.choices[0].message.content


llm_client = LlmApiClient(settings.LLM_API_KEY)
