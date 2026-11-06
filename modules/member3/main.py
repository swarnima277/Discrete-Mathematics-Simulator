
from math import gcd


def process_message(message, formula, description):
    result = ""
    steps = []

    for char in message:
        if char.isascii() and char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            x = ord(char) - base
            y = formula(x)
            output = chr(y + base)

            result += output
            steps.append((char, x, description(x), y, output))
        else:
            result += char
            steps.append((char, "-", "-", "-", char))

    return result, steps


def caesar_encrypt(message, key):
    return process_message(
        message,
        lambda x: (x + key) % 26,
        lambda x: f"({x}+{key}) % 26"
    )


def caesar_decrypt(message, key):
    return process_message(
        message,
        lambda x: (x - key) % 26,
        lambda x: f"({x}-{key}) % 26"
    )


def affine_encrypt(message, a, b):
    if gcd(a, 26) != 1:
        raise ValueError("Invalid key: gcd(a, 26) must equal 1.")

    return process_message(
        message,
        lambda x: (a * x + b) % 26,
        lambda x: f"({a}*{x}+{b}) % 26"
    )


def affine_decrypt(message, a, b):
    if gcd(a, 26) != 1:
        raise ValueError("Invalid key: gcd(a, 26) must equal 1.")

    inverse = pow(a, -1, 26)

    return process_message(
        message,
        lambda y: (inverse * (y - b)) % 26,
        lambda y: f"({inverse}*({y}-{b})) % 26"
    )


def read_integer(prompt):
    while True:
        try:
            return int(input(prompt))
        except ValueError:
            print("Invalid input! Please enter a whole number.")


def display_steps(steps):
    print("\nStep-by-step conversion:")
    print(
        f"{'Input':<8}{'Number':<9}"
        f"{'Formula':<24}{'Result':<9}{'Output':<8}"
    )
    print("-" * 58)

    for char, number, formula, result, output in steps:
        print(
            f"{char:<8}{str(number):<9}"
            f"{formula:<24}{str(result):<9}{output:<8}"
        )


def main():
    print("\n=== Classical Cryptography Simulator ===")
    print("1. Caesar Cipher - Encrypt")
    print("2. Caesar Cipher - Decrypt")
    print("3. Affine Cipher - Encrypt")
    print("4. Affine Cipher - Decrypt")

    choice = input("Choose an option (1-4): ").strip()

    if choice not in ("1", "2", "3", "4"):
        print("Invalid option! Please choose 1, 2, 3, or 4.")
        return

    message = input("Enter your message: ")

    try:
        if choice in ("1", "2"):
            key = read_integer("Enter key (0-25): ")

            if not 0 <= key <= 25:
                print("Invalid key! Enter a number from 0 to 25.")
                return

            if choice == "1":
                result, steps = caesar_encrypt(message, key)
            else:
                result, steps = caesar_decrypt(message, key)

        else:
            a = read_integer("Enter key a: ")
            b = read_integer("Enter key b (0-25): ")

            if not 0 <= b <= 25:
                print("Invalid key! b must be from 0 to 25.")
                return

            if choice == "3":
                result, steps = affine_encrypt(message, a, b)
            else:
                result, steps = affine_decrypt(message, a, b)

        print("\nResult:", result)
        display_steps(steps)

    except ValueError as error:
        print("Error:", error)


if __name__ == "__main__":
    main()
