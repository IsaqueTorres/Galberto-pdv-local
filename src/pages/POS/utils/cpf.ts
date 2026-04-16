export function onlyNumbers(value: string) {
    return value.replace(/\D/g, "");
}

export function formatCPF(value: string) {
    const digits = onlyNumbers(value).slice(0, 11);

    return digits
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function cpfValidator(cpf: string) {
    const clean = onlyNumbers(cpf);

    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += Number(clean[i]) * (10 - i);
    }

    let firstDigit = (sum * 10) % 11;
    if (firstDigit === 10) firstDigit = 0;
    if (firstDigit !== Number(clean[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += Number(clean[i]) * (11 - i);
    }

    let secondDigit = (sum * 10) % 11;
    if (secondDigit === 10) secondDigit = 0;

    return secondDigit === Number(clean[10]);
}