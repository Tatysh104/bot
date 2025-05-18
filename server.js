// server.js
const express = require('express');
const db = require('./db'); // Импортируем соединение с базой данных

const app = express();
const PORT = 3000;

// Простой маршрут для проверки работы сервера
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Пример маршрута для получения данных из базы данных
app.get('/data', (req, res) => {
    db.query('SELECT * FROM your_table_name', (err, results) => { // Замените your_table_name на имя вашей таблицы
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Путь для получения случайного элемента
app.get('/randomItem', (req, res) => {
    db.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.json({});
        const item = results[0];
        res.send(`(${item.id}) - ${item.name}: ${item.desc}`);
    });
});

// Путь для удаления элемента с сообщением
app.post('/deleteItem', (req, res) => {
    const { id } = req.query;
    if (!id) return res.json(null);

    db.query('DELETE FROM Items WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.affectedRows === 0) {
            res.send("Ошибка: предмет с таким ID не найден");
        } else {
            res.send("Удачно: предмет удалён");
        }
    });
});

// Путь для получения элемента по ID
app.get('/getItemByID', (req, res) => {
    const { id } = req.query;
    if (!id) return res.json(null);

    db.query('SELECT * FROM Items WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0) {
            res.send("{}");
        } else {
            const item = results[0];
            res.send(`(${item.id}) - ${item.name}: ${item.desc}`);
        }
    });
});
