const TelegramBot = require('node-telegram-bot-api');
const token = '7721082236:AAGC9XfzQUPGaBNraYh5vzvVKtpTou0cKoQ';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Приветствие при запуске бота
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, октагон!');
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
Список доступных команд:
1. /help - возвращает список команд с их описанием.
2. /site - отправляет ссылку на сайт октагона.
3. /creator - отправляет ваше ФИО.
`;
    bot.sendMessage(chatId, helpMessage);
});

// Команда /site
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Сайт октагона: https://octagon-students.ru/');
});

// Команда /creator
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Мое ФИО: Чокмоева Таттыгул');
});

// Обработка ошибок
bot.on("polling_error", (error) => {
    console.error("Ошибка при получении обновлений:", error.message);
});