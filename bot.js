const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');
const qrcode = require('qrcode');
const puppeteer = require('puppeteer');
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/dynamic');

const token = '7721082236:AAGC9XfzQUPGaBNraYh5vzvVKtpTou0cKoQ';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Создаем подключение к базе данных
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ChatBotTests'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database!');
});

// Функция обновления последнего сообщения пользователя в базе
function updateUserLastMessage(userId) {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const sql = `
    INSERT INTO users (ID, lastMessage) VALUES (?, ?)
    ON DUPLICATE KEY UPDATE lastMessage = VALUES(lastMessage)
  `;
  connection.query(sql, [userId, today], (err) => {
    if (err) console.error('Ошибка при записи в БД:', err);
  });
}

// Команды бота (приветствие, /help, /site и прочее) - можно вставить твой существующий код сюда...

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, октагон!');
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
Список доступных команд:
1. /help - возвращает список команд с их описанием.
2. /site - отправляет ссылку на сайт октагона.
3. /creator - отправляет ваше ФИО.
4. /randomItem - возвращает случайный предмет из базы.
5. /deleteItem [id] - удаляет предмет по ID.
6. /getItemByID [id] - возвращает предмет по ID.
7. !qr [текст или ссылка] - генерирует QR-код.
8. !webscr [URL] - делает скриншот сайта.
`;
  bot.sendMessage(chatId, helpMessage);
});

// Пример команды /randomItem (добавь остальные из своего кода)
bot.onText(/\/randomItem/, (msg) => {
  const chatId = msg.chat.id;
  connection.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1', (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при обращении к базе данных.');
      console.error(err);
      return;
    }
    if (results.length === 0) {
      bot.sendMessage(chatId, 'В базе данных нет предметов.');
      return;
    }
    const item = results[0];
    bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
  });
});

// Обработка всех сообщений: обновляем дату последнего сообщения
bot.on('message', (msg) => {
  const userId = msg.from.id;
  updateUserLastMessage(userId);
});

// --- Функция проверки и отправки сообщения неактивным пользователям ---

async function checkInactiveUsersAndSend() {
  console.log('Запущена проверка неактивных пользователей...');
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Выбираем пользователей, у которых lastMessage <= twoDaysAgo
  const sqlUsers = `SELECT ID FROM users WHERE lastMessage <= ?`;
  connection.query(sqlUsers, [twoDaysAgo], (err, users) => {
    if (err) {
      console.error('Ошибка при выборке пользователей:', err);
      return;
    }

    if (users.length === 0) {
      console.log('Нет неактивных пользователей для отправки сообщений.');
      return;
    }

    console.log(`Найдено ${users.length} неактивных пользователей.`);

    users.forEach(user => {
      // Берем случайный предмет
      connection.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1', (err, results) => {
        if (err) {
          console.error('Ошибка при выборке предмета:', err);
          return;
        }
        if (results.length === 0) {
          console.log('В базе нет предметов для отправки.');
          return;
        }
        const item = results[0];

        // Отправляем сообщение пользователю
        bot.sendMessage(user.ID, `Привет! Ты давно не писал. Вот случайный предмет для тебя:\n(${item.id}) - ${item.name}: ${item.desc}`)
          .then(() => {
            console.log(`Сообщение отправлено пользователю ${user.ID} с предметом "${item.name}"`);

            // Обновляем lastSentItem в базе
            const sqlUpdate = `UPDATE users SET lastSentItem = ? WHERE ID = ?`;
            connection.query(sqlUpdate, [item.name, user.ID], (err) => {
              if (err) console.error('Ошибка при обновлении lastSentItem:', err);
            });
          })
          .catch(err => {
            console.error(`Не удалось отправить сообщение пользователю ${user.ID}:`, err);
          });
      });
    });
  });
}

// --- Запуск таймера, который проверяет каждый день в 13:00 по Москве ---

function getMsToNext13MSK() {
  const now = new Date();

  // Переводим текущее время в московское
  const mskOffset = 3 * 60; // Москва +3 часа от UTC в минутах
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const mskTime = new Date(utc + mskOffset * 60000);

  let next13 = new Date(mskTime);
  next13.setHours(13, 0, 0, 0);

  if (mskTime >= next13) {
    next13.setDate(next13.getDate() + 1);
  }

  return next13.getTime() - mskTime.getTime();
}

function startDailyTimer() {
  const msToFirstRun = getMsToNext13MSK();
  console.log(`Таймер запущен: первый запуск через ${Math.round(msToFirstRun / 1000 / 60)} минут`);

  setTimeout(() => {
    checkInactiveUsersAndSend();

    // Далее запускаем интервал 24 часа
    setInterval(() => {
      checkInactiveUsersAndSend();
    }, 24 * 60 * 60 * 1000);

  }, msToFirstRun);
}

startDailyTimer();

// --- Обработка ошибок polling ---
bot.on("polling_error", (error) => {
  console.error("Ошибка при получении обновлений:", error.message);
});

checkInactiveUsersAndSend();
