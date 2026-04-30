const crypto = require('crypto');
const fs = require('fs');
const { createCanvas } = require('canvas');

// ======================== SHA-256 ========================

/**
 * Вычисление хеша SHA-256 для входных данных
 * Реализует алгоритм SHA-2 с выходом 256 бит (64 hex-символа)
 * Обладает свойствами: детерминированность, лавинный эффект, криптостойкость
 * Сложность: O(n) где n - длина входных данных
 * @param {string} data - Входные данные произвольной длины
 * @returns {string} Хеш в виде hex-строки (64 символа)
 */
function sha256(data) {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

// ======================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ========================

/**
 * Генерация случайной строки заданной длины
 * Используется для создания тестовых данных
 * Сложность: O(n)
 * @param {number} length - Длина генерируемой строки
 * @returns {string} Случайная строка из латинских букв и цифр
 */
function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Создание мутированной копии строки с изменением заданного количества символов
 * Используется для проверки лавинного эффекта хеш-функции
 * Сложность: O(n)
 * @param {string} original - Исходная строка
 * @param {number} diffCount - Количество символов для изменения (1,2,4,8,16)
 * @returns {string} Строка с измененными символами
 */
function mutateString(original, diffCount) {
    let arr = original.split('');
    const indices = new Set();
    while (indices.size < diffCount && indices.size < arr.length) {
        indices.add(Math.floor(Math.random() * arr.length));
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let idx of indices) {
        let newChar;
        do {
            newChar = chars.charAt(Math.floor(Math.random() * chars.length));
        } while (newChar === arr[idx]);
        arr[idx] = newChar;
    }
    return arr.join('');
}

/**
 * Поиск максимальной длины общей непрерывной подстроки между двумя строками
 * Используется для сравнения хешей и оценки лавинного эффекта
 * Сложность: O(n*m) где n,m - длины строк
 * @param {string} str1 - Первая строка
 * @param {string} str2 - Вторая строка
 * @returns {number} Максимальная длина одинаковой подстроки
 */
function longestCommonSubstring(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    let maxLen = 0;
    const dp = new Array(len2 + 1).fill(0);

    for (let i = 1; i <= len1; i++) {
        let prev = 0;
        for (let j = 1; j <= len2; j++) {
            const temp = dp[j];
            if (str1[i - 1] === str2[j - 1]) {
                dp[j] = prev + 1;
                if (dp[j] > maxLen) maxLen = dp[j];
            } else {
                dp[j] = 0;
            }
            prev = temp;
        }
    }
    return maxLen;
}

/**
 * Форматирование времени в удобочитаемый вид
 * @param {number} ns - Время в наносекундах
 * @returns {string} Отформатированная строка времени
 */
function formatTime(ns) {
    if (ns < 1000) return `${ns.toFixed(0)} нс`;
    if (ns < 1000000) return `${(ns / 1000).toFixed(2)} мкс`;
    return `${(ns / 1000000).toFixed(2)} мс`;
}

// ======================== ПОСТРОЕНИЕ ГРАФИКОВ ========================

/**
 * Построение графика для теста 1
 * Отображает зависимость максимальной длины общей подстроки от количества отличающихся символов
 * Ось X: количество отличающихся символов (1,2,4,8,16)
 * Ось Y: максимальная длина одинаковой последовательности
 * @param {Object} data - Объект с данными {diffCount: maxLength}
 * @param {string} filename - Имя выходного файла
 */
function plotTest1Graph(data, filename) {
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const y = 80 + (height - 130) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(width - 60, y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(80, height - 60);
    ctx.lineTo(width - 60, height - 60);
    ctx.stroke();

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('Количество отличающихся символов', width / 2 - 180, height - 25);
    ctx.save();
    ctx.translate(35, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Максимальная длина одинаковой последовательности', -20, 0);
    ctx.restore();

    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#2C3E50';
    ctx.fillText('Тест 1', width / 2 - 50, 45);

    const diffValues = Object.keys(data).map(Number).sort((a, b) => a - b);
    const maxY = Math.max(...Object.values(data)) * 1.15;

    const xScale = (width - 140) / (diffValues[diffValues.length - 1] - diffValues[0]);
    const yScale = (height - 140) / maxY;

    ctx.beginPath();
    let first = true;
    for (let diff of diffValues) {
        const x = 80 + (diff - diffValues[0]) * xScale;
        const y = height - 60 - data[diff] * yScale;
        if (first) {
            ctx.moveTo(x, y);
            first = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let diff of diffValues) {
        const x = 80 + (diff - diffValues[0]) * xScale;
        const y = height - 60 - data[diff] * yScale;
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = '12px Arial';
        ctx.fillStyle = '#555555';
        ctx.fillText(data[diff].toString(), x + 10, y - 8);
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
}

/**
 * Построение графика для теста 3
 * Отображает зависимость скорости хеширования от размера входных данных
 * Ось X: размер входных данных (байт)
 * Ось Y: скорость хеширования (MB/s)
 * @param {Array} data - Массив объектов с полями length и speedMBps
 * @param {string} filename - Имя выходного файла
 */
function plotTest3Graph(data, filename) {
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const y = 80 + (height - 130) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(width - 60, y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(80, height - 60);
    ctx.lineTo(width - 60, height - 60);
    ctx.stroke();

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('Размер входных данных (байт)', width / 2 - 160, height - 25);
    ctx.save();
    ctx.translate(35, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Скорость хеширования (MB/s)', -20, 0);
    ctx.restore();

    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#2C3E50';
    ctx.fillText('Тест 3: Зависимость скорости SHA-256 от размера данных', width / 2 - 280, 45);

    const lengths = data.map(d => d.length);
    const speeds = data.map(d => d.speedMBps);
    const maxY = Math.max(...speeds) * 1.15;

    const xScale = (width - 140) / (lengths[lengths.length - 1] - lengths[0]);
    const yScale = (height - 140) / maxY;

    ctx.beginPath();
    let first = true;
    for (let i = 0; i < lengths.length; i++) {
        const x = 80 + (lengths[i] - lengths[0]) * xScale;
        const y = height - 60 - speeds[i] * yScale;
        if (first) {
            ctx.moveTo(x, y);
            first = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = '#27AE60';
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let i = 0; i < lengths.length; i++) {
        const x = 80 + (lengths[i] - lengths[0]) * xScale;
        const y = height - 60 - speeds[i] * yScale;
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = '10px Arial';
        ctx.fillStyle = '#555555';
        ctx.fillText(`${speeds[i].toFixed(2)} MB/s`, x + 8, y - 8);
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
}

// ======================== ТЕСТ 1 ========================

/**
 * Тест 1: Проверка лавинного эффекта хеш-функции
 * Генерирует 1000 пар строк длиной 128 символов, отличающихся на 1,2,4,8,16 символов
 * Для каждой пары сравнивает хеши и находит максимальную длину общей подстроки
 * Результаты сохраняются в CSV и график PNG
 * Сложность: O(pairCount * diffCount * n^2) где n - длина хеша
 * @returns {Object} Результаты теста {diffCount: maxCommonSubstringLength}
 */
function test1() {
    const strLength = 128;
    const pairCount = 1000;
    const diffValues = [1, 2, 4, 8, 16];
    const results = {};

    for (let diff of diffValues) {
        let maxLenOverall = 0;
        console.log(`\nОтличий: ${diff} симв. (${pairCount} пар)...`);

        for (let i = 0; i < pairCount; i++) {
            const original = randomString(strLength);
            const mutated = mutateString(original, diff);
            const hashOrig = sha256(original);
            const hashMut = sha256(mutated);
            const commonLen = longestCommonSubstring(hashOrig, hashMut);
            if (commonLen > maxLenOverall) maxLenOverall = commonLen;
        }
        results[diff] = maxLenOverall;
        console.log(`Прогресс: ${pairCount}/${pairCount} пар`);
        console.log(`Макс. длина общей подстроки: ${maxLenOverall} симв.`);
    }

    const csvLines = ['diff_count,max_common_substr_len'];
    for (let diff of diffValues) {
        csvLines.push(`${diff},${results[diff]}`);
    }
    fs.writeFileSync('test1_results.csv', csvLines.join('\n'));

    plotTest1Graph(results, 'test1_graph.png');

    return results;
}

// ======================== ТЕСТ 2 ========================

/**
 * Тест 2: Поиск коллизий хеш-функции
 * Генерирует N = 10^i (i=2..6) случайных строк длиной 256 символов
 * Вычисляет хеши и ищет одинаковые (коллизии)
 * Результаты выводятся в таблицу и сохраняются в CSV
 * Сложность: O(N) по времени, O(N) по памяти
 * @returns {Array} Таблица результатов {N, collisionGroups, totalDuplicateHashes}
 */
function test2() {
    const strLength = 256;
    const exponents = [2, 3, 4, 5, 6];
    const table = [];

    for (let exp of exponents) {
        const N = Math.pow(10, exp);
        const hashes = new Map();
        console.log(`\nГенерация ${N} хешей...`);

        for (let i = 0; i < N; i++) {
            const str = randomString(strLength);
            const hash = sha256(str);
            hashes.set(hash, (hashes.get(hash) || 0) + 1);
        }
        console.log(`Прогресс: ${N}/${N}`);

        let collisionGroups = 0;
        let totalDuplicateHashes = 0;

        for (let count of hashes.values()) {
            if (count > 1) {
                collisionGroups++;
                totalDuplicateHashes += (count - 1);
            }
        }

        table.push({ N, collisionGroups, totalDuplicateHashes });

        if (collisionGroups === 0) {
            console.log(`Коллизий: нет`);
        } else {
            console.log(`Коллизий: да (${collisionGroups} групп, ${totalDuplicateHashes} шт)`);
        }
    }

    console.log("\nРезультаты теста 2:");
    console.log("-".repeat(50));
    console.log(`| ${"N генераций".padEnd(12)} | ${"Наличие и кол-во одинаковых хешей".padEnd(30)} |`);
    console.log("-".repeat(50));
    for (let row of table) {
        let result;
        if (row.collisionGroups === 0) {
            result = "нет коллизий";
        } else {
            result = `да (${row.collisionGroups} групп, ${row.totalDuplicateHashes} шт)`;
        }
        console.log(`| ${String(row.N).padEnd(12)} | ${result.padEnd(30)} |`);
    }
    console.log("-".repeat(50));

    const csvLines = ['N,collision_groups,total_duplicates'];
    for (let row of table) {
        csvLines.push(`${row.N},${row.collisionGroups},${row.totalDuplicateHashes}`);
    }
    fs.writeFileSync('test2_results.csv', csvLines.join('\n'));

    return table;
}

// ======================== ТЕСТ 3 ========================

/**
 * Тест 3: Измерение производительности хеш-функции
 * Для каждой длины строки (64,128,256,512,1024,2048,4096,8192) выполняет 1000 хеширований
 * Подсчитывает среднее время и скорость (MB/s)
 * Результаты сохраняются в CSV и график PNG
 * Сложность: O(iterations * n) где n - длина строки
 * @returns {Array} Результаты теста {length, avgTimeMs, avgTimeNs, speedMBps}
 */
function test3() {
    const lengths = [64, 128, 256, 512, 1024, 2048, 4096, 8192];
    const iterations = 1000;
    const results = [];

    console.log(`\n${iterations} итераций для каждой длины...\n`);

    for (let len of lengths) {
        const times = [];
        console.log(`Длина ${len} байт:`);

        for (let i = 0; i < iterations; i++) {
            const str = randomString(len);
            const start = process.hrtime.bigint();
            sha256(str);
            const end = process.hrtime.bigint();
            times.push(Number(end - start));
        }
        console.log(`Прогресс: ${iterations}/${iterations} итераций`);

        const avgNs = times.reduce((a, b) => a + b, 0) / iterations;
        const avgMs = avgNs / 1e6;
        const speedMBps = len / (avgNs / 1e9) / (1024 * 1024);

        results.push({
            length: len,
            avgTimeMs: avgMs,
            avgTimeNs: avgNs,
            speedMBps: speedMBps
        });

        console.log(`Среднее время: ${avgMs.toFixed(4)} мс (${formatTime(avgNs)})`);
        console.log(`Скорость: ${speedMBps.toFixed(2)} MB/s\n`);
    }

    console.log("Таблица результатов теста 3:");
    console.log("-".repeat(80));
    console.log(`| ${"Длина (байт)".padEnd(12)} | ${"Ср. время (мс)".padEnd(14)} | ${"Скорость (MB/s)".padEnd(15)} |`);
    console.log("-".repeat(80));

    for (let r of results) {
        console.log(`| ${String(r.length).padEnd(12)} | ${r.avgTimeMs.toFixed(6).padEnd(14)} | ${r.speedMBps.toFixed(2).padEnd(15)} |`);
    }
    console.log("-".repeat(80));

    const csvLines = ['length_bytes,avg_time_ns,avg_time_ms,speed_mb_per_sec'];
    for (let r of results) {
        csvLines.push(`${r.length},${r.avgTimeNs.toFixed(0)},${r.avgTimeMs.toFixed(6)},${r.speedMBps.toFixed(2)}`);
    }
    fs.writeFileSync('test3_results.csv', csvLines.join('\n'));

    plotTest3Graph(results, 'test3_graph.png');

    return results;
}

// ======================== ЗАПУСК ========================

/**
 * Главная функция запуска всех тестов лабораторной работы
 * Последовательно выполняет тесты 1, 2 и 3
 * Проверяет наличие необходимых зависимостей (canvas)
 * Выводит информацию о созданных файлах
 */
async function runAllTests() {
    console.log("ЛАБОРАТОРНАЯ РАБОТА: SHA-256");
    console.log("=".repeat(50));
    require.resolve('canvas');
    test1();
    await test2();
    test3();

    console.log("\n" + "=".repeat(50));
    console.log("Все тесты завершены");
    console.log("\nСозданные файлы:");
    console.log("   test1_results.csv, test1_graph.png");
    console.log("   test2_results.csv");
    console.log("   test3_results.csv, test3_graph.png");
}

runAllTests();