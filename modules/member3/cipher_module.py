
from math import gcd


def caesar_encrypt(message, key):
    if not isinstance(key, int) or not 0 <= key <= 25:
        raise ValueError("Caesar key must be between 0 and 25.")

    return _process(message, lambda x: (x + key) % 26)


def caesar_decrypt(message, key):
    if not isinstance(key, int) or not 0 <= key <= 25:
        raise ValueError("Caesar key must be between 0 and 25.")

    return _process(message, lambda x: (x - key) % 26)


def affine_encrypt(message, a, b):
    _validate_affine_keys(a, b)
    return _process(message, lambda x: (a * x + b) % 26)


def affine_decrypt(message, a, b):
    _validate_affine_keys(a, b)
    inverse = pow(a, -1, 26)
    return _process(message, lambda y: (inverse * (y - b)) % 26)


def _validate_affine_keys(a, b):
    if not isinstance(a, int) or gcd(a, 26) != 1:
        raise ValueError("Key 'a' must be coprime with 26.")

    if not isinstance(b, int) or not 0 <= b <= 25:
        raise ValueError("Key 'b' must be between 0 and 25.")


def _process(message, formula):
    if not isinstance(message, str):
        raise TypeError("Message must be a string.")

    result = []

    for char in message:
        if char.isascii() and char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            number = ord(char) - base
            result.append(chr(formula(number) + base))
        else:
            result.append(char)

    return "".join(result)
