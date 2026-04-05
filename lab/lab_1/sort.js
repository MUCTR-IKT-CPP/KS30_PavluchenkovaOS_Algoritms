// /*
//  * Сортировка вставками (Insertion Sort)
//  *
//  * Реализация алгоритма сортировки вставками с анализом производительности.
//  * Программа выполняет серию тестов для различных размеров массива,
//  * собирает статистику времени выполнения и строит графики для визуализации результатов.
//  *
//  * @module insertion-sort-analysis
//  */
//
// const fs = require('fs');
// const { createCanvas } = require('canvas');
//
// /**
//  * Массив размеров тестируемых массивов.
//  * @constant {number[]}
//  */
// const arr = [1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000];
//
// /**
//  * Объект для хранения результатов замеров по каждому размеру N.
//  * Ключ - размер массива, значение - массив времен выполнения (20 замеров).
//  * @type {Object.<number, number[]>}
//  */
// const results = {};
//
// /**
//  * Массив всех точек замеров для общего графика.
//  * @type {Array<{N: number, time: number}>}
//  */
// const allPoints = [];
//
// // Инициализация массива результатов для каждого N
// for (const N of arr) {
//     results[N] = [];
// }
//
// console.log('тесты для всех значений N из списка (1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000)\n');
//
// // Основной цикл тестирования
// for (const N of arr) {
//     console.log(`=== Тест для N = ${N} ===`);
//
//     // Выполняем 20 тестов для каждого размера массива
//     for (let test = 1; test <= 20; test++) {
//         /**
//          * Генерируем случайный массив указанного размера
//          * со значениями в диапазоне [-1, 1]
//          */
//         const vectorToSort = [];
//         for (let i = 0; i < N; i++) {
//             vectorToSort[i] = Math.random() * 2 - 1;
//         }
//
//         // Замеряем время сортировки
//         const start = performance.now();
//         insertionSort(vectorToSort);
//         const end = performance.now();
//
//         const timeMs = end - start;
//
//         console.log(`Тест ${test}: ${timeMs.toFixed(3)} мс`);
//
//         // Сохраняем результаты
//         results[N].push(timeMs);
//         allPoints.push({ N, time: timeMs });
//     }
//     console.log('');
// }
//
// /**
//  * Сохраняем все результаты в CSV файл для дальнейшего анализа.
//  * Формат: N, Test, Time_ms
//  */
// let csvContent = 'N,Test,Time_ms\n';
// for (const N of arr) {
//     results[N].forEach((time, index) => {
//         csvContent += `${N},${index + 1},${time.toFixed(3)}\n`;
//     });
// }
// fs.writeFileSync('1results.csv', csvContent);
// console.log('Результаты сохранены в 1results.csv\n');
//
// // Анализируем результаты
// console.log('Анализ результатов:');
//
// /**
//  * Находим подходящую константу C для теоретической кривой O(n²)
//  * Используем максимальное отношение время/(N²) для больших N (≥16000)
//  * и добавляем запас 20% для наглядности графика
//  *
//  * @type {number}
//  */
// let maxRatio = 0;
// for (const N of arr) {
//     if (N >= 16000) {
//         const worstTime = Math.max(...results[N]);
//         const ratio = worstTime / (N * N);
//         if (ratio > maxRatio) maxRatio = ratio;
//     }
// }
// const C = maxRatio * 1.2;
//
// console.log('\nN\tМинимальное\tМаксимальное\tСреднее');
// console.log('-'.repeat(60));
//
// /**
//  * Массивы данных для построения графиков
//  * @type {Array<{N: number, time: number}>}
//  */
// const theoreticalData = []; // Теоретическая кривая O(n²)
// const minData = [];          // Лучший случай (минимумы)
// const maxData = [];          // Худший случай (максимумы)
// const avgData = [];          // Средний случай
//
// // Собираем статистику по каждому размеру массива
// for (const N of arr) {
//     const times = results[N];
//     const min = Math.min(...times);
//     const max = Math.max(...times);
//     const avg = times.reduce((a, b) => a + b, 0) / times.length;
//
//     minData.push({ N, time: min });
//     maxData.push({ N, time: max });
//     avgData.push({ N, time: avg });
//
//     // Для дополнительного задания - теоретическая кривая
//     theoreticalData.push({ N, time: C * N * N });
//
//     console.log(`${N}\t${min.toFixed(3)} мс\t\t${max.toFixed(3)} мс\t\t${avg.toFixed(3)} мс`);
// }
//
// console.log(`\nДля дополнительного задания: C = ${C.toExponential(4)}`);
//
// /**
//  * Создает и настраивает холст для рисования графиков
//  *
//  * @param {number} width - Ширина холста в пикселях
//  * @param {number} height - Высота холста в пикселях
//  * @param {string} title - Заголовок графика
//  * @returns {Object} Объект с контекстом рисования и параметрами
//  */
// function setupCanvas(width, height, title) {
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d');
//
//     // Белый фон
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, width, height);
//
//     // Заголовок
//     ctx.font = 'bold 24px Arial';
//     ctx.fillStyle = '#000000';
//     ctx.textAlign = 'center';
//     ctx.fillText(title, width / 2, 30);
//
//     return { canvas, ctx };
// }
//
// /**
//  * Рисует оси координат на графике
//  *
//  * @param {CanvasRenderingContext2D} ctx - Контекст рисования
//  * @param {Object} padding - Отступы от краев холста
//  * @param {number} width - Ширина холста
//  * @param {number} height - Высота холста
//  * @param {number[]} xValues - Значения для оси X (размеры массивов)
//  * @param {number} maxY - Максимальное значение по оси Y для масштабирования
//  */
// function drawAxes(ctx, padding, width, height, xValues, maxY) {
//     const graphWidth = width - padding.left - padding.right;
//     const graphHeight = height - padding.top - padding.bottom;
//     const xStep = graphWidth / (xValues.length - 1);
//
//     // Рисуем оси
//     ctx.strokeStyle = '#000000';
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(padding.left, padding.top);
//     ctx.lineTo(padding.left, height - padding.bottom);
//     ctx.lineTo(width - padding.right, height - padding.bottom);
//     ctx.stroke();
//
//     // Подписи осей
//     ctx.font = '16px Arial';
//     ctx.fillStyle = '#000000';
//     ctx.textAlign = 'center';
//     ctx.fillText('Размер массива (N)', width / 2, height - 20);
//
//     ctx.save();
//     ctx.translate(20, height / 2);
//     ctx.rotate(-Math.PI / 2);
//     ctx.fillText('Время сортировки (мс)', 0, 0);
//     ctx.restore();
//
//     // Деления на оси X
//     for (let i = 0; i < xValues.length; i++) {
//         const x = padding.left + (i * xStep);
//         const N = xValues[i];
//
//         ctx.beginPath();
//         ctx.moveTo(x, height - padding.bottom);
//         ctx.lineTo(x, height - padding.bottom + 10);
//         ctx.stroke();
//
//         ctx.font = '12px Arial';
//         ctx.fillStyle = '#666666';
//         ctx.textAlign = 'center';
//         ctx.fillText(N.toString(), x, height - padding.bottom + 25);
//     }
//
//     // Деления на оси Y
//     const yStep = graphHeight / 5;
//     for (let i = 0; i <= 5; i++) {
//         const y = height - padding.bottom - (i * yStep);
//         const value = (i * maxY / 5).toFixed(2);
//
//         ctx.beginPath();
//         ctx.moveTo(padding.left - 10, y);
//         ctx.lineTo(padding.left, y);
//         ctx.stroke();
//
//         ctx.font = '12px Arial';
//         ctx.fillStyle = '#666666';
//         ctx.textAlign = 'right';
//         ctx.fillText(value + ' мс', padding.left - 15, y + 4);
//     }
//
//     return { graphWidth, graphHeight, xStep };
// }
//
// /**
//  * Рисует линию графика по точкам данных
//  *
//  * @param {CanvasRenderingContext2D} ctx - Контекст рисования
//  * @param {Array<{N: number, time: number}>} data - Массив точек для графика
//  * @param {string} color - Цвет линии в HEX формате
//  * @param {Object} params - Параметры отрисовки
//  * @param {Object} params.padding - Отступы
//  * @param {number} params.xStep - Шаг по оси X
//  * @param {number[]} params.xValues - Значения оси X
//  * @param {number} params.maxY - Максимальное значение Y
//  * @param {number} params.graphHeight - Высота области графика
//  * @param {number} params.height - Высота холста
//  * @param {number} params.pointRadius - Радиус точек (по умолчанию 6)
//  */
// function drawLine(ctx, data, color, params) {
//     const { padding, xStep, xValues, maxY, graphHeight, height, pointRadius = 6 } = params;
//
//     ctx.beginPath();
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 3;
//
//     for (let i = 0; i < data.length; i++) {
//         // Находим соответствующий индекс в xValues
//         const xIndex = xValues.indexOf(data[i].N);
//         const x = padding.left + (xIndex * xStep);
//         const y = height - padding.bottom - (data[i].time / maxY * graphHeight);
//
//         if (i === 0) {
//             ctx.moveTo(x, y);
//         } else {
//             ctx.lineTo(x, y);
//         }
//     }
//     ctx.stroke();
//
//     // Рисуем точки
//     ctx.fillStyle = color;
//     for (let i = 0; i < data.length; i++) {
//         const xIndex = xValues.indexOf(data[i].N);
//         const x = padding.left + (xIndex * xStep);
//         const y = height - padding.bottom - (data[i].time / maxY * graphHeight);
//
//         ctx.beginPath();
//         ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
//         ctx.fill();
//     }
// }
//
// /**
//  * Рисует легенду графика
//  *
//  * @param {CanvasRenderingContext2D} ctx - Контекст рисования
//  * @param {Array<{color: string, text: string}>} items - Элементы легенды
//  * @param {number} startX - Начальная координата X
//  * @param {number} startY - Начальная координата Y
//  */
// function drawLegend(ctx, items, startX, startY) {
//     let legendY = startY;
//     ctx.font = '14px Arial';
//     ctx.textAlign = 'left';
//
//     for (const item of items) {
//         ctx.fillStyle = item.color;
//         ctx.fillRect(startX, legendY - 8, 20, 12);
//         ctx.fillStyle = '#333333';
//         ctx.fillText(item.text, startX + 30, legendY);
//         legendY += 25;
//     }
// }
//
// // Параметры графиков
// const width = 1200;
// const height = 800;
// const padding = { left: 100, right: 50, top: 50, bottom: 80 };
// const graphHeight = height - padding.top - padding.bottom;
// const graphWidth = width - padding.left - padding.right;
// const xStep = graphWidth / (arr.length - 1);
//
// // Максимальное значение для масштабирования
// const maxY = Math.max(...allPoints.map(p => p.time)) * 1.1;
//
// // ========== ПЕРВЫЙ ГРАФИК (основное задание) ==========
// /**
//  * График 1: Все точки замеров с выделением минимумов, максимумов и средних значений
//  * Показывает разброс результатов и основные статистические характеристики
//  */
// const { canvas: canvas1, ctx: ctx1 } = setupCanvas(width, height, 'Сортировка вставками - все точки замеров');
//
// // Рисуем оси
// drawAxes(ctx1, padding, width, height, arr, maxY);
//
// // Рисуем ВСЕ ТОЧКИ (полупрозрачные)
// ctx1.fillStyle = '#999999';
// ctx1.globalAlpha = 0.3;
// for (const point of allPoints) {
//     const xIndex = arr.indexOf(point.N);
//     const x = padding.left + (xIndex * xStep);
//     const y = height - padding.bottom - (point.time / maxY * graphHeight);
//
//     ctx1.beginPath();
//     ctx1.arc(x, y, 3, 0, 2 * Math.PI);
//     ctx1.fill();
// }
// ctx1.globalAlpha = 1.0;
//
// // Рисуем три кривые
// const lineParams = { padding, xStep, xValues: arr, maxY, graphHeight, height };
// drawLine(ctx1, minData, '#28a72e', lineParams);
// drawLine(ctx1, maxData, '#4d1016', lineParams);
// drawLine(ctx1, avgData, '#ee59ee', lineParams);
//
// // Легенда для первого графика
// const legendItems1 = [
//     { color: '#28a72e', text: 'Лучший случай (минимумы)' },
//     { color: '#4d1016', text: 'Худший случай (максимумы)' },
//     { color: '#ee59ee', text: 'Средний случай' },
//     { color: '#999999', text: 'Все точки замеров (20 для каждого N)' }
// ];
// drawLegend(ctx1, legendItems1, padding.left + 10, padding.top + 20);
//
// // Сохраняем первый график
// const buffer1 = canvas1.toBuffer('image/png');
// fs.writeFileSync('chart_all_points.png', buffer1);
// console.log('Первый график сохранен: chart_all_points.png');
//
// // ========== ВТОРОЙ ГРАФИК (дополнительное задание) ==========
// /**
//  * График 2: Сравнение худшего случая с теоретической кривой O(n²)
//  * Демонстрирует соответствие алгоритма теоретической сложности
//  */
// const { canvas: canvas2, ctx: ctx2 } = setupCanvas(width, height, 'Сравнение худшего случая с O(n²)');
//
// // Рисуем оси
// drawAxes(ctx2, padding, width, height, arr, maxY);
//
// // Рисуем кривые
// drawLine(ctx2, maxData, '#dc3545', lineParams);
// drawLine(ctx2, theoreticalData, '#45ff07', lineParams);
//
// // Легенда для второго графика
// const legendItems2 = [
//     { color: '#dc3545', text: 'Худший случай (фактические замеры)' },
//     { color: '#45ff07', text: `O(n²) с C = ${C.toExponential(3)}` }
// ];
// drawLegend(ctx2, legendItems2, padding.left + 10, padding.top + 20);
//
// // Сохраняем второй график
// const buffer2 = canvas2.toBuffer('image/png');
// fs.writeFileSync('chart_worst_vs_obig.png', buffer2);
// console.log('Второй график сохранен: chart_worst_vs_obig.png');
//
// /**
//  * Сортировка вставками (Insertion Sort)
//  *
//  * Классический алгоритм сортировки, который строит отсортированный массив
//  * путем последовательной вставки элементов в правильную позицию.
//  * Сложность: O(n²) в худшем и среднем случае, O(n) в лучшем случае.
//  *
//  * @param {number[]} a - Массив чисел для сортировки (будет изменен)
//  * @returns {number[]} Отсортированный массив (для удобства цепочек вызовов)
//  *
//  * @example
//  * const arr = [5, 2, 4, 1, 3];
//  * insertionSort(arr);
//  * console.log(arr); // [1, 2, 3, 4, 5]
//  */
// function insertionSort(a) {
//     /**
//      * Длина массива
//      * @type {number}
//      */
//     const n = a.length;
//
//     // Начинаем со второго элемента (индекс 1)
//     for (let i = 1; i < n; i++) {
//         /**
//          * Индекс элемента, с которым сравниваем текущий
//          * Двигаемся слева направо, вставляя текущий элемент
//          * в правильную позицию среди уже отсортированных
//          */
//         let j = i - 1;
//
//         /**
//          * Пока не дошли до начала массива и
//          * текущий элемент меньше предыдущего,
//          * меняем их местами и двигаемся дальше влево
//          */
//         while (j >= 0 && a[j] > a[j + 1]) {
//             // Меняем элементы местами (деструктуризация)
//             [a[j], a[j + 1]] = [a[j + 1], a[j]];
//             j--;
//         }
//     }
//     return a;
// }
//
// console.log('\n=== Итог работы программы ===');
// console.log('rxesults.csv - все результаты замеров');
// console.log('chart_all_points.png - все точки (20 замеров для каждого N)');
// console.log('chart_worst_vs_obig.png - сравнение худшего случая с O(n²)');