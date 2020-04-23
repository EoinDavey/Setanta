import { RuntimeError } from "./error";

export function strrep(a: string, b: number): string {
    return a.repeat(b);
}

export function strcat(a: string, b: string): string {
    return a.concat(b);
}

// We don't use .replace directly because .replace only replaces first value
// unless you use RegEx, which would require us escaping special regex characters.
export function athchuir(a: string, b: string, c: string): string {
    return a.split(b).join(c);
}

export function unescapeChars(s: string): string {
    let out = "";
    const rep = new Map<string, string>([
        ["n", "\n"],
        ["r", "\r"],
        ["t", "\t"],
        ["0", "\0"],
        ["\\", "\\"],
        ["'", "'"],
        ["\"", "\""],
    ]);
    for (let i = 0; i < s.length; ++i) {
        if (s[i] !== "\\") {
            out += s[i];
            continue;
        }
        const g = rep.get(s[i + 1]);
        if (!g) {
            throw new RuntimeError(`Ní thuigtear an cód \\${s[i + 1]}`);
        }
        out += g;
        ++i;
    }
    return out;
}
