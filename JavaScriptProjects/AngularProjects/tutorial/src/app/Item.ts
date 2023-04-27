/* defines the type or object */
export interface Item {
    id: number;
    text?: string;
    color?: string;
    description?: string;
    toggle?: boolean;
}

export function isItem (object: any): object is Item {
    return object && typeof object.id === 'number';
}