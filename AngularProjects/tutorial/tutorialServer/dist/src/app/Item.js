"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isItem = void 0;
function isItem(object) {
    return object && typeof object.id === 'number';
}
exports.isItem = isItem;
