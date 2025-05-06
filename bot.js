const TelegramBot = require('node-telegram-bot-api');
const token = '7721082236:AAGC9XfzQUPGaBNraYh5vzvVKtpTou0cKoQ';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Определяем команды для меню
const commands = [
    { command: '/start', description: 'Запустить бота' },
    { command: '/help', description: 'Получить помощь' },
    { command: '/about', description: 'Узнать о боте' }
];

// Устанавливаем команды для бота
bot.setMyCommands(commands);

// Обрабатываем команду /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать! Я ваш Telegram-бот. Используйте /help для получения списка команд.');
});

// Обрабатываем команду /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
        Доступные команды:
        /start - Запустить бота
        /help - Получить помощь
        /about - Узнать о боте
    `;
    bot.sendMessage(chatId, helpMessage);
});

// Обрабатываем команду /about
bot.onText(/\/about/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Я простой Telegram-бот, созданный для демонстрации работы с API Telegram.');
});

// Обрабатываем все остальные сообщения
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text.startsWith('/')) {
        bot.sendMessage(chatId, 'Я не понимаю эту команду. Используйте /help для получения списка доступных команд.');
    }
});