"""
Cálculo de entropia de Shannon para detectar strings com alta aleatoriedade.
Útil para identificar possíveis chaves/tokens que não seguem padrões fixos.
"""

import math
import re


def shannon_entropy(data: str) -> float:
    """
    Calcula a entropia de Shannon de uma string.
    Quanto maior, mais aleatória é a string (potencialmente uma chave/secret).
    """
    if not data:
        return 0.0

    # Normaliza para análise
    data = data.strip()

    # Frequência de cada caractere
    freq = {}
    for c in data:
        freq[c] = freq.get(c, 0) + 1

    length = len(data)
    entropy = 0.0
    for count in freq.values():
        prob = count / length
        if prob > 0:
            entropy -= prob * math.log2(prob)

    return entropy


def has_high_entropy(data: str, threshold: float = 4.5) -> bool:
    """
    Verifica se a string tem entropia alta (indicativo de chave/secret).
    threshold típico: 4.5 para strings base64, 3.5 para hex.
    """
    return shannon_entropy(data) >= threshold


def high_entropy_strings(
    text: str,
    min_length: int = 20,
    max_length: int = 200,
    threshold: float = 4.5,
) -> list[str]:
    """
    Extrai do texto todas as strings com alta entropia (>= threshold) e
    comprimento entre min_length e max_length.

    Útil para encontrar tokens que não seguem padrões de regex conhecidos.
    """
    # Encontra palavras/strings potenciais usando regex de caracteres alfanuméricos e símbolos
    candidates = re.findall(r"[A-Za-z0-9+/=_-]{%d,%d}" % (min_length, max_length), text)

    results = []
    for candidate in candidates:
        # Ignora strings muito comuns (UUIDs, hashes muito longos, etc.)
        if re.match(r'^[0-9a-fA-F\-]{36}$', candidate):  # UUID
            continue
        if has_high_entropy(candidate, threshold):
            results.append(candidate)

    return results