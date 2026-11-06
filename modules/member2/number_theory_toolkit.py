"""
Number Theory Toolkit (Member 2)

Features:
  1. GCD calculator (with LCM, divisibility check, common divisors)
  2. Euclidean algorithm visualization (text bars)
  3. Extended Euclidean algorithm (Bezout coefficients)
  4. Additive inverse finder
  5. Multiplicative inverse finder
  6. Prime factorization (Fundamental Theorem of Arithmetic)
  7. Euler phi function calculator

Run:  python number_theory_toolkit.py
"""

from math import isqrt


# ---------------------------------------------------------------- core maths
def divides(a, b):
    """True if a | b (b = a*k for some integer k)."""
    return b == 0 if a == 0 else b % a == 0


def gcd(a, b):
    """Greatest common divisor via the Euclidean algorithm."""
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b
    return a


def lcm(a, b):
    return 0 if a == 0 or b == 0 else abs(a // gcd(a, b) * b)


def euclid_steps(a, b):
    """Return list of (a, b, q, r) with a = q*b + r, and the gcd."""
    a, b = abs(a), abs(b)
    steps = []
    while b:
        q, r = divmod(a, b)
        steps.append((a, b, q, r))
        a, b = b, r
    return steps, a


def extended_gcd(a, b):
    """Return (g, s, t, rows) with g = gcd(a, b) = a*s + b*t.
    rows holds (q, r, s, t) for each step of the table."""
    r0, r1, s0, s1, t0, t1 = a, b, 1, 0, 0, 1
    rows = [("-", r0, s0, t0), ("-", r1, s1, t1)]
    while r1:
        q = r0 // r1
        r0, r1 = r1, r0 - q * r1
        s0, s1 = s1, s0 - q * s1
        t0, t1 = t1, t0 - q * t1
        rows.append((q, r1, s1, t1))
    return r0, s0, t0, rows


def additive_inverse(a, n):
    """x with a + x = 0 (mod n)."""
    return (-a) % n


def multiplicative_inverse(a, n):
    """x with a*x = 1 (mod n), or None if gcd(a, n) != 1."""
    a %= n
    g, s, _, _ = extended_gcd(a, n)
    return s % n if g == 1 else None


def prime_factors(n):
    """Return ({prime: exponent}, ladder) using trial division.
    ladder lists (number, prime, quotient) division steps."""
    factors, ladder, m, p = {}, [], n, 2
    while p * p <= m:
        while m % p == 0:
            ladder.append((m, p, m // p))
            factors[p] = factors.get(p, 0) + 1
            m //= p
        p += 1 if p == 2 else 2
    if m > 1:
        ladder.append((m, m, 1))
        factors[m] = factors.get(m, 0) + 1
    return factors, ladder


def euler_phi(n):
    """phi(n) = product of p^(e-1) * (p-1) over prime powers p^e || n."""
    if n == 1:
        return 1, {}
    f, _ = prime_factors(n)
    result = 1
    for p, e in f.items():
        result *= p ** (e - 1) * (p - 1)
    return result, f


def divisors(n):
    small = [d for d in range(1, isqrt(n) + 1) if n % d == 0]
    return sorted(set(small + [n // d for d in small]))


# ---------------------------------------------------------------- formatting
def fmt_factors(f):
    return " x ".join(f"{p}^{e}" if e > 1 else str(p) for p, e in sorted(f.items()))


def table(headers, rows):
    cols = list(zip(headers, *rows))
    w = [max(len(str(x)) for x in c) for c in cols]
    line = "  ".join(str(h).rjust(w[i]) for i, h in enumerate(headers))
    out = [line, "-" * len(line)]
    for r in rows:
        out.append("  ".join(str(x).rjust(w[i]) for i, x in enumerate(r)))
    return "\n".join(out)


def bar(a, b, q, r, width=60):
    """Text picture of a = q*b + r: q blocks of b (#) then remainder (+)."""
    unit = width / a
    blocks = "".join("[" + "#" * max(1, round(b * unit) - 2) + "]" for _ in range(q)) if q <= 20 else f"[{q} blocks of {b}]"
    rem = "+" * max(1, round(r * unit)) if r else ""
    return f"{blocks}{rem}"


# ---------------------------------------------------------------- features
def feature_gcd():
    a, b = ask_int("a"), ask_int("b")
    if a == 0 and b == 0:
        print("gcd(0, 0) is undefined.")
        return
    g = gcd(a, b)
    print(f"\ngcd({a}, {b}) = {g}")
    print(f"lcm({a}, {b}) = {lcm(a, b)}   (gcd x lcm = {g * lcm(a, b)} = |a*b| = {abs(a * b)})")
    if g == 1:
        print("The numbers are coprime.")
    print(f"{a} | {b}? {divides(a, b)}    {b} | {a}? {divides(b, a)}")
    print("Common divisors:", divisors(g))
    print("Property: gcd(a, b) = gcd(b, a mod b), and gcd(a, b) divides every a*x + b*y.")


def feature_euclid():
    a, b = ask_int("a", 1), ask_int("b", 1)
    steps, g = euclid_steps(a, b)
    print("\nEuclidean algorithm (a = q*b + r):\n")
    print(table(["a", "b", "q", "r"], steps))
    print("\nVisualization  ([###] = one copy of b, +++ = remainder r):\n")
    for x, y, q, r in steps:
        print(f"{x} = {q} x {y} + {r}")
        print("  " + bar(x, y, q, r) + "\n")
    print(f"Last non-zero remainder: gcd({a}, {b}) = {g}")


def feature_extended():
    a, b = ask_int("a", 1), ask_int("b", 1)
    g, s, t, rows = extended_gcd(a, b)
    print("\nExtended Euclidean table (each row keeps r = a*s + b*t):\n")
    print(table(["q", "r", "s", "t"], rows))
    print(f"\ngcd({a}, {b}) = {g} = {a}*({s}) + {b}*({t})")
    print(f"Check: {a * s} + {b * t} = {a * s + b * t}")


def feature_additive():
    a, n = ask_int("a"), ask_int("modulus n", 2)
    x = additive_inverse(a, n)
    print(f"\nAdditive inverse of {a} mod {n} is {x}")
    print(f"Check: {a} + {x} = {a + x} = {(a + x) % n} (mod {n})")


def feature_multiplicative():
    a, n = ask_int("a"), ask_int("modulus n", 2)
    g = gcd(a % n, n)
    if g != 1:
        print(f"\nNo multiplicative inverse: gcd({a % n}, {n}) = {g}, not 1.")
        return
    am = a % n
    _, s, t, rows = extended_gcd(am, n)
    inv = s % n
    print(f"\ngcd({am}, {n}) = 1, so an inverse exists.\n")
    print(table(["q", "r", "s", "t"], rows))
    print(f"\n1 = {am}*({s}) + {n}*({t})  =>  {am}*({s}) = 1 (mod {n})")
    print(f"Multiplicative inverse of {a} mod {n} is {inv}")
    print(f"Check: {am} x {inv} = {am * inv} = {am * inv % n} (mod {n})")


def feature_factor():
    n = ask_int("n", 2)
    f, ladder = prime_factors(n)
    print("\nDivision ladder:\n")
    print(table(["number", "divide by", "quotient"], ladder))
    print(f"\n{n} = {fmt_factors(f)}" + ("  (prime)" if len(f) == 1 and sum(f.values()) == 1 else ""))
    tau = sigma = 1
    for p, e in f.items():
        tau *= e + 1
        sigma *= (p ** (e + 1) - 1) // (p - 1)
    print(f"Number of divisors: {tau}   Sum of divisors: {sigma}")


def feature_phi():
    n = ask_int("n", 1)
    phi, f = euler_phi(n)
    if n == 1:
        print("\nphi(1) = 1")
        return
    print(f"\n{n} = {fmt_factors(f)}")
    terms = " x ".join(f"{p}^{e - 1}*{p - 1}" if e > 1 else f"{p - 1}" for p, e in sorted(f.items()))
    print(f"phi({n}) = {terms} = {phi}")
    if n <= 150:
        print("Coprime to n:", [k for k in range(1, n + 1) if gcd(k, n) == 1])


# ---------------------------------------------------------------- UI
def ask_int(label, minimum=None):
    while True:
        raw = input(f"Enter {label}: ").strip()
        try:
            v = int(raw)
        except ValueError:
            print("  Please enter a whole number.")
            continue
        if minimum is not None and v < minimum:
            print(f"  Please enter a number >= {minimum}.")
            continue
        return v


MENU = [
    ("GCD calculator", feature_gcd),
    ("Euclidean algorithm visualization", feature_euclid),
    ("Extended Euclidean algorithm", feature_extended),
    ("Additive inverse finder", feature_additive),
    ("Multiplicative inverse finder", feature_multiplicative),
    ("Prime factorization", feature_factor),
    ("Euler phi function", feature_phi),
]


def main():
    while True:
        print("\n=== Number Theory Toolkit ===")
        for i, (name, _) in enumerate(MENU, 1):
            print(f"  {i}. {name}")
        print("  0. Exit")
        choice = input("Choose: ").strip()
        if choice == "0":
            break
        if choice.isdigit() and 1 <= int(choice) <= len(MENU):
            MENU[int(choice) - 1][1]()
        else:
            print("Invalid choice.")


if __name__ == "__main__":
    main()
