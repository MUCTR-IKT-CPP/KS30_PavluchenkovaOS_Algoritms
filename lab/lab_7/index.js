const fs = require('fs');
const { createCanvas } = require('canvas');

// ==================== AVL-ДЕРЕВО ====================

/**
 * Узел AVL-дерева
 * @class AVLNode
 * @property {number} value - Ключ/значение узла
 * @property {AVLNode|null} left - Левый потомок
 * @property {AVLNode|null} right - Правый потомок
 * @property {number} height - Высота узла (максимальное расстояние до листа)
 */
class AVLNode {
    /**
     * Создает новый узел AVL-дерева
     * @param {number} value - Значение узла
     */
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

/**
 * AVL-дерево - самобалансирующееся двоичное дерево поиска
 * @class AVLTree
 * @description Для любого узла высота правого поддерева отличается от высоты левого не более чем на 1
 * @see {@link https://ru.wikipedia.org/wiki/АВЛ-дерево}
 */
class AVLTree {
    /**
     * Создает пустое AVL-дерево
     */
    constructor() {
        /** @type {AVLNode|null} Корень дерева */
        this.root = null;
    }

    /**
     * Возвращает высоту узла (0 для null)
     * @param {AVLNode|null} node - Узел дерева
     * @returns {number} Высота узла
     */
    getHeight(node) {
        return node ? node.height : 0;
    }

    /**
     * Обновляет высоту узла на основе высот потомков
     * @param {AVLNode} node - Узел для обновления
     */
    updateHeight(node) {
        node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
    }

    /**
     * Вычисляет фактор балансировки узла
     * @param {AVLNode|null} node - Узел дерева
     * @returns {number} Фактор балансировки (высота_правого - высота_левого)
     */
    getBalanceFactor(node) {
        return node ? this.getHeight(node.right) - this.getHeight(node.left) : 0;
    }

    /**
     * Малый правый поворот вокруг узла y
     * @param {AVLNode} y - Узел, относительно которого выполняется поворот
     * @returns {AVLNode} Новый корень поддерева (узел x, бывший левый потомок)
     * @description Применяется когда левое поддерево выше правого (фактор = -2, leftFactor ≤ 0)
     */
    rotateRight(y) {
        const x = y.left;
        const T2 = x.right;
        x.right = y;
        y.left = T2;
        this.updateHeight(y);
        this.updateHeight(x);
        return x;
    }

    /**
     * Малый левый поворот вокруг узла x
     * @param {AVLNode} x - Узел, относительно которого выполняется поворот
     * @returns {AVLNode} Новый корень поддерева (узел y, бывший правый потомок)
     * @description Применяется когда правое поддерево выше левого (фактор = 2, rightFactor ≥ 0)
     */
    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;
        y.left = x;
        x.right = T2;
        this.updateHeight(x);
        this.updateHeight(y);
        return y;
    }

    /**
     * Рекурсивно вычисляет фактическую высоту дерева
     * @param {AVLNode|null} node - Текущий узел
     * @returns {number} Высота поддерева
     */
    getActualHeight(node) {
        if (!node) return 0;
        return 1 + Math.max(this.getActualHeight(node.left), this.getActualHeight(node.right));
    }

    /**
     * Возвращает максимальную глубину дерева
     * @returns {number} Максимальная высота от корня до листа
     */
    getMaxDepth() {
        return this.getActualHeight(this.root);
    }

    /**
     * Собирает глубины всех листьев дерева
     * @returns {number[]} Массив глубин всех листьев (глубина корня = 1)
     */
    getAllDepths() {
        const depths = [];
        /**
         * Рекурсивный обход дерева
         * @param {AVLNode|null} node - Текущий узел
         * @param {number} depth - Текущая глубина
         */
        const traverse = (node, depth) => {
            if (!node) return;
            if (!node.left && !node.right) {
                depths.push(depth);
            }
            traverse(node.left, depth + 1);
            traverse(node.right, depth + 1);
        };
        traverse(this.root, 1);
        return depths;
    }

    /**
     * Выполняет поиск значения в дереве
     * @param {number} value - Искомое значение
     * @returns {boolean} true если значение найдено, иначе false
     * @complexity O(log n) в среднем, O(n) в худшем случае
     */
    search(value) {
        /**
         * Рекурсивный поиск в поддереве
         * @param {AVLNode|null} node - Корень поддерева
         * @param {number} val - Искомое значение
         * @returns {boolean}
         */
        const searchNode = (node, val) => {
            if (node === null) return false;
            if (val === node.value) return true;
            if (val < node.value) return searchNode(node.left, val);
            return searchNode(node.right, val);
        };
        return searchNode(this.root, value);
    }

    /**
     * Балансирует поддерево (применяет повороты при необходимости)
     * @param {AVLNode|null} node - Корень поддерева
     * @returns {AVLNode|null} Новый корень сбалансированного поддерева
     */
    balance(node) {
        if (node === null) return null;

        this.updateHeight(node);
        const factor = this.getBalanceFactor(node);

        // Левое поддерево выше правого
        if (factor === -2) {
            const leftFactor = this.getBalanceFactor(node.left);
            // Малый правый поворот
            if (leftFactor <= 0) {
                return this.rotateRight(node);
            }
            // Большой правый поворот (левый-правый)
            if (leftFactor === 1) {
                node.left = this.rotateLeft(node.left);
                return this.rotateRight(node);
            }
        }
        // Правое поддерево выше левого
        else if (factor === 2) {
            const rightFactor = this.getBalanceFactor(node.right);
            // Малый левый поворот
            if (rightFactor >= 0) {
                return this.rotateLeft(node);
            }
            // Большой левый поворот (правый-левый)
            if (rightFactor === -1) {
                node.right = this.rotateRight(node.right);
                return this.rotateLeft(node);
            }
        }
        return node;
    }

    /**
     * Вставляет новое значение в дерево
     * @param {number} value - Вставляемое значение
     * @complexity O(log n) в среднем
     */
    insert(value) {
        /**
         * Рекурсивная вставка в поддерево
         * @param {AVLNode|null} node - Корень поддерева
         * @param {number} val - Вставляемое значение
         * @returns {AVLNode} Обновленный узел
         */
        const insertNode = (node, val) => {
            if (node === null) {
                return new AVLNode(val);
            }
            if (val < node.value) {
                node.left = insertNode(node.left, val);
            } else if (val > node.value) {
                node.right = insertNode(node.right, val);
            } else {
                return node; // Дубликаты не вставляются
            }
            return this.balance(node);
        };
        this.root = insertNode(this.root, value);
    }

    /**
     * Удаляет значение из дерева
     * @param {number} value - Удаляемое значение
     * @complexity O(log n) в среднем
     */
    delete(value) {
        /**
         * Находит узел с минимальным значением в поддереве
         * @param {AVLNode} node - Корень поддерева
         * @returns {AVLNode} Узел с минимальным значением
         */
        const findMin = (node) => {
            while (node.left !== null) node = node.left;
            return node;
        };

        /**
         * Рекурсивное удаление из поддерева
         * @param {AVLNode|null} node - Корень поддерева
         * @param {number} val - Удаляемое значение
         * @returns {AVLNode|null} Обновленный узел
         */
        const deleteNode = (node, val) => {
            if (node === null) return null;

            if (val < node.value) {
                node.left = deleteNode(node.left, val);
            } else if (val > node.value) {
                node.right = deleteNode(node.right, val);
            } else {
                // Случай 1: нет потомков
                if (node.left === null && node.right === null) {
                    return null;
                }
                // Случай 2: только левый потомок
                if (node.left !== null && node.right === null) {
                    return node.left;
                }
                // Случай 3: только правый потомок
                if (node.right !== null && node.left === null) {
                    return node.right;
                }
                // Случай 4: два потомка - заменяем минимальным из правого поддерева
                const minRight = findMin(node.right);
                node.value = minRight.value;
                node.right = deleteNode(node.right, minRight.value);
            }
            return this.balance(node);
        };
        this.root = deleteNode(this.root, value);
    }
}

// ==================== ДЕКАРТОВО ДЕРЕВО (TREAP) ====================

/**
 * Узел декартова дерева (Treap)
 * @class TreapNode
 * @property {number} key - Ключ/значение узла (построение по правилам BST)
 * @property {number} priority - Приоритет узла (построение по правилам кучи/Heap)
 * @property {TreapNode|null} left - Левый потомок (меньшие ключи)
 * @property {TreapNode|null} right - Правый потомок (большие ключи)
 */
class TreapNode {
    /**
     * Создает новый узел декартова дерева
     * @param {number} key - Ключ узла
     * @param {number|null} priority - Приоритет (случайное число, если null)
     */
    constructor(key, priority = null) {
        this.key = key;
        this.priority = priority !== null ? priority : Math.random();
        this.left = null;
        this.right = null;
    }
}

/**
 * Декартово дерево (Treap = Tree + Heap)
 * @class Treap
 * @description Сочетает в себе свойства BST (по ключу) и кучи (по приоритету)
 * @see {@link https://habr.com/ru/post/101818/}
 */
class Treap {
    /**
     * Создает пустое декартово дерево
     */
    constructor() {
        /** @type {TreapNode|null} Корень дерева */
        this.root = null;
    }

    /**
     * Рекурсивно вычисляет высоту дерева
     * @param {TreapNode|null} node - Текущий узел
     * @returns {number} Высота поддерева
     */
    getHeight(node) {
        if (!node) return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    /**
     * Возвращает максимальную глубину дерева
     * @returns {number} Максимальная высота от корня до листа
     */
    getMaxDepth() {
        return this.getHeight(this.root);
    }

    /**
     * Собирает глубины всех листьев дерева
     * @returns {number[]} Массив глубин всех листьев (глубина корня = 1)
     */
    getAllDepths() {
        const depths = [];
        /**
         * Рекурсивный обход дерева
         * @param {TreapNode|null} node - Текущий узел
         * @param {number} depth - Текущая глубина
         */
        const traverse = (node, depth) => {
            if (!node) return;
            if (!node.left && !node.right) {
                depths.push(depth);
            }
            traverse(node.left, depth + 1);
            traverse(node.right, depth + 1);
        };
        traverse(this.root, 1);
        return depths;
    }

    /**
     * Разделяет дерево на два по ключу
     * @param {TreapNode|null} root - Корень разделяемого дерева
     * @param {number} key - Ключ разделения
     * @returns {[TreapNode|null, TreapNode|null]} Массив [L, R], где L < key ≤ R
     * @complexity O(log n) с вероятностью
     */
    split(root, key) {
        if (!root) return [null, null];

        if (key < root.key) {
            const [left, right] = this.split(root.left, key);
            root.left = right;
            return [left, root];
        } else {
            const [left, right] = this.split(root.right, key);
            root.right = left;
            return [root, right];
        }
    }

    /**
     * Объединяет два декартовых дерева
     * @param {TreapNode|null} left - Левое дерево (все ключи меньше правого)
     * @param {TreapNode|null} right - Правое дерево (все ключи больше левого)
     * @returns {TreapNode|null} Объединенное дерево
     * @complexity O(log n) с вероятностью
     */
    merge(left, right) {
        if (!left) return right;
        if (!right) return left;

        if (left.priority > right.priority) {
            left.right = this.merge(left.right, right);
            return left;
        } else {
            right.left = this.merge(left, right.left);
            return right;
        }
    }

    /**
     * Вставляет значение в дерево
     * @param {number} value - Вставляемое значение
     * @complexity O(log n) с вероятностью
     * @description Использует операции split и merge
     */
    insert(value) {
        const [left, right] = this.split(this.root, value);
        const newNode = new TreapNode(value);
        this.root = this.merge(this.merge(left, newNode), right);
    }

    /**
     * Выполняет поиск значения в дереве
     * @param {number} value - Искомое значение
     * @returns {boolean} true если значение найдено, иначе false
     * @complexity O(log n) с вероятностью
     */
    search(value) {
        let cur = this.root;
        while (cur) {
            if (value === cur.key) return true;
            if (value < cur.key) cur = cur.left;
            else cur = cur.right;
        }
        return false;
    }

    /**
     * Удаляет значение из дерева
     * @param {number} value - Удаляемое значение
     * @complexity O(log n) с вероятностью
     * @description Использует два split для выделения удаляемого узла
     */
    delete(value) {
        const [left, mid] = this.split(this.root, value);
        const [middle, right] = this.split(mid, value + 1);
        // middle содержит удаляемый узел (игнорируем его)
        this.root = this.merge(left, right);
    }
}

// ==================== ТЕСТИРОВАНИЕ ====================

/**
 * Генерирует массив случайных целых чисел
 * @param {number} size - Количество элементов
 * @param {number} maxValue - Максимальное значение (не включая)
 * @returns {number[]} Массив случайных чисел
 */
function generateRandomArray(size, maxValue = 1000000) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * maxValue));
    }
    return arr;
}

/**
 * Настраивает холст для построения графика
 * @param {number} width - Ширина холста в пикселях
 * @param {number} height - Высота холста в пикселях
 * @param {string} title - Заголовок графика
 * @returns {{canvas: any, ctx: any}} Объект с холстом и контекстом рисования
 */
function setupCanvas(width, height, title) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 40);
    return { canvas, ctx };
}

/**
 * Рисует оси координат на графике
 * @param {CanvasRenderingContext2D} ctx - Контекст рисования
 * @param {Object} padding - Отступы {left, right, top, bottom}
 * @param {number} width - Ширина холста
 * @param {number} height - Высота холста
 * @param {number[]} xValues - Значения по оси X
 * @param {number} maxY - Максимальное значение по оси Y
 * @param {string} yLabel - Подпись оси Y
 * @param {string} xLabel - Подпись оси X
 * @returns {Object} Параметры для рисования линий
 */
function drawAxes(ctx, padding, width, height, xValues, maxY, yLabel, xLabel = 'Размер массива (N)') {
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;
    const xStep = graphWidth / (xValues.length - 1);

    // Рисуем оси
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Подпись оси X
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, width / 2, height - 30);

    // Подпись оси Y (повернутая)
    ctx.save();
    ctx.translate(30, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Деления по оси X
    for (let i = 0; i < xValues.length; i++) {
        const x = padding.left + (i * xStep);
        ctx.beginPath();
        ctx.moveTo(x, height - padding.bottom);
        ctx.lineTo(x, height - padding.bottom + 10);
        ctx.stroke();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText(xValues[i].toString(), x, height - padding.bottom + 25);
    }

    // Деления по оси Y
    const yStep = graphHeight / 5;
    for (let i = 0; i <= 5; i++) {
        const y = height - padding.bottom - (i * yStep);
        const value = (i * maxY / 5);
        ctx.beginPath();
        ctx.moveTo(padding.left - 10, y);
        ctx.lineTo(padding.left, y);
        ctx.stroke();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(1), padding.left - 15, y + 4);
    }

    return { graphWidth, graphHeight, xStep, xValues, maxY, height, padding };
}

/**
 * Рисует линию на графике по точкам
 * @param {CanvasRenderingContext2D} ctx - Контекст рисования
 * @param {number[]} dataPoints - Массив значений по оси Y
 * @param {string} color - Цвет линии (CSS цвет)
 * @param {Object} params - Параметры из drawAxes
 * @param {string|null} label - Подпись для последней точки
 */
function drawLine(ctx, dataPoints, color, params, label = null) {
    const { xValues, maxY, graphHeight, height, padding, xStep } = params;

    if (!dataPoints || dataPoints.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    let firstPoint = true;
    for (let i = 0; i < dataPoints.length; i++) {
        const x = padding.left + (i * xStep);
        const y = height - padding.bottom - (dataPoints[i] / maxY * graphHeight);

        if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Рисуем маркеры точек
    ctx.fillStyle = color;
    for (let i = 0; i < dataPoints.length; i++) {
        const x = padding.left + (i * xStep);
        const y = height - padding.bottom - (dataPoints[i] / maxY * graphHeight);
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        if (label && i === dataPoints.length - 1) {
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.fillText(label, x + 10, y - 10);
        }
    }
}

/**
 * Рисует гистограмму (столбчатую диаграмму) с нормализацией в процентах
 * @param {CanvasRenderingContext2D} ctx - Контекст рисования
 * @param {number[]} data1 - Данные для первого набора (AVL) - частоты
 * @param {number[]} data2 - Данные для второго набора (Treap) - частоты
 * @param {number[]} xValues - Значения по оси X
 * @param {string} color1 - Цвет первого набора
 * @param {string} color2 - Цвет второго набора
 * @param {string} label1 - Подпись первого набора
 * @param {string} label2 - Подпись второго набора
 * @param {Object} params - Параметры из drawAxes
 */
function drawHistogramNormalized(ctx, data1, data2, xValues, color1, color2, label1, label2, params) {
    const { maxY, graphHeight, height, padding, xStep } = params;

    if (!data1 || data1.length === 0) return;

    // Находим сумму для нормализации в проценты
    const sum1 = data1.reduce((a, b) => a + b, 0);
    const sum2 = data2.reduce((a, b) => a + b, 0);

    // Нормализуем данные в проценты
    const normalized1 = data1.map(v => sum1 > 0 ? (v / sum1) * 100 : 0);
    const normalized2 = data2.map(v => sum2 > 0 ? (v / sum2) * 100 : 0);

    // Находим максимум для масштабирования
    let maxNorm = Math.max(...normalized1, ...normalized2, 10) * 1.1;

    // Масштабируем высоты столбцов
    const scale = graphHeight / maxNorm;

    const barWidth = xStep * 0.35;
    const offset = xStep * 0.15;

    // Рисуем столбцы для AVL
    ctx.fillStyle = color1;
    for (let i = 0; i < normalized1.length; i++) {
        const x = padding.left + (i * xStep + offset);
        const barHeight = normalized1[i] * scale;
        const y = height - padding.bottom - barHeight;

        if (barHeight > 0) {
            ctx.fillRect(x, y, barWidth, barHeight);

            // Подпись значения над столбцом
            if (normalized1[i] > 2) {
                ctx.fillStyle = '#000000';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(normalized1[i].toFixed(1) + '%', x + barWidth / 2, y - 3);
                ctx.fillStyle = color1;
            }
        }
    }

    // Рисуем столбцы для Treap
    ctx.fillStyle = color2;
    for (let i = 0; i < normalized2.length; i++) {
        const x = padding.left + (i * xStep + offset + barWidth);
        const barHeight = normalized2[i] * scale;
        const y = height - padding.bottom - barHeight;

        if (barHeight > 0) {
            ctx.fillRect(x, y, barWidth, barHeight);

            // Подпись значения над столбцом
            if (normalized2[i] > 2) {
                ctx.fillStyle = '#000000';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(normalized2[i].toFixed(1) + '%', x + barWidth / 2, y - 3);
                ctx.fillStyle = color2;
            }
        }
    }

    // Легенда
    const legendX = padding.left + 20;
    const legendY = padding.top + 20;

    ctx.fillStyle = color1;
    ctx.fillRect(legendX, legendY, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${label1} (всего: ${sum1})`, legendX + 25, legendY + 12);

    ctx.fillStyle = color2;
    ctx.fillRect(legendX, legendY + 25, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.fillText(`${label2} (всего: ${sum2})`, legendX + 25, legendY + 37);
}

// Размеры: 2^10 до 2^18
const sizes = [];
for (let i = 10; i <= 18; i++) {
    sizes.push(Math.pow(2, i));
}

// Структуры для хранения результатов
const avlResults = {};
const treapResults = {};

for (const size of sizes) {
    avlResults[size] = {
        maxDepth: [],
        insertTimes: [],
        deleteTimes: [],
        searchTimes: [],
        allDepths: []
    };
    treapResults[size] = {
        maxDepth: [],
        insertTimes: [],
        deleteTimes: [],
        searchTimes: [],
        allDepths: []
    };
}

// Основной цикл тестирования
console.log('='.repeat(80));
console.log('НАЧАЛО ТЕСТИРОВАНИЯ');
console.log('='.repeat(80));

for (const size of sizes) {
    console.log(`\n📊 Тестирование для N = ${size} (2^${Math.log2(size)})`);

    // 50 повторений для каждой серии
    for (let repetition = 0; repetition < 50; repetition++) {
        if ((repetition + 1) % 10 === 0) {
            process.stdout.write(`  Повторение ${repetition + 1}/50...\r`);
        }

        // Генерируем случайные значения
        const data = generateRandomArray(size, size * 2);

        // === AVL ДЕРЕВО ===
        const avl = new AVLTree();

        // Заполнение деревьев и измерение максимальной глубины
        for (const val of data) {
            avl.insert(val);
        }
        avlResults[size].maxDepth.push(avl.getMaxDepth());

        // 1000 операций вставки
        const insertTargets = generateRandomArray(1000, size * 2);
        const avlInsertStart = performance.now();
        for (const target of insertTargets) {
            avl.insert(target);
        }
        avlResults[size].insertTimes.push((performance.now() - avlInsertStart) / 1000);

        // 1000 операций удаления
        const deleteTargets = generateRandomArray(1000, size * 2);
        const avlDeleteStart = performance.now();
        for (const target of deleteTargets) {
            avl.delete(target);
        }
        avlResults[size].deleteTimes.push((performance.now() - avlDeleteStart) / 1000);

        // 1000 операций поиска
        const searchTargets = generateRandomArray(1000, size * 2);
        const avlSearchStart = performance.now();
        for (const target of searchTargets) {
            avl.search(target);
        }
        avlResults[size].searchTimes.push((performance.now() - avlSearchStart) / 1000);

        // Измерение глубины всех ветвей
        avlResults[size].allDepths.push(...avl.getAllDepths());

        // === ДЕКАРТОВО ДЕРЕВО ===
        const treap = new Treap();

        // Заполнение деревьев и измерение максимальной глубины
        for (const val of data) {
            treap.insert(val);
        }
        treapResults[size].maxDepth.push(treap.getMaxDepth());

        // 1000 операций вставки
        const treapInsertStart = performance.now();
        for (const target of insertTargets) {
            treap.insert(target);
        }
        treapResults[size].insertTimes.push((performance.now() - treapInsertStart) / 1000);

        // 1000 операций удаления
        const treapDeleteStart = performance.now();
        for (const target of deleteTargets) {
            treap.delete(target);
        }
        treapResults[size].deleteTimes.push((performance.now() - treapDeleteStart) / 1000);

        // 1000 операций поиска
        const treapSearchStart = performance.now();
        for (const target of searchTargets) {
            treap.search(target);
        }
        treapResults[size].searchTimes.push((performance.now() - treapSearchStart) / 1000);

        // Измерение глубины всех ветвей
        treapResults[size].allDepths.push(...treap.getAllDepths());
    }
    console.log(`  ✅ Завершено 50 повторений для N = ${size}`);
}

// Сохранение результатов в CSV
console.log('\n📁 Сохранение результатов в CSV...');

// CSV для временных характеристик
let csvInsert = 'Size,Repetition,AVL_Time_ms,Treap_Time_ms\n';
let csvDelete = 'Size,Repetition,AVL_Time_us,Treap_Time_us\n';
let csvSearch = 'Size,Repetition,AVL_Time_us,Treap_Time_us\n';
let csvMaxDepth = 'Size,Repetition,AVL_MaxDepth,Treap_MaxDepth\n';

for (const size of sizes) {
    for (let rep = 0; rep < 50; rep++) {
        csvInsert += `${size},${rep + 1},${avlResults[size].insertTimes[rep].toFixed(6)},${treapResults[size].insertTimes[rep].toFixed(6)}\n`;
        csvDelete += `${size},${rep + 1},${(avlResults[size].deleteTimes[rep] * 1000).toFixed(3)},${(treapResults[size].deleteTimes[rep] * 1000).toFixed(3)}\n`;
        csvSearch += `${size},${rep + 1},${(avlResults[size].searchTimes[rep] * 1000).toFixed(3)},${(treapResults[size].searchTimes[rep] * 1000).toFixed(3)}\n`;
        csvMaxDepth += `${size},${rep + 1},${avlResults[size].maxDepth[rep]},${treapResults[size].maxDepth[rep]}\n`;
    }
}

fs.writeFileSync('insert_times.csv', csvInsert);
fs.writeFileSync('delete_times.csv', csvDelete);
fs.writeFileSync('search_times.csv', csvSearch);
fs.writeFileSync('max_depth.csv', csvMaxDepth);

// Сохранение распределения глубин для последней серии (N = 2^18)
const lastSize = sizes[sizes.length - 1];
let csvDepths = 'Depth,AVL_Frequency,Treap_Frequency\n';

const avlDepthCount = {};
const treapDepthCount = {};

for (const depth of avlResults[lastSize].allDepths) {
    avlDepthCount[depth] = (avlDepthCount[depth] || 0) + 1;
}
for (const depth of treapResults[lastSize].allDepths) {
    treapDepthCount[depth] = (treapDepthCount[depth] || 0) + 1;
}

const allDepths = new Set([...Object.keys(avlDepthCount), ...Object.keys(treapDepthCount)]);
for (const depth of Array.from(allDepths).sort((a, b) => Number(a) - Number(b))) {
    csvDepths += `${depth},${avlDepthCount[depth] || 0},${treapDepthCount[depth] || 0}\n`;
}
fs.writeFileSync('depth_distribution.csv', csvDepths);

console.log('✅ Результаты сохранены в CSV файлы');

// Вывод статистики
console.log('\n' + '='.repeat(80));
console.log('СТАТИСТИКА РЕЗУЛЬТАТОВ');
console.log('='.repeat(80));

for (const size of sizes) {
    const avlInsertAvg = avlResults[size].insertTimes.reduce((a, b) => a + b, 0) / 50;
    const treapInsertAvg = treapResults[size].insertTimes.reduce((a, b) => a + b, 0) / 50;
    const avlDeleteAvg = avlResults[size].deleteTimes.reduce((a, b) => a + b, 0) / 50;
    const treapDeleteAvg = treapResults[size].deleteTimes.reduce((a, b) => a + b, 0) / 50;
    const avlSearchAvg = avlResults[size].searchTimes.reduce((a, b) => a + b, 0) / 50;
    const treapSearchAvg = treapResults[size].searchTimes.reduce((a, b) => a + b, 0) / 50;
    const avlMaxDepthAvg = avlResults[size].maxDepth.reduce((a, b) => a + b, 0) / 50;
    const treapMaxDepthAvg = treapResults[size].maxDepth.reduce((a, b) => a + b, 0) / 50;

    console.log(`\n📊 N = ${size} (2^${Math.log2(size)})`);
    console.log(`  Вставка (мс):     AVL = ${avlInsertAvg.toFixed(6)} | Treap = ${treapInsertAvg.toFixed(6)}`);
    console.log(`  Удаление (мкс):   AVL = ${(avlDeleteAvg * 1000).toFixed(3)} | Treap = ${(treapDeleteAvg * 1000).toFixed(3)}`);
    console.log(`  Поиск (мкс):      AVL = ${(avlSearchAvg * 1000).toFixed(3)} | Treap = ${(treapSearchAvg * 1000).toFixed(3)}`);
    console.log(`  Макс. глубина:    AVL = ${avlMaxDepthAvg.toFixed(2)} | Treap = ${treapMaxDepthAvg.toFixed(2)}`);
}

// ==================== ПОСТРОЕНИЕ ГРАФИКОВ ====================

const width = 1200;
const height = 800;
const padding = { left: 100, right: 50, top: 80, bottom: 80 };

// Подготовка данных для графиков
const sizesForGraph = sizes.map(s => s);
const avlInsertAvgData = sizes.map(size => avlResults[size].insertTimes.reduce((a, b) => a + b, 0) / 50);
const treapInsertAvgData = sizes.map(size => treapResults[size].insertTimes.reduce((a, b) => a + b, 0) / 50);
const avlDeleteAvgData = sizes.map(size => avlResults[size].deleteTimes.reduce((a, b) => a + b, 0) / 50 * 1000);
const treapDeleteAvgData = sizes.map(size => treapResults[size].deleteTimes.reduce((a, b) => a + b, 0) / 50 * 1000);
const avlSearchAvgData = sizes.map(size => avlResults[size].searchTimes.reduce((a, b) => a + b, 0) / 50 * 1000);
const treapSearchAvgData = sizes.map(size => treapResults[size].searchTimes.reduce((a, b) => a + b, 0) / 50 * 1000);
const avlMaxDepthAvgData = sizes.map(size => avlResults[size].maxDepth.reduce((a, b) => a + b, 0) / 50);
const treapMaxDepthAvgData = sizes.map(size => treapResults[size].maxDepth.reduce((a, b) => a + b, 0) / 50);

// График 1: Время вставки
console.log('\n📊 Построение графика 1/6: Время вставки...');
const maxInsert = Math.max(...avlInsertAvgData, ...treapInsertAvgData) * 1.1;
const { canvas: canvas1, ctx: ctx1 } = setupCanvas(width, height, 'График 1: Зависимость среднего времени вставки от N');
const params1 = drawAxes(ctx1, padding, width, height, sizesForGraph, maxInsert, 'Время вставки (мс)');
drawLine(ctx1, avlInsertAvgData, '#3498db', params1, 'AVL');
drawLine(ctx1, treapInsertAvgData, '#e74c3c', params1, 'Treap');
fs.writeFileSync('chart_1_insert_time.png', canvas1.toBuffer('image/png'));
console.log('✅ chart_1_insert_time.png');

// График 2: Время удаления
console.log('📊 Построение графика 2/6: Время удаления...');
const maxDelete = Math.max(...avlDeleteAvgData, ...treapDeleteAvgData) * 1.1;
const { canvas: canvas2, ctx: ctx2 } = setupCanvas(width, height, 'График 2: Зависимость среднего времени удаления от N');
const params2 = drawAxes(ctx2, padding, width, height, sizesForGraph, maxDelete, 'Время удаления (мкс)');
drawLine(ctx2, avlDeleteAvgData, '#3498db', params2, 'AVL');
drawLine(ctx2, treapDeleteAvgData, '#e74c3c', params2, 'Treap');
fs.writeFileSync('chart_2_delete_time.png', canvas2.toBuffer('image/png'));
console.log('✅ chart_2_delete_time.png');

// График 3: Время поиска
console.log('📊 Построение графика 3/6: Время поиска...');
const maxSearch = Math.max(...avlSearchAvgData, ...treapSearchAvgData) * 1.1;
const { canvas: canvas3, ctx: ctx3 } = setupCanvas(width, height, 'График 3: Зависимость среднего времени поиска от N');
const params3 = drawAxes(ctx3, padding, width, height, sizesForGraph, maxSearch, 'Время поиска (мкс)');
drawLine(ctx3, avlSearchAvgData, '#3498db', params3, 'AVL');
drawLine(ctx3, treapSearchAvgData, '#e74c3c', params3, 'Treap');
fs.writeFileSync('chart_3_search_time.png', canvas3.toBuffer('image/png'));
console.log('✅ chart_3_search_time.png');

// График 4: Максимальная высота
console.log('📊 Построение графика 4/6: Максимальная высота...');
const maxDepth = Math.max(...avlMaxDepthAvgData, ...treapMaxDepthAvgData) * 1.1;
const { canvas: canvas4, ctx: ctx4 } = setupCanvas(width, height, 'График 4: Зависимость максимальной высоты дерева от N');
const params4 = drawAxes(ctx4, padding, width, height, sizesForGraph, maxDepth, 'Максимальная высота');
drawLine(ctx4, avlMaxDepthAvgData, '#3498db', params4, 'AVL');
drawLine(ctx4, treapMaxDepthAvgData, '#e74c3c', params4, 'Treap');
fs.writeFileSync('chart_4_max_depth.png', canvas4.toBuffer('image/png'));
console.log('✅ chart_4_max_depth.png');

// График 5: ГИСТОГРАММА распределения максимальной высоты (нормализованная)
console.log('📊 Построение графика 5/6: Гистограмма распределения максимальной высоты...');
const avlMaxDepthLast = avlResults[lastSize].maxDepth;
const treapMaxDepthLast = treapResults[lastSize].maxDepth;

// Подсчет частот для каждого значения высоты
const avlDepthHist = {};
const treapDepthHist = {};
for (const d of avlMaxDepthLast) {
    avlDepthHist[d] = (avlDepthHist[d] || 0) + 1;
}
for (const d of treapMaxDepthLast) {
    treapDepthHist[d] = (treapDepthHist[d] || 0) + 1;
}

// Объединяем все возможные значения высот
const allDepthValuesSet = new Set([...Object.keys(avlDepthHist), ...Object.keys(treapDepthHist)]);
const depthValuesArray = Array.from(allDepthValuesSet).map(Number).sort((a, b) => a - b);
const avlHistData = depthValuesArray.map(d => avlDepthHist[d] || 0);
const treapHistData = depthValuesArray.map(d => treapDepthHist[d] || 0);

const { canvas: canvas5, ctx: ctx5 } = setupCanvas(width, height, 'График 5: Распределение максимальной высоты (N = 2^18)');
// Используем 100 как временный maxY, он будет пересчитан внутри функции
const params5 = drawAxes(ctx5, padding, width, height, depthValuesArray, 100, 'Частота (%)', 'Максимальная высота');
drawHistogramNormalized(ctx5, avlHistData, treapHistData, depthValuesArray, '#3498db', '#e74c3c', 'AVL', 'Treap', params5);
fs.writeFileSync('chart_5_max_depth_histogram.png', canvas5.toBuffer('image/png'));
console.log('✅ chart_5_max_depth_histogram.png');

// График 6: ГИСТОГРАММА распределения высот ветвей (нормализованная)
console.log('📊 Построение графика 6/6: Гистограмма распределения высот ветвей...');
const avlDepthsLast = avlResults[lastSize].allDepths;
const treapDepthsLast = treapResults[lastSize].allDepths;

const avlBranchDepthCount = {};
const treapBranchDepthCount = {};

for (const depth of avlDepthsLast) {
    avlBranchDepthCount[depth] = (avlBranchDepthCount[depth] || 0) + 1;
}
for (const depth of treapDepthsLast) {
    treapBranchDepthCount[depth] = (treapBranchDepthCount[depth] || 0) + 1;
}

const allBranchDepthsSet = new Set([...Object.keys(avlBranchDepthCount), ...Object.keys(treapBranchDepthCount)]);
const branchDepthValuesArray = Array.from(allBranchDepthsSet).map(Number).sort((a, b) => a - b);
const avlBranchData = branchDepthValuesArray.map(d => avlBranchDepthCount[d] || 0);
const treapBranchData = branchDepthValuesArray.map(d => treapBranchDepthCount[d] || 0);

const { canvas: canvas6, ctx: ctx6 } = setupCanvas(width, height, 'График 6: Распределение высот ветвей (N = 2^18)');
const params6 = drawAxes(ctx6, padding, width, height, branchDepthValuesArray, 100, 'Частота (%)', 'Высота ветви');
drawHistogramNormalized(ctx6, avlBranchData, treapBranchData, branchDepthValuesArray, '#3498db', '#e74c3c', 'AVL', 'Treap', params6);
fs.writeFileSync('chart_6_branch_depth_distribution.png', canvas6.toBuffer('image/png'));
console.log('✅ chart_6_branch_depth_distribution.png');

// ==================== ИТОГИ ====================
console.log('\n' + '='.repeat(80));
console.log('ВСЕ 6 ГРАФИКОВ СОЗДАНЫ!');
console.log('='.repeat(80));
console.log('\nСохранённые файлы:');
console.log('  📊 chart_1_insert_time.png              - Линейный график: Время вставки (AVL vs Treap)');
console.log('  📊 chart_2_delete_time.png              - Линейный график: Время удаления (AVL vs Treap)');
console.log('  📊 chart_3_search_time.png              - Линейный график: Время поиска (AVL vs Treap)');
console.log('  📊 chart_4_max_depth.png                - Линейный график: Максимальная высота (AVL vs Treap)');
console.log('  📊 chart_5_max_depth_histogram.png      - ГИСТОГРАММА: Распределение макс. высоты (N=2^18)');
console.log('  📊 chart_6_branch_depth_distribution.png - ГИСТОГРАММА: Распределение высот ветвей (N=2^18)');
console.log('\n📁 CSV файлы с данными:');
console.log('  insert_times.csv, delete_times.csv, search_times.csv, max_depth.csv, depth_distribution.csv');