export type Value = number | boolean;

export function isTrue(v : Value) {
    return v !== 0 && v !== false;
}
