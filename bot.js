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

const qrcode = require('qrcode');
const puppeteer = require('puppeteer');

// Команда !qr
bot.onText(/!qr (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const inputText = match[1];

    qrcode.toDataURL(inputText, (err, url) => {
        if (err) {
            bot.sendMessage(chatId, '❌ Ошибка при генерации QR-кода.');
        } else {
            const imageBuffer = Buffer.from(url.split(",")[1], 'base64');
            bot.sendPhoto(chatId, imageBuffer, { caption: 'Ваш QR-код:' });
        }
    });
});

// Команда !webscr
bot.onText(/!webscr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const websiteUrl = match[1];

    if (!websiteUrl.startsWith('http')) {
        bot.sendMessage(chatId, '❌ Укажи корректный URL, начинающийся с http или https.');
        return;
    }

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(websiteUrl, { waitUntil: 'networkidle2' });
        const screenshot = await page.screenshot();
        await browser.close();

        bot.sendPhoto(chatId, screenshot, { caption: 'Скриншот сайта' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Не удалось сделать скриншот. Возможно, сайт недоступен.');
    }
});

// Обработка ошибок
bot.on("polling_error", (error) => {
    console.error("Ошибка при получении обновлений:", error.message);
});