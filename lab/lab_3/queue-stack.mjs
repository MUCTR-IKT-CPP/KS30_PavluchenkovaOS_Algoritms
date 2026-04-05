/**
 * Модуль: Очередь на основе двух стеков (с использованием библиотечных стеков)
 * Левый стек - для операций вставки
 * Правый стек - для операций изъятия
 * Стеки реализованы через встроенные массивы JS (push/pop)
 * @module QueueStack
 */

// ====================== ИТЕРАТОР ДЛЯ ОЧЕРЕДИ ======================

/**
 * Итератор для очереди на двух стеках
 * @class StackQueueIterator
 * @template T
 * @implements {Iterator<T>}
 */
class StackQueueIterator {
    /**
     * Создает итератор
     * @param {Array<T>} items - Массив элементов для итерации
     */
    constructor(items) {
        /** @type {Array<T>} */
        this.items = items;
        /** @type {number} */
        this.index = 0;
    }

    /**
     * Возвращает следующий элемент в итерации
     * @returns {IteratorResult<T>} Результат итерации
     */
    next() {
        if (this.index >= this.items.length) {
            return { done: true, value: undefined };
        }
        return { value: this.items[this.index++], done: false };
    }

    /**
     * Возвращает сам итератор (для совместимости с for...of)
     * @returns {Iterator<T>}
     */
    [Symbol.iterator]() {
        return this;
    }
}

// ====================== ОЧЕРЕДЬ НА ДВУХ СТЕКАХ ======================

/**
 * Очередь на основе двух библиотечных стеков (встроенных массивов)
 * @template T
 * @class StackQueue
 */
class StackQueue {
    /**
     * Создает пустую очередь
     */
    constructor() {
        /** @type {Array<T>} Левый стек для вставки (input) - используется как стек */
        this.leftStack = [];
        /** @type {Array<T>} Правый стек для изъятия (output) - используется как стек */
        this.rightStack = [];
    }

    /**
     * ВСТАВКА В ОЧЕРЕДЬ (enqueue)
     * Использует библиотечный стек (массив) - операция push
     *
     * @param {T} data - Добавляемое значение
     * @returns {StackQueue<T>} Текущая очередь (для цепочки вызовов)
     */
    enqueue(data) {
        // Добавляем в левый стек (push - операция стека)
        this.leftStack.push(data);
        return this;
    }

    /**
     * Перенос элементов из левого стека в правый при необходимости
     * При попытке изъять из пустого правого стека,
     * все элементы левого помещаются в правый (инверсия порядка)
     * @private
     */
    _transferIfNeeded() {
        if (this.rightStack.length === 0) {
            // Переносим все элементы из leftStack в rightStack
            // pop из leftStack и push в rightStack - операции стека
            while (this.leftStack.length > 0) {
                this.rightStack.push(this.leftStack.pop());
            }
        }
    }

    /**
     * УДАЛЕНИЕ ИЗ ОЧЕРЕДИ (dequeue)
     * Использует библиотечный стек (массив) - операция pop
     *
     * @returns {T | undefined} Удаленное значение или undefined если очередь пуста
     */
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }
        this._transferIfNeeded();
        // Извлекаем из правого стека (pop - операция стека)
        return this.rightStack.pop();
    }

    /**
     * Просмотр первого элемента без удаления
     * @returns {T | undefined} Значение первого элемента или undefined если очередь пуста
     */
    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        this._transferIfNeeded();
        // Просмотр верхнего элемента правого стека (аналог peek для массива)
        return this.rightStack[this.rightStack.length - 1];
    }

    /**
     * Проверка очереди на пустоту
     * @returns {boolean} true если очередь пуста, иначе false
     */
    isEmpty() {
        return this.leftStack.length === 0 && this.rightStack.length === 0;
    }

    /**
     * Возвращает количество элементов в очереди
     * @returns {number} Количество элементов
     */
    size() {
        return this.leftStack.length + this.rightStack.length;
    }

    /**
     * Очищает очередь
     */
    clear() {
        this.leftStack = [];
        this.rightStack = [];
    }

    /**
     * Преобразует очередь в массив (с учетом порядка FIFO)
     * @returns {Array<T>} Массив элементов очереди в правильном порядке
     */
    toArray() {
        // Для правильного порядка FIFO:
        // 1. Элементы из правого стека идут в обратном порядке (потому что они были перенесены)
        // 2. Затем элементы из левого стека в прямом порядке
        const rightCopy = [...this.rightStack].reverse();
        return [...rightCopy, ...this.leftStack];
    }

    /**
     * Возвращает итератор для обхода элементов
     * @returns {Iterator<T>} Итератор
     */
    [Symbol.iterator]() {
        return new StackQueueIterator(this.toArray());
    }

    /**
     * Выполняет указанную функцию для каждого элемента очереди
     * @param {function(T, number): void} callback - Функция для выполнения
     * @param {T} callback.item - Текущий элемент
     * @param {number} callback.index - Индекс элемента
     */
    forEach(callback) {
        let index = 0;
        for (const item of this) {
            callback(item, index++);
        }
    }

    /**
     * Инвертирование содержимого (только через enqueue/dequeue)
     * @returns {StackQueue<T>} Текущая очередь
     */
    invert() {
        if (this.size() <= 1) return this;

        const temp = [];
        while (!this.isEmpty()) {
            temp.push(this.dequeue());
        }
        for (let i = temp.length - 1; i >= 0; i--) {
            this.enqueue(temp[i]);
        }
        return this;
    }
}

export default StackQueue;