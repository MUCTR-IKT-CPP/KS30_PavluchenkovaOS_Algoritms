const fs = require('fs');
const { createCanvas } = require('canvas');

/**
 * Класс узла бинарного дерева поиска (BST)
 * @class BSTNode
 */
class BSTNode {
    /**
     * Создает новый узел BST
     * @param {number} value - Значение, хранящееся в узле
     */
    constructor(value) {
        /** Значение узла */
        this.value = value;
        /** Левый потомок */
        this.left = null;
        /** Правый потомок */
        this.right = null;
    }
}

/**
 * Класс бинарного дерева поиска (Binary Search Tree)
 * @class BinarySearchTree
 * Следует правилу: левые потомки ≤ текущего узла < правые потомки.
 */
class BinarySearchTree {
    /**
     * Создает пустое бинарное дерево поиска
     * @constructor
     */
    constructor() {
        this.root = null;
    }
    /**
     * Рекурсивная вставка элемента в дерево
     * @param value - Вставляемое значение
     */
    insert(value) {
        const insertNode = (node, val) => {
            if (node === null) {
                return new BSTNode(val);
            }
            if (val <= node.value) {
                node.left = insertNode(node.left, val);
            } else {
                node.right = insertNode(node.right, val);
            }
            return node;
        };
        this.root = insertNode(this.root, value);
    }
    /**
     * Рекурсивный поиск элемента в дереве
     * @param {number} value - Искомое значение
     * @returns {boolean} true - если элемент найден, false - в противном случае
     */
    search(value) {
        const searchNode = (node, val) => {
            if (node === null) return false;
            if (val === node.value) return true;
            if (val < node.value) return searchNode(node.left, val);
            return searchNode(node.right, val);
        };
        return searchNode(this.root, value);
    }
    /**
     * Рекурсивное удаление элемента из дерева
     * @param {number} value - Удаляемое значение
     * @returns {void}
     */
    delete(value) {
        const findMin = (node) => {
            while (node.left !== null) node = node.left;
            return node;
        };
        /**
         * Рекурсивная функция удаления узла
         * @param {BSTNode|null} node - Текущий узел
         * @param {number} val - Удаляемое значение
         * @returns {BSTNode|null} Измененный узел или null
         */
        const deleteNode = (node, val) => {
            if (node === null) return null;

            if (val < node.value) {
                node.left = deleteNode(node.left, val);
            } else if (val > node.value) {
                node.right = deleteNode(node.right, val);
            } else {
                // нет потомков
                if (node.left === null && node.right === null) {
                    return null;
                }
                //  только левый потомок
                if (node.left !== null && node.right === null) {
                    return node.left;
                }
                // только правый потомок
                if (node.right !== null && node.left === null) {
                    return node.right;
                }
                // два потомка
                const minRight = findMin(node.right);
                node.value = minRight.value;
                node.right = deleteNode(node.right, minRight.value);
            }
            return node;
        };

        this.root = deleteNode(this.root, value);
    }
}

/**
 * Класс узла AVL-дерева
 * @class AVLNode
 */
class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

/**
 * Класс AVL-дерева (самобалансирующееся бинарное дерево поиска)
 * @class AVLTree
 */
class AVLTree {
    /**
     * Создает пустое AVL-дерево
     * @constructor
     */
    constructor() {
        this.root = null;
    }
    /**
     * Возвращает высоту узла
     * @param {AVLNode|null} node - Узел дерева
     * @returns {number} Высота узла (0 для null)
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
     * Вычисляет баланс
     * @param {AVLNode|null} node - Узел дерева
     * @returns {number}  (высота_правого - высота_левого)
     */
    getBalanceFactor(node) {
        return node ? this.getHeight(node.right) - this.getHeight(node.left) : 0;
    }
    /**
     * Малый правый поворот
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
     * Малый левый поворот
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
     * Рекурсивный поиск элемента в дереве
     * @param {number} value - Искомое значение
     * @returns {boolean} true - если элемент найден, false - в противном случае
     */
    search(value) {
        const searchNode = (node, val) => {
            if (node === null) return false;
            if (val === node.value) return true;
            if (val < node.value) return searchNode(node.left, val);
            return searchNode(node.right, val);
        };
        return searchNode(this.root, value);
    }
    /**
     * Балансировка узла (применяет повороты при необходимости)
     * @param {AVLNode|null} node - Узел для балансировки
     * @returns {AVLNode|null} Сбалансированный узел
     *
     * @description
     * Применяет один из 4 поворотов:
     * - Малый правый: при левом перекосе с левым перекосом потомка
     * - Малый левый: при правом перекосе с правым перекосом потомка
     * - Большой правый: при левом перекосе с правым перекосом потомка
     * - Большой левый: при правом перекосе с левым перекосом потомка
     */
    balance(node) {
        if (node === null) return null;

        this.updateHeight(node);
        const factor = this.getBalanceFactor(node);

        if (factor === -2) {
            const leftFactor = this.getBalanceFactor(node.left);
            if (leftFactor <= 0) {
                return this.rotateRight(node);
            }
            if (leftFactor === 1) {
                node.left = this.rotateLeft(node.left);
                return this.rotateRight(node);
            }
        }
        else if (factor === 2) {
            const rightFactor = this.getBalanceFactor(node.right);
            if (rightFactor >= 0) {
                return this.rotateLeft(node);
            }
            if (rightFactor === -1) {
                node.right = this.rotateRight(node.right);
                return this.rotateLeft(node);
            }
        }
        return node;
    }
    /**
     * Рекурсивная вставка элемента в AVL-дерево
     * @param {number} value - Вставляемое значение
     * @returns {void}
     */
    insert(value) {
        const insertNode = (node, val) => {
            if (node === null) {
                return new AVLNode(val);
            }
            if (val < node.value) {
                node.left = insertNode(node.left, val);
            } else if (val > node.value) {
                node.right = insertNode(node.right, val);
            } else {
                return node;
            }
            return this.balance(node);
        };
        this.root = insertNode(this.root, value);
    }
    /**
     * Рекурсивное удаление элемента из AVL-дерева
     * @param {number} value - Удаляемое значение
     */
    delete(value) {
        const findMin = (node) => {
            while (node.left !== null) node = node.left;
            return node;
        };
        /**
         * Рекурсивная функция удаления узла
         * @param {AVLNode|null} node - Текущий узел
         * @param {number} val - Удаляемое значение
         * @returns {AVLNode|null} Измененный узел или null
         */
        const deleteNode = (node, val) => {
            if (node === null) return null;

            if (val < node.value) {
                node.left = deleteNode(node.left, val);
            } else if (val > node.value) {
                node.right = deleteNode(node.right, val);
            } else {
                if (node.left === null && node.right === null) {
                    return null;
                }
                if (node.left !== null && node.right === null) {
                    return node.left;
                }
                if (node.right !== null && node.left === null) {
                    return node.right;
                }
                const minRight = findMin(node.right);
                node.value = minRight.value;
                node.right = deleteNode(node.right, minRight.value);
            }
            return this.balance(node);
        };
        this.root = deleteNode(this.root, value);
    }
}

// -------------------------------
// 5. ТЕСТОВАЯ СИСТЕМА
// -------------------------------

/**
 * Размеры массивов для тестирования (2^(10+i))
 * @type {number[]}
 */
const sizes = [];
for (let i = 0; i < 10; i++) {
    sizes.push(Math.pow(2, 10 + i));
}
/**
 * Структуры для хранения результатов тестирования
 * @type {Object}
 */
const bstRandomResults = {};   // BST случайные данные
const bstSortedResults = {};   // BST отсортированные данные
const avlRandomResults = {};   // AVL случайные данные
const avlSortedResults = {};   // AVL отсортированные данные
const arrayRandomResults = {}; // Массив случайные данные
const arraySortedResults = {}; // Массив отсортированные данные

// Инициализация
for (const size of sizes) {
    bstRandomResults[size] = { insert: [], search: [], delete: [] };
    bstSortedResults[size] = { insert: [], search: [], delete: [] };
    avlRandomResults[size] = { insert: [], search: [], delete: [] };
    avlSortedResults[size] = { insert: [], search: [], delete: [] };
    arrayRandomResults[size] = { search: [] };
    arraySortedResults[size] = { search: [] };
}
/**
 * Генерирует массив случайных чисел
 * @param {number} size - Размер массива
 * @param {number} [maxValue=1000000] - Максимальное значение элемента
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
 * Генерирует отсортированный массив (по возрастанию)
 * @param {number} size - Размер массива
 * @returns {number[]} Отсортированный массив
 */
function generateSortedArray(size) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(i);
    }
    return arr;
}
/**
 * Линейный поиск в массиве
 * @param {number[]} arr - Массив для поиска
 * @param {number} target - Искомое значение
 * @returns {boolean} true - если элемент найден
 * @complexity O(n)
 */
function searchInArray(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return true;
    }
    return false;
}
/**
 * Бинарный поиск в отсортированном массиве
 * @param {number[]} arr - Отсортированный массив для поиска
 * @param {number} target - Искомое значение
 * @returns {boolean} true - если элемент найден
 * @complexity O(log n)
 */
function binarySearchInArray(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return true;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return false;
}

// Запуск тестов
for (const size of sizes) {
    const skipBSTsorted = size > 8192;

    console.log(`\nТест для N = ${size}`);

    // 20 тестов: 10 случайных + 10 отсортированных
    for (let test = 1; test <= 20; test++) {
        const isRandomPhase = test <= 10;
        const phaseName = isRandomPhase ? "СЛУЧАЙНЫЙ" : "ОТСОРТИРОВАННЫЙ";

        if (test === 1 || test === 11) {
            console.log(`${phaseName}`);
        }

        const data = isRandomPhase
            ? generateRandomArray(size, size * 2)
            : generateSortedArray(size);

        const skipBST = (!isRandomPhase && skipBSTsorted);

        // BST
        let bstInsertTime = 0, bstSearchAvg = 0, bstDeleteAvg = 0;
        if (!skipBST) {
            const bst = new BinarySearchTree();
            const bstInsertStart = performance.now();
            for (const val of data) bst.insert(val);
            bstInsertTime = performance.now() - bstInsertStart;

            // Поиск 1000 операций
            const searchTargets = [];
            for (let i = 0; i < 1000; i++) {
                if (isRandomPhase) {
                    searchTargets.push(Math.floor(Math.random() * (size * 2)));
                } else {
                    searchTargets.push(Math.floor(Math.random() * (size + 100)));
                }
            }

            const bstSearchStart = performance.now();
            for (const target of searchTargets) bst.search(target);
            bstSearchAvg = (performance.now() - bstSearchStart) / 1000;

            // Удаление 1000 операций
            const bstDeleteStart = performance.now();
            for (const target of searchTargets) bst.delete(target);
            bstDeleteAvg = (performance.now() - bstDeleteStart) / 1000;
        }

        // AVL
        const avl = new AVLTree();
        const avlInsertStart = performance.now();
        for (const val of data) avl.insert(val);
        const avlInsertTime = performance.now() - avlInsertStart;

        const searchTargets = [];
        for (let i = 0; i < 1000; i++) {
            if (isRandomPhase) {
                searchTargets.push(Math.floor(Math.random() * (size * 2)));
            } else {
                searchTargets.push(Math.floor(Math.random() * (size + 100)));
            }
        }

        const avlSearchStart = performance.now();
        for (const target of searchTargets) avl.search(target);
        const avlSearchAvg = (performance.now() - avlSearchStart) / 1000;

        const avlDeleteStart = performance.now();
        for (const target of searchTargets) avl.delete(target);
        const avlDeleteAvg = (performance.now() - avlDeleteStart) / 1000;

        // Массив
        let arraySearchTime = 0;
        if (isRandomPhase) {
            const arraySearchStart = performance.now();
            for (const target of searchTargets) searchInArray(data, target);
            arraySearchTime = (performance.now() - arraySearchStart) / 1000;
        } else {
            const arraySearchStart = performance.now();
            for (const target of searchTargets) binarySearchInArray(data, target);
            arraySearchTime = (performance.now() - arraySearchStart) / 1000;
        }

        // Сохраняем результаты
        if (!skipBST) {
            if (isRandomPhase) {
                bstRandomResults[size].insert.push(bstInsertTime);
                bstRandomResults[size].search.push(bstSearchAvg);
                bstRandomResults[size].delete.push(bstDeleteAvg);
            } else {
                bstSortedResults[size].insert.push(bstInsertTime);
                bstSortedResults[size].search.push(bstSearchAvg);
                bstSortedResults[size].delete.push(bstDeleteAvg);
            }
        }

        if (isRandomPhase) {
            avlRandomResults[size].insert.push(avlInsertTime);
            avlRandomResults[size].search.push(avlSearchAvg);
            avlRandomResults[size].delete.push(avlDeleteAvg);
            arrayRandomResults[size].search.push(arraySearchTime);
        } else {
            avlSortedResults[size].insert.push(avlInsertTime);
            avlSortedResults[size].search.push(avlSearchAvg);
            avlSortedResults[size].delete.push(avlDeleteAvg);
            arraySortedResults[size].search.push(arraySearchTime);
        }
    }
}

// Сохраняем CSV
console.log('\n📁 Сохранение результатов в CSV...');

let csvInsert = 'Size,DataType,Structure,Test,Time_ms\n';
let csvSearch = 'Size,DataType,Structure,Test,Time_us\n';
let csvDelete = 'Size,DataType,Structure,Test,Time_us\n';

for (const size of sizes) {
    // Вставка
    for (let t = 0; t < 10; t++) {
        if (bstRandomResults[size].insert[t] !== undefined) {
            csvInsert += `${size},random,BST,${t + 1},${bstRandomResults[size].insert[t].toFixed(3)}\n`;
        }
        csvInsert += `${size},random,AVL,${t + 1},${avlRandomResults[size].insert[t].toFixed(3)}\n`;

        if (bstSortedResults[size].insert[t] !== undefined) {
            csvInsert += `${size},sorted,BST,${t + 1},${bstSortedResults[size].insert[t].toFixed(3)}\n`;
        }
        csvInsert += `${size},sorted,AVL,${t + 1},${avlSortedResults[size].insert[t].toFixed(3)}\n`;
    }

    // Поиск (в микросекундах)
    for (let t = 0; t < 10; t++) {
        if (bstRandomResults[size].search[t] !== undefined) {
            csvSearch += `${size},random,BST,${t + 1},${(bstRandomResults[size].search[t] * 1000).toFixed(3)}\n`;
        }
        csvSearch += `${size},random,AVL,${t + 1},${(avlRandomResults[size].search[t] * 1000).toFixed(3)}\n`;
        csvSearch += `${size},random,Array,${t + 1},${(arrayRandomResults[size].search[t] * 1000).toFixed(3)}\n`;

        if (bstSortedResults[size].search[t] !== undefined) {
            csvSearch += `${size},sorted,BST,${t + 1},${(bstSortedResults[size].search[t] * 1000).toFixed(3)}\n`;
        }
        csvSearch += `${size},sorted,AVL,${t + 1},${(avlSortedResults[size].search[t] * 1000).toFixed(3)}\n`;
        csvSearch += `${size},sorted,Array,${t + 1},${(arraySortedResults[size].search[t] * 1000).toFixed(3)}\n`;
    }

    // Удаление (в микросекундах)
    for (let t = 0; t < 10; t++) {
        if (bstRandomResults[size].delete[t] !== undefined) {
            csvDelete += `${size},random,BST,${t + 1},${(bstRandomResults[size].delete[t] * 1000).toFixed(3)}\n`;
        }
        csvDelete += `${size},random,AVL,${t + 1},${(avlRandomResults[size].delete[t] * 1000).toFixed(3)}\n`;

        if (bstSortedResults[size].delete[t] !== undefined) {
            csvDelete += `${size},sorted,BST,${t + 1},${(bstSortedResults[size].delete[t] * 1000).toFixed(3)}\n`;
        }
        csvDelete += `${size},sorted,AVL,${t + 1},${(avlSortedResults[size].delete[t] * 1000).toFixed(3)}\n`;
    }
}

fs.writeFileSync('insert_results.csv', csvInsert);
fs.writeFileSync('search_results.csv', csvSearch);
fs.writeFileSync('delete_results.csv', csvDelete);
console.log('✅ Результаты сохранены в CSV файлы');

// Анализ и вывод статистики
console.log('\n' + '='.repeat(80));
console.log('СТАТИСТИКА РЕЗУЛЬТАТОВ');
console.log('='.repeat(80));

for (const size of sizes) {
    console.log(`\n📊 N = ${size}`);

    // Случайные данные
    console.log(`  Случайные данные:`);
    if (bstRandomResults[size].insert.length > 0) {
        const bstIns = bstRandomResults[size].insert;
        const bstSea = bstRandomResults[size].search;
        const bstDel = bstRandomResults[size].delete;
        console.log(`    BST вставка: мин=${Math.min(...bstIns).toFixed(2)}мс, макс=${Math.max(...bstIns).toFixed(2)}мс, сред=${(bstIns.reduce((a,b)=>a+b,0)/bstIns.length).toFixed(2)}мс`);
        console.log(`    BST поиск: мин=${(Math.min(...bstSea)*1000).toFixed(2)}мкс, макс=${(Math.max(...bstSea)*1000).toFixed(2)}мкс, сред=${(bstSea.reduce((a,b)=>a+b,0)/bstSea.length*1000).toFixed(2)}мкс`);
        console.log(`    BST удаление: мин=${(Math.min(...bstDel)*1000).toFixed(2)}мкс, макс=${(Math.max(...bstDel)*1000).toFixed(2)}мкс, сред=${(bstDel.reduce((a,b)=>a+b,0)/bstDel.length*1000).toFixed(2)}мкс`);
    } else {
        console.log(`    BST: данные недоступны (переполнение стека)`);
    }

    const avlIns = avlRandomResults[size].insert;
    const avlSea = avlRandomResults[size].search;
    const avlDel = avlRandomResults[size].delete;
    const arrSea = arrayRandomResults[size].search;
    console.log(`    AVL вставка: мин=${Math.min(...avlIns).toFixed(2)}мс, макс=${Math.max(...avlIns).toFixed(2)}мс, сред=${(avlIns.reduce((a,b)=>a+b,0)/avlIns.length).toFixed(2)}мс`);
    console.log(`    AVL поиск: мин=${(Math.min(...avlSea)*1000).toFixed(2)}мкс, макс=${(Math.max(...avlSea)*1000).toFixed(2)}мкс, сред=${(avlSea.reduce((a,b)=>a+b,0)/avlSea.length*1000).toFixed(2)}мкс`);
    console.log(`    AVL удаление: мин=${(Math.min(...avlDel)*1000).toFixed(2)}мкс, макс=${(Math.max(...avlDel)*1000).toFixed(2)}мкс, сред=${(avlDel.reduce((a,b)=>a+b,0)/avlDel.length*1000).toFixed(2)}мкс`);
    console.log(`    Массив поиск: мин=${(Math.min(...arrSea)*1000).toFixed(2)}мкс, макс=${(Math.max(...arrSea)*1000).toFixed(2)}мкс, сред=${(arrSea.reduce((a,b)=>a+b,0)/arrSea.length*1000).toFixed(2)}мкс`);

    // Отсортированные данные
    console.log(`  Отсортированные данные:`);
    if (bstSortedResults[size].insert.length > 0) {
        const bstIns = bstSortedResults[size].insert;
        const bstSea = bstSortedResults[size].search;
        const bstDel = bstSortedResults[size].delete;
        console.log(`    BST вставка: мин=${Math.min(...bstIns).toFixed(2)}мс, макс=${Math.max(...bstIns).toFixed(2)}мс, сред=${(bstIns.reduce((a,b)=>a+b,0)/bstIns.length).toFixed(2)}мс`);
        console.log(`    BST поиск: мин=${(Math.min(...bstSea)*1000).toFixed(2)}мкс, макс=${(Math.max(...bstSea)*1000).toFixed(2)}мкс, сред=${(bstSea.reduce((a,b)=>a+b,0)/bstSea.length*1000).toFixed(2)}мкс`);
        console.log(`    BST удаление: мин=${(Math.min(...bstDel)*1000).toFixed(2)}мкс, макс=${(Math.max(...bstDel)*1000).toFixed(2)}мкс, сред=${(bstDel.reduce((a,b)=>a+b,0)/bstDel.length*1000).toFixed(2)}мкс`);
    } else {
        console.log(`    BST: данные недоступны (переполнение стека при N > 8192)`);
    }

    const avlInsSorted = avlSortedResults[size].insert;
    const avlSeaSorted = avlSortedResults[size].search;
    const avlDelSorted = avlSortedResults[size].delete;
    const arrSeaSorted = arraySortedResults[size].search;
    console.log(`    AVL вставка: мин=${Math.min(...avlInsSorted).toFixed(2)}мс, макс=${Math.max(...avlInsSorted).toFixed(2)}мс, сред=${(avlInsSorted.reduce((a,b)=>a+b,0)/avlInsSorted.length).toFixed(2)}мс`);
    console.log(`    AVL поиск: мин=${(Math.min(...avlSeaSorted)*1000).toFixed(2)}мкс, макс=${(Math.max(...avlSeaSorted)*1000).toFixed(2)}мкс, сред=${(avlSeaSorted.reduce((a,b)=>a+b,0)/avlSeaSorted.length*1000).toFixed(2)}мкс`);
    console.log(`    AVL удаление: мин=${(Math.min(...avlDelSorted)*1000).toFixed(2)}мкс, макс=${(Math.max(...avlDelSorted)*1000).toFixed(2)}мкс, сред=${(avlDelSorted.reduce((a,b)=>a+b,0)/avlDelSorted.length*1000).toFixed(2)}мкс`);
    console.log(`    Массив поиск: мин=${(Math.min(...arrSeaSorted)*1000).toFixed(2)}мкс, макс=${(Math.max(...arrSeaSorted)*1000).toFixed(2)}мкс, сред=${(arrSeaSorted.reduce((a,b)=>a+b,0)/arrSeaSorted.length*1000).toFixed(2)}мкс`);
}

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

function drawAxes(ctx, padding, width, height, xValues, maxY, yLabel) {
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

    // Подписи осей
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('Размер массива (N)', width / 2, height - 30);

    ctx.save();
    ctx.translate(30, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Деления на оси X
    for (let i = 0; i < xValues.length; i++) {
        const x = padding.left + (i * xStep);
        const N = xValues[i];

        ctx.beginPath();
        ctx.moveTo(x, height - padding.bottom);
        ctx.lineTo(x, height - padding.bottom + 10);
        ctx.stroke();

        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText(N.toString(), x, height - padding.bottom + 25);
    }

    // Деления на оси Y
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
        if (yLabel.includes('мкс')) {
            ctx.fillText(value.toFixed(1) + ' мкс', padding.left - 15, y + 4);
        } else {
            ctx.fillText(value.toFixed(2) + ' мс', padding.left - 15, y + 4);
        }
    }

    return { graphWidth, graphHeight, xStep, xValues: xValues, maxY: maxY, height: height, padding: padding };
}

function drawLine(ctx, dataPoints, color, params, label = null) {
    const { xValues, maxY, graphHeight, height, padding, xStep } = params;

    if (!dataPoints || dataPoints.length === 0) return;

    // Фильтруем точки, где время не null
    const validPoints = dataPoints.filter(p => p.time !== null && p.time !== undefined);
    if (validPoints.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    let firstPoint = true;
    for (let i = 0; i < validPoints.length; i++) {
        const xIndex = xValues.indexOf(validPoints[i].N);
        if (xIndex === -1) continue;

        const x = padding.left + (xIndex * xStep);
        const y = height - padding.bottom - (validPoints[i].time / maxY * graphHeight);

        if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Рисуем точки
    ctx.fillStyle = color;
    for (let i = 0; i < validPoints.length; i++) {
        const xIndex = xValues.indexOf(validPoints[i].N);
        if (xIndex === -1) continue;

        const x = padding.left + (xIndex * xStep);
        const y = height - padding.bottom - (validPoints[i].time / maxY * graphHeight);

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Добавляем подпись для последней точки
        if (label && i === validPoints.length - 1) {
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.fillText(label, x + 10, y - 10);
        }
    }
}

function drawAllPoints(ctx, allPoints, params) {
    const { xValues, maxY, graphHeight, height, padding, xStep } = params;

    if (!allPoints || allPoints.length === 0) return;

    ctx.fillStyle = '#999999';
    ctx.globalAlpha = 0.3;

    for (const point of allPoints) {
        const xIndex = xValues.indexOf(point.N);
        if (xIndex === -1) continue;

        const x = padding.left + (xIndex * xStep);
        const y = height - padding.bottom - (point.time / maxY * graphHeight);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
}

function drawLegend(ctx, items, startX, startY) {
    let legendY = startY;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';

    for (const item of items) {
        ctx.fillStyle = item.color;
        ctx.fillRect(startX, legendY - 8, 20, 12);
        ctx.fillStyle = '#333333';
        ctx.fillText(item.text, startX + 30, legendY);
        legendY += 25;
    }
}

// Функции для подготовки данных
function prepareAvgData(results, metric, isMicroseconds = false) {
    const data = [];
    for (const size of sizes) {
        if (results[size] && results[size][metric] && results[size][metric].length > 0) {
            const avg = results[size][metric].reduce((a, b) => a + b, 0) / results[size][metric].length;
            let time = isMicroseconds ? avg * 1000 : avg;
            data.push({ N: size, time: time });
        } else {
            data.push({ N: size, time: null });
        }
    }
    return data;
}

function collectAllPoints(results, metric, isMicroseconds = false) {
    const points = [];
    for (const size of sizes) {
        if (results[size] && results[size][metric]) {
            for (const time of results[size][metric]) {
                points.push({ N: size, time: isMicroseconds ? time * 1000 : time });
            }
        }
    }
    return points;
}

const width = 1200;
const height = 800;
const padding = { left: 100, right: 50, top: 80, bottom: 80 };

// ==================== ГРАФИК 1: ВСТАВКА (случайные данные) ====================
console.log('\n📊 Построение графика 1/6: Вставка (случайные данные)...');

const insertRandomPoints = collectAllPoints(avlRandomResults, 'insert', false);
let maxY_insertRandom = Math.max(...insertRandomPoints.map(p => p.time), 1);
const bstInsertRandomPoints = collectAllPoints(bstRandomResults, 'insert', false);
if (bstInsertRandomPoints.length > 0) {
    maxY_insertRandom = Math.max(maxY_insertRandom, ...bstInsertRandomPoints.map(p => p.time));
}
maxY_insertRandom = maxY_insertRandom * 1.1;

const { canvas: canvas1, ctx: ctx1 } = setupCanvas(width, height, 'График 1: Вставка элементов (случайные данные)');
const params1 = drawAxes(ctx1, padding, width, height, sizes, maxY_insertRandom, 'Время вставки (мс)');

drawAllPoints(ctx1, insertRandomPoints, params1);
drawAllPoints(ctx1, bstInsertRandomPoints, params1);

const bstInsertAvg = prepareAvgData(bstRandomResults, 'insert', false);
const avlInsertAvg = prepareAvgData(avlRandomResults, 'insert', false);

drawLine(ctx1, bstInsertAvg, '#3498db', params1, 'BST');
drawLine(ctx1, avlInsertAvg, '#e74c3c', params1, 'AVL');

drawLegend(ctx1, [
    { color: '#3498db', text: 'BST (среднее)' },
    { color: '#e74c3c', text: 'AVL (среднее)' },
    { color: '#999999', text: 'Все точки замеров' }
], padding.left + 10, padding.top + 20);

fs.writeFileSync('chart_1_insert_random.png', canvas1.toBuffer('image/png'));
console.log('✅ chart_1_insert_random.png');

// ==================== ГРАФИК 2: ВСТАВКА (отсортированные данные) ====================
console.log('📊 Построение графика 2/6: Вставка (отсортированные данные)...');

const insertSortedPoints = collectAllPoints(avlSortedResults, 'insert', false);
let maxY_insertSorted = Math.max(...insertSortedPoints.map(p => p.time), 1);
const bstInsertSortedPoints = collectAllPoints(bstSortedResults, 'insert', false);
if (bstInsertSortedPoints.length > 0) {
    maxY_insertSorted = Math.max(maxY_insertSorted, ...bstInsertSortedPoints.map(p => p.time));
}
maxY_insertSorted = maxY_insertSorted * 1.1;

const { canvas: canvas2, ctx: ctx2 } = setupCanvas(width, height, 'График 2: Вставка элементов (отсортированные данные)');
const params2 = drawAxes(ctx2, padding, width, height, sizes, maxY_insertSorted, 'Время вставки (мс)');

drawAllPoints(ctx2, insertSortedPoints, params2);
drawAllPoints(ctx2, bstInsertSortedPoints, params2);

const bstInsertSortedAvg = prepareAvgData(bstSortedResults, 'insert', false);
const avlInsertSortedAvg = prepareAvgData(avlSortedResults, 'insert', false);

drawLine(ctx2, bstInsertSortedAvg, '#3498db', params2, 'BST');
drawLine(ctx2, avlInsertSortedAvg, '#e74c3c', params2, 'AVL');

drawLegend(ctx2, [
    { color: '#3498db', text: 'BST (среднее)' },
    { color: '#e74c3c', text: 'AVL (среднее)' },
    { color: '#999999', text: 'Все точки замеров' }
], padding.left + 10, padding.top + 20);

fs.writeFileSync('chart_2_insert_sorted.png', canvas2.toBuffer('image/png'));
console.log('✅ chart_2_insert_sorted.png');

// ==================== ГРАФИК 3: ПОИСК (случайные данные) ====================
console.log(' Построение графика 3/6: Поиск (случайные данные) с массивом...');

const searchRandomPoints = collectAllPoints(avlRandomResults, 'search', true);
let maxY_searchRandom = Math.max(...searchRandomPoints.map(p => p.time), 1);
const bstSearchRandomPoints = collectAllPoints(bstRandomResults, 'search', true);
if (bstSearchRandomPoints.length > 0) {
    maxY_searchRandom = Math.max(maxY_searchRandom, ...bstSearchRandomPoints.map(p => p.time));
}
const arraySearchRandomPoints = collectAllPoints(arrayRandomResults, 'search', true);
maxY_searchRandom = Math.max(maxY_searchRandom, ...arraySearchRandomPoints.map(p => p.time));
maxY_searchRandom = maxY_searchRandom * 1.1;

const { canvas: canvas3, ctx: ctx3 } = setupCanvas(width, height, 'График 3: Поиск элементов (случайные данные)');
const params3 = drawAxes(ctx3, padding, width, height, sizes, maxY_searchRandom, 'Время поиска (мкс)');

drawAllPoints(ctx3, searchRandomPoints, params3);
drawAllPoints(ctx3, bstSearchRandomPoints, params3);
drawAllPoints(ctx3, arraySearchRandomPoints, params3);

const bstSearchAvg = prepareAvgData(bstRandomResults, 'search', true);
const avlSearchAvg = prepareAvgData(avlRandomResults, 'search', true);
const arraySearchAvg = prepareAvgData(arrayRandomResults, 'search', true);

drawLine(ctx3, bstSearchAvg, '#3498db', params3, 'BST');
drawLine(ctx3, avlSearchAvg, '#e74c3c', params3, 'AVL');
drawLine(ctx3, arraySearchAvg, '#2ecc71', params3, 'Массив (линейный)');

drawLegend(ctx3, [
    { color: '#3498db', text: 'BST (среднее)' },
    { color: '#e74c3c', text: 'AVL (среднее)' },
    { color: '#2ecc71', text: 'Массив (линейный поиск)' },
    { color: '#999999', text: 'Все точки замеров' }
], padding.left + 10, padding.top + 20);

fs.writeFileSync('chart_3_search_random.png', canvas3.toBuffer('image/png'));
console.log('chart_3_search_random.png');

// ==================== ГРАФИК 4: ПОИСК (отсортированные данные) ====================
console.log('Построение графика 4/6: Поиск (отсортированные данные) с массивом...');

const searchSortedPoints = collectAllPoints(avlSortedResults, 'search', true);
let maxY_searchSorted = Math.max(...searchSortedPoints.map(p => p.time), 1);
const bstSearchSortedPoints = collectAllPoints(bstSortedResults, 'search', true);
if (bstSearchSortedPoints.length > 0) {
    maxY_searchSorted = Math.max(maxY_searchSorted, ...bstSearchSortedPoints.map(p => p.time));
}
const arraySearchSortedPoints = collectAllPoints(arraySortedResults, 'search', true);
maxY_searchSorted = Math.max(maxY_searchSorted, ...arraySearchSortedPoints.map(p => p.time));
maxY_searchSorted = maxY_searchSorted * 1.1;

const { canvas: canvas4, ctx: ctx4 } = setupCanvas(width, height, 'График 4: Поиск элементов (отсортированные данные)');
const params4 = drawAxes(ctx4, padding, width, height, sizes, maxY_searchSorted, 'Время поиска (мкс)');

drawAllPoints(ctx4, searchSortedPoints, params4);
drawAllPoints(ctx4, bstSearchSortedPoints, params4);
drawAllPoints(ctx4, arraySearchSortedPoints, params4);

const bstSearchSortedAvg = prepareAvgData(bstSortedResults, 'search', true);
const avlSearchSortedAvg = prepareAvgData(avlSortedResults, 'search', true);
const arraySearchSortedAvg = prepareAvgData(arraySortedResults, 'search', true);

drawLine(ctx4, bstSearchSortedAvg, '#3498db', params4, 'BST');
drawLine(ctx4, avlSearchSortedAvg, '#e74c3c', params4, 'AVL');
drawLine(ctx4, arraySearchSortedAvg, '#2ecc71', params4, 'Массив (бинарный)');

drawLegend(ctx4, [
    { color: '#3498db', text: 'BST (среднее)' },
    { color: '#e74c3c', text: 'AVL (среднее)' },
    { color: '#2ecc71', text: 'Массив (бинарный поиск)' },
    { color: '#999999', text: 'Все точки замеров' }
], padding.left + 10, padding.top + 20);

fs.writeFileSync('chart_4_search_sorted.png', canvas4.toBuffer('image/png'));
console.log('chart_4_search_sorted.png');

// ==================== ГРАФИК 5: УДАЛЕНИЕ (случайные данные) ====================
console.log('Построение графика 5/6: Удаление (случайные данные)...');

const deleteRandomPoints = collectAllPoints(avlRandomResults, 'delete', true);
let maxY_deleteRandom = Math.max(...deleteRandomPoints.map(p => p.time), 1);
const bstDeleteRandomPoints = collectAllPoints(bstRandomResults, 'delete', true);
if (bstDeleteRandomPoints.length > 0) {
    maxY_deleteRandom = Math.max(maxY_deleteRandom, ...bstDeleteRandomPoints.map(p => p.time));
}
maxY_deleteRandom = maxY_deleteRandom * 1.1;

const { canvas: canvas5, ctx: ctx5 } = setupCanvas(width, height, 'График 5: Удаление элементов (случайные данные)');
const params5 = drawAxes(ctx5, padding, width, height, sizes, maxY_deleteRandom, 'Время удаления (мкс)');

drawAllPoints(ctx5, deleteRandomPoints, params5);
drawAllPoints(ctx5, bstDeleteRandomPoints, params5);

const bstDeleteAvg = prepareAvgData(bstRandomResults, 'delete', true);
const avlDeleteAvg = prepareAvgData(avlRandomResults, 'delete', true);

drawLine(ctx5, bstDeleteAvg, '#3498db', params5, 'BST');
drawLine(ctx5, avlDeleteAvg, '#e74c3c', params5, 'AVL');

drawLegend(ctx5, [
    { color: '#3498db', text: 'BST (среднее)' },
    { color: '#e74c3c', text: 'AVL (среднее)' },
    { color: '#999999', text: 'Все точки замеров' }
], padding.left + 10, padding.top + 20);

fs.writeFileSync('chart_5_delete_random.png', canvas5.toBuffer('image/png'));
console.log('chart_5_delete_random.png');

// ==================== ГРАФИК 6: УДАЛЕНИЕ (отсортированные данные) ====================
console.log('Построение графика 6/6: Удаление (отсортированные данные)...');

const deleteSortedPoints = collectAllPoints(avlSortedResults, 'delete', true);
let maxY_deleteSorted = Math.max(...deleteSortedPoints.map(p => p.time), 1);
const bstDeleteSortedPoints = collectAllPoints(bstSortedResults, 'delete', true);
if (bstDeleteSortedPoints.length > 0) {
    maxY_deleteSorted = Math.max(maxY_deleteSorted, ...bstDeleteSortedPoints.map(p => p.time));
}
maxY_deleteSorted = maxY_deleteSorted * 1.1;

const { canvas: canvas6, ctx: ctx6 } = setupCanvas(width, height, 'График 6: Удаление элементов (отсортированные данные)');
const params6 = drawAxes(ctx6, padding, width, height, sizes, maxY_deleteSorted, 'Время удаления (мкс)');

drawAllPoints(ctx6, deleteSortedPoints, params6);
drawAllPoints(ctx6, bstDeleteSortedPoints, params6);

const bstDeleteSortedAvg = prepareAvgData(bstSortedResults, 'delete', true);
const avlDeleteSortedAvg = prepareAvgData(avlSortedResults, 'delete', true);

drawLine(ctx6, bstDeleteSortedAvg, '#3498db', params6, 'BST');
drawLine(ctx6, avlDeleteSortedAvg, '#e74c3c', params6, 'AVL');

drawLegend(ctx6, [
    { color: '#3498db', text: 'BST (среднее)' },
    { color: '#e74c3c', text: 'AVL (среднее)' },
    { color: '#999999', text: 'Все точки замеров' }
], padding.left + 10, padding.top + 20);

fs.writeFileSync('chart_6_delete_sorted.png', canvas6.toBuffer('image/png'));
console.log('✅ chart_6_delete_sorted.png');

// ==================== ВЫВОД ИТОГОВ ====================
console.log('\n' + '='.repeat(80));
console.log('ВСЕ 6 ГРАФИКОВ СОЗДАНЫ!');
console.log('='.repeat(80));
console.log('\nСохранённые файлы:');
console.log('   chart_1_insert_random.png     - Вставка (случайные данные)');
console.log('  chart_2_insert_sorted.png     - Вставка (отсортированные данные)');
console.log('  chart_3_search_random.png     - Поиск (случайные данные) + МАССИВ');
console.log('  chart_4_search_sorted.png     - Поиск (отсортированные данные) + МАССИВ');
console.log('   chart_5_delete_random.png     - Удаление (случайные данные)');
console.log('   chart_6_delete_sorted.png     - Удаление (отсортированные данные)');
