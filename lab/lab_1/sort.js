const fs = require('fs');
const { createCanvas } = require('canvas');

const arr = [1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000];
const results = {};
const allPoints = [];

for (const N of arr) {
    results[N] = [];
}

console.log('тесты для всех значений N из списка (1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000)\n');

for (const N of arr) {
    console.log(`=== Тест для N = ${N} ===`);

    for (let test = 1; test <= 20; test++) {
        const vectorToSort = [];
        for (let i = 0; i < N; i++) {
            vectorToSort[i] = Math.random() * 2 - 1;
        }

        const start = performance.now();
        insertionSort(vectorToSort);
        const end = performance.now();

        const timeMs = end - start;

        console.log(`Тест ${test}: ${timeMs.toFixed(3)} мс`);

        results[N].push(timeMs);
        allPoints.push({ N, time: timeMs });
    }
    console.log('');
}

// Сохраняем все результаты в CSV
let csvContent = 'N,Test,Time_ms\n';
for (const N of arr) {
    results[N].forEach((time, index) => {
        csvContent += `${N},${index + 1},${time.toFixed(3)}\n`;
    });
}
fs.writeFileSync('results.csv', csvContent);
console.log('Результаты сохранены в results.csv\n');

// Анализируем результаты
console.log('Анализ результатов:');

// Находим подходящую константу C для O(n²) (для дополнительного задания)
let maxRatio = 0;
for (const N of arr) {
    if (N >= 16000) {
        const worstTime = Math.max(...results[N]);
        const ratio = worstTime / (N * N);
        if (ratio > maxRatio) maxRatio = ratio;
    }
}
const C = maxRatio * 1.2;

console.log('\nN\tМинимальное\tМаксимальное\tСреднее');
console.log('-'.repeat(60));

const theoreticalData = [];
const minData = [];
const maxData = [];
const avgData = [];

for (const N of arr) {
    const times = results[N];
    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;

    minData.push({ N, time: min });
    maxData.push({ N, time: max });
    avgData.push({ N, time: avg });

    // Для дополнительного задания
    theoreticalData.push({ N, time: C * N * N });

    console.log(`${N}\t${min.toFixed(3)} мс\t\t${max.toFixed(3)} мс\t\t${avg.toFixed(3)} мс`);
}

console.log(`\nДля дополнительного задания: C = ${C.toExponential(4)}`);

// СОЗДАЕМ ПЕРВЫЙ ГРАФИК (основное задание)
const width = 1200;
const height = 800;
const canvas1 = createCanvas(width, height);
const ctx1 = canvas1.getContext('2d');

const padding = { left: 100, right: 50, top: 50, bottom: 80 };
const graphWidth = width - padding.left - padding.right;
const graphHeight = height - padding.top - padding.bottom;

// Белый фон
ctx1.fillStyle = '#ffffff';
ctx1.fillRect(0, 0, width, height);

// Заголовок
ctx1.font = 'bold 24px Arial';
ctx1.fillStyle = '#000000';
ctx1.textAlign = 'center';
ctx1.fillText('Сортировка вставками - все точки замеров', width / 2, 30);

// Находим максимальное значение для масштабирования
const maxY = Math.max(...allPoints.map(p => p.time)) * 1.1;

// Рисуем оси
ctx1.strokeStyle = '#000000';
ctx1.lineWidth = 2;
ctx1.beginPath();
ctx1.moveTo(padding.left, padding.top);
ctx1.lineTo(padding.left, height - padding.bottom);
ctx1.lineTo(width - padding.right, height - padding.bottom);
ctx1.stroke();

// Подписи осей
ctx1.font = '16px Arial';
ctx1.fillStyle = '#000000';
ctx1.textAlign = 'center';
ctx1.fillText('Размер массива (N)', width / 2, height - 20);

ctx1.save();
ctx1.translate(20, height / 2);
ctx1.rotate(-Math.PI / 2);
ctx1.fillText('Время сортировки (мс)', 0, 0);
ctx1.restore();

// Деления на оси X
const xStep = graphWidth / (arr.length - 1);
for (let i = 0; i < arr.length; i++) {
    const x = padding.left + (i * xStep);
    const N = arr[i];

    ctx1.beginPath();
    ctx1.moveTo(x, height - padding.bottom);
    ctx1.lineTo(x, height - padding.bottom + 10);
    ctx1.stroke();

    ctx1.font = '12px Arial';
    ctx1.fillStyle = '#666666';
    ctx1.textAlign = 'center';
    ctx1.fillText(N.toString(), x, height - padding.bottom + 25);
}

// Деления на оси Y
const yStep = graphHeight / 5;
for (let i = 0; i <= 5; i++) {
    const y = height - padding.bottom - (i * yStep);
    const value = (i * maxY / 5).toFixed(2);

    ctx1.beginPath();
    ctx1.moveTo(padding.left - 10, y);
    ctx1.lineTo(padding.left, y);
    ctx1.stroke();

    ctx1.font = '12px Arial';
    ctx1.fillStyle = '#666666';
    ctx1.textAlign = 'right';
    ctx1.fillText(value + ' мс', padding.left - 15, y + 4);
}

// Рисуем ВСЕ ТОЧКИ (полупрозрачные)
ctx1.fillStyle = '#999999';
ctx1.globalAlpha = 0.3;
for (const point of allPoints) {
    const xIndex = arr.indexOf(point.N);
    const x = padding.left + (xIndex * xStep);
    const y = height - padding.bottom - (point.time / maxY * graphHeight);

    ctx1.beginPath();
    ctx1.arc(x, y, 3, 0, 2 * Math.PI);
    ctx1.fill();
}
ctx1.globalAlpha = 1.0;

// Функция для рисования линии
function drawLine(ctx, data, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    for (let i = 0; i < data.length; i++) {
        const x = padding.left + (i * xStep);
        const y = height - padding.bottom - (data[i].time / maxY * graphHeight);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Рисуем точки
    ctx.fillStyle = color;
    for (let i = 0; i < data.length; i++) {
        const x = padding.left + (i * xStep);
        const y = height - padding.bottom - (data[i].time / maxY * graphHeight);

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Рисуем три кривые
drawLine(ctx1, minData, '#28a72e');
drawLine(ctx1, maxData, '#4d1016');
drawLine(ctx1, avgData, '#ee59ee');

// Легенда для первого графика
const legendItems1 = [
    { color: '#28a72e', text: 'Лучший случай (минимумы)' },
    { color: '#4d1016', text: 'Худший случай (максимумы)' },
    { color: '#ee59ee', text: 'Средний случай' },
    { color: '#999999', text: 'Все точки замеров (20 для каждого N)' }
];

let legendY = padding.top + 20;
ctx1.font = '14px Arial';
ctx1.textAlign = 'left';
ctx1.fillStyle = '#333333';

for (const item of legendItems1) {
    ctx1.fillStyle = item.color;
    ctx1.fillRect(padding.left + 10, legendY - 8, 20, 12);
    ctx1.fillStyle = '#333333';
    ctx1.fillText(item.text, padding.left + 40, legendY);
    legendY += 25;
}

// Сохраняем первый график
const buffer1 = canvas1.toBuffer('image/png');
fs.writeFileSync('chart_all_points.png', buffer1);
console.log('первый график сохранен ');

// второй график
const canvas2 = createCanvas(width, height);
const ctx2 = canvas2.getContext('2d');

ctx2.fillStyle = '#ffffff';
ctx2.fillRect(0, 0, width, height);

// Заголовок
ctx2.font = 'bold 24px Arial';
ctx2.fillStyle = '#000000';
ctx2.textAlign = 'center';
ctx2.fillText('Сравнение худшего случая с O(n²)', width / 2, 30);

// Рисуем оси (аналогично первому графику)
ctx2.strokeStyle = '#000000';
ctx2.lineWidth = 2;
ctx2.beginPath();
ctx2.moveTo(padding.left, padding.top);
ctx2.lineTo(padding.left, height - padding.bottom);
ctx2.lineTo(width - padding.right, height - padding.bottom);
ctx2.stroke();

ctx2.font = '16px Arial';
ctx2.fillStyle = '#000000';
ctx2.textAlign = 'center';
ctx2.fillText('Размер массива (N)', width / 2, height - 20);

ctx2.save();
ctx2.translate(20, height / 2);
ctx2.rotate(-Math.PI / 2);
ctx2.fillText('Время сортировки (мс)', 0, 0);
ctx2.restore();

// Деления на оси X
for (let i = 0; i < arr.length; i++) {
    const x = padding.left + (i * xStep);
    const N = arr[i];

    ctx2.beginPath();
    ctx2.moveTo(x, height - padding.bottom);
    ctx2.lineTo(x, height - padding.bottom + 10);
    ctx2.stroke();

    ctx2.font = '12px Arial';
    ctx2.fillStyle = '#666666';
    ctx2.textAlign = 'center';
    ctx2.fillText(N.toString(), x, height - padding.bottom + 25);
}

// Деления на оси Y
for (let i = 0; i <= 5; i++) {
    const y = height - padding.bottom - (i * yStep);
    const value = (i * maxY / 5).toFixed(2);

    ctx2.beginPath();
    ctx2.moveTo(padding.left - 10, y);
    ctx2.lineTo(padding.left, y);
    ctx2.stroke();

    ctx2.font = '12px Arial';
    ctx2.fillStyle = '#666666';
    ctx2.textAlign = 'right';
    ctx2.fillText(value + ' мс', padding.left - 15, y + 4);
}

//худший случай
drawLine(ctx2, maxData, '#dc3545');

// O(n²)
drawLine(ctx2, theoreticalData, '#45ff07');

// Легенда для второго графика
const legendItems2 = [
    { color: '#dc3545', text: 'Худший случай (фактические замеры)' },
    { color: '#45ff07', text: `O(n²) с C = ${C.toExponential(3)}` }
];

legendY = padding.top + 20;
ctx2.font = '14px Arial';
ctx2.textAlign = 'left';
ctx2.fillStyle = '#000000';

for (const item of legendItems2) {
    ctx2.fillStyle = item.color;
    ctx2.fillRect(padding.left + 10, legendY - 8, 20, 12);
    ctx2.fillStyle = '#000000';
    ctx2.fillText(item.text, padding.left + 40, legendY);
    legendY += 25;
}

// Сохраняем второй график
const buffer2 = canvas2.toBuffer('image/png');
fs.writeFileSync('chart_worst_vs_obig.png', buffer2);

function insertionSort(a) {
    const n = a.length;
    for (let i = 1; i < n; i++) {
        let j = i - 1;
        while (j >= 0 && a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            j--;
        }
    }
    return a;
}

console.log('results.csv - все результаты замеров');
console.log('chart_all_points.png - все точки');
console.log('chart_worst_vs_obig.png - худший случай / O(n²)');