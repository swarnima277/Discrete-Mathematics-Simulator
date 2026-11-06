"""
rsa_core.py  --  Member 4: RSA Cryptography Simulator (core math engine)

Discrete-math topics implemented here:
  * Prime numbers (trial division + Miller-Rabin)
  * GCD and the Euclidean Algorithm
  * Extended Euclidean Algorithm  ->  multiplicative inverse
  * Euler's Phi function
  * Modular exponentiation (square-and-multiply)
  * Euler's Theorem / Fermat's Little Theorem (verification)
  * RSA key generation, encryption and decryption

Every important function can record human-readable "steps" so the CLI and
GUI can show the working, exactly like a hand calculation.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


# --------------------------------------------------------------------------
# Primes
# --------------------------------------------------------------------------
_SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]


def is_prime(n: int) -> bool:
    """Miller-Rabin primality test (deterministic for n < 3.3 * 10^24)."""
    if n < 2:
        return False
    for p in _SMALL_PRIMES:
        if n == p:
            return True
        if n % p == 0:
            return False
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2
        r += 1
    for a in _SMALL_PRIMES:
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True


def generate_prime(bits: int, rng: Optional[random.Random] = None) -> int:
    """Return a random prime with exactly `bits` bits."""
    if bits < 2:
        raise ValueError("bits must be at least 2")
    rng = rng or random.SystemRandom()
    while True:
        candidate = rng.getrandbits(bits) | (1 << (bits - 1)) | 1
        if is_prime(candidate):
            return candidate


def prime_factorization(n: int) -> List[Tuple[int, int]]:
    """Prime factorization by trial division -> [(prime, exponent), ...]."""
    if n < 2:
        raise ValueError("n must be >= 2")
    factors, p = [], 2
    while p * p <= n:
        if n % p == 0:
            e = 0
            while n % p == 0:
                n //= p
                e += 1
            factors.append((p, e))
        p += 1 if p == 2 else 2
    if n > 1:
        factors.append((n, 1))
    return factors


def euler_phi(n: int) -> int:
    """Euler's phi function for any n >= 1 (via prime factorization)."""
    if n == 1:
        return 1
    result = n
    for p, _ in prime_factorization(n):
        result = result // p * (p - 1)
    return result


# --------------------------------------------------------------------------
# GCD / Extended Euclid / inverses
# --------------------------------------------------------------------------
def gcd_trace(a: int, b: int) -> Tuple[int, List[str]]:
    """Euclidean algorithm with a written trace."""
    steps = []
    x, y = a, b
    while y:
        steps.append(f"{x} = {x // y} * {y} + {x % y}")
        x, y = y, x % y
    steps.append(f"gcd({a}, {b}) = {x}")
    return x, steps


def extended_gcd(a: int, b: int) -> Tuple[int, int, int]:
    """Return (g, x, y) with a*x + b*y = g = gcd(a, b)."""
    old_r, r = a, b
    old_x, x = 1, 0
    old_y, y = 0, 1
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_x, x = x, old_x - q * x
        old_y, y = y, old_y - q * y
    return old_r, old_x, old_y


def extended_gcd_table(a: int, b: int) -> Tuple[Tuple[int, int, int], List[str]]:
    """Extended Euclid with a printable table of every iteration."""
    rows = [f"{'q':>6} {'r':>10} {'x':>10} {'y':>10}", "-" * 40]
    old_r, r = a, b
    old_x, x = 1, 0
    old_y, y = 0, 1
    rows.append(f"{'-':>6} {old_r:>10} {old_x:>10} {old_y:>10}")
    rows.append(f"{'-':>6} {r:>10} {x:>10} {y:>10}")
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_x, x = x, old_x - q * x
        old_y, y = y, old_y - q * y
        rows.append(f"{q:>6} {r:>10} {x:>10} {y:>10}")
    rows.append("-" * 40)
    rows.append(f"gcd = {old_r},  {a}*({old_x}) + {b}*({old_y}) = {old_r}")
    return (old_r, old_x, old_y), rows


def mod_inverse(a: int, m: int) -> int:
    """Multiplicative inverse of a modulo m (raises if it does not exist)."""
    g, x, _ = extended_gcd(a % m, m)
    if g != 1:
        raise ValueError(f"{a} has no inverse modulo {m} (gcd = {g})")
    return x % m


# --------------------------------------------------------------------------
# Modular exponentiation
# --------------------------------------------------------------------------
def mod_pow_trace(base: int, exp: int, mod: int) -> Tuple[int, List[str]]:
    """Square-and-multiply (right-to-left) with a per-bit trace."""
    if mod < 1 or exp < 0:
        raise ValueError("need mod >= 1 and exp >= 0")
    steps = [f"Compute {base}^{exp} mod {mod}   (exponent in binary: {bin(exp)[2:]})"]
    result, b, e, i = 1 % mod, base % mod, exp, 0
    while e > 0:
        bit = e & 1
        if bit:
            new_result = (result * b) % mod
            steps.append(f"bit {i} = 1: result = {result} * {b} mod {mod} = {new_result}")
            result = new_result
        else:
            steps.append(f"bit {i} = 0: skip multiply (result stays {result})")
        e >>= 1
        if e:
            new_b = (b * b) % mod
            steps.append(f"          square: base = {b}^2 mod {mod} = {new_b}")
            b = new_b
        i += 1
    steps.append(f"Result: {base}^{exp} mod {mod} = {result}")
    return result, steps


# --------------------------------------------------------------------------
# Euler / Fermat verification
# --------------------------------------------------------------------------
def verify_euler(a: int, n: int, phi: Optional[int] = None) -> Tuple[bool, List[str]]:
    """Check Euler's theorem: gcd(a,n)=1  =>  a^phi(n) = 1 (mod n)."""
    g = math.gcd(a, n)
    steps = [f"gcd({a}, {n}) = {g}"]
    if g != 1:
        steps.append("gcd != 1, so Euler's theorem does not apply to this a.")
        return False, steps
    phi = phi if phi is not None else euler_phi(n)
    value = pow(a, phi, n)
    steps.append(f"phi({n}) = {phi}")
    steps.append(f"{a}^{phi} mod {n} = {value}")
    ok = value == 1
    steps.append("Euler's theorem holds." if ok else "Unexpected result!")
    return ok, steps


def verify_fermat(a: int, p: int) -> Tuple[bool, List[str]]:
    """Check Fermat's little theorem: p prime, p∤a  =>  a^(p-1) = 1 (mod p)."""
    if not is_prime(p):
        return False, [f"{p} is not prime, Fermat's little theorem does not apply."]
    if a % p == 0:
        return False, [f"{p} divides {a}, Fermat's little theorem does not apply."]
    value = pow(a, p - 1, p)
    return value == 1, [f"{a}^({p}-1) mod {p} = {a}^{p - 1} mod {p} = {value}"]


# --------------------------------------------------------------------------
# RSA
# --------------------------------------------------------------------------
@dataclass
class RSAKeyPair:
    p: int
    q: int
    n: int
    phi: int
    e: int
    d: int
    steps: List[str] = field(default_factory=list)

    @property
    def public_key(self) -> Tuple[int, int]:
        return self.e, self.n

    @property
    def private_key(self) -> Tuple[int, int]:
        return self.d, self.n


_E_CANDIDATES = [65537, 257, 17, 5, 3]


def _choose_e(phi: int, rng: random.Random) -> int:
    for cand in _E_CANDIDATES:
        if cand < phi and math.gcd(cand, phi) == 1:
            return cand
    # tiny phi: search for any valid e
    options = [x for x in range(2, phi) if math.gcd(x, phi) == 1]
    if not options:
        raise ValueError("phi(n) is too small to pick a public exponent; use larger primes")
    return rng.choice(options)


def generate_keys(
    p: Optional[int] = None,
    q: Optional[int] = None,
    e: Optional[int] = None,
    bits: int = 8,
    rng: Optional[random.Random] = None,
) -> RSAKeyPair:
    """
    Generate an RSA key pair with a full written derivation.

    p, q : supply your own primes, or leave None to generate random ones
    e    : supply your own public exponent, or leave None to auto-select
    bits : bit length of each random prime (when p / q are not supplied)
    """
    rng = rng or random.SystemRandom()
    steps: List[str] = []

    # Step 1: primes
    if p is None or q is None:
        steps.append(f"STEP 1: Generate two random {bits}-bit primes (Miller-Rabin tested).")
        if p is None:
            p = generate_prime(bits, rng)
        if q is None:
            q = generate_prime(bits, rng)
            while q == p:
                q = generate_prime(bits, rng)
    else:
        steps.append("STEP 1: Use the supplied primes.")
    if not is_prime(p):
        raise ValueError(f"p = {p} is not prime")
    if not is_prime(q):
        raise ValueError(f"q = {q} is not prime")
    if p == q:
        raise ValueError("p and q must be different primes")
    steps.append(f"        p = {p}, q = {q}  (both prime)")

    # Step 2: n
    n = p * q
    steps.append(f"STEP 2: n = p * q = {p} * {q} = {n}")

    # Step 3: phi
    phi = (p - 1) * (q - 1)
    steps.append(
        f"STEP 3: phi(n) = (p-1)(q-1) = {p - 1} * {q - 1} = {phi}"
        "   (phi is multiplicative; phi(p) = p-1 for prime p)"
    )

    # Step 4: e
    if e is None:
        e = _choose_e(phi, rng)
        steps.append(f"STEP 4: Pick public exponent e = {e} with 1 < e < phi(n) and gcd(e, phi) = 1.")
    else:
        steps.append(f"STEP 4: Check supplied public exponent e = {e}.")
    if not (1 < e < phi):
        raise ValueError(f"e must satisfy 1 < e < phi(n) = {phi}")
    g, gcd_steps = gcd_trace(e, phi)
    if g != 1:
        raise ValueError(f"e = {e} is not coprime to phi(n) = {phi} (gcd = {g})")
    steps.extend("        " + s for s in gcd_steps)

    # Step 5: d
    steps.append(f"STEP 5: d = e^(-1) mod phi(n), using the Extended Euclidean Algorithm:")
    (g, x, _y), table = extended_gcd_table(e, phi)
    steps.extend("        " + row for row in table)
    d = x % phi
    steps.append(f"        d = {x} mod {phi} = {d}")

    # Step 6: verify
    check = (e * d) % phi
    steps.append(f"STEP 6: Verify e*d mod phi(n) = {e}*{d} mod {phi} = {check}  ->  {'OK' if check == 1 else 'FAIL'}")
    assert check == 1

    steps.append(f"PUBLIC KEY  (e, n) = ({e}, {n})")
    steps.append(f"PRIVATE KEY (d, n) = ({d}, {n})")
    return RSAKeyPair(p, q, n, phi, e, d, steps)


def explain_correctness(key: RSAKeyPair, m: Optional[int] = None) -> List[str]:
    """Show WHY decryption works, using Euler's theorem."""
    n, phi, e, d = key.n, key.phi, key.e, key.d
    k = (e * d - 1) // phi
    lines = [
        "WHY RSA WORKS",
        f"  e*d = {e}*{d} = {e * d} = 1 + k*phi(n)  with k = {k}",
        f"  so  m^(e*d) = m * (m^phi(n))^k  (mod n)",
        "  If gcd(m, n) = 1, Euler's theorem gives m^phi(n) = 1 (mod n),",
        "  hence  m^(e*d) = m  (mod n).",
        "  (For gcd(m, n) != 1 it still holds, via Fermat's little theorem mod p and mod q",
        "   and the Chinese Remainder Theorem.)",
    ]
    if m is not None and 0 < m < n:
        ok, st = verify_euler(m, n, phi)
        lines.append(f"  Check with m = {m}:")
        lines.extend("    " + s for s in st)
    return lines


def encrypt_number(m: int, e: int, n: int) -> Tuple[int, List[str]]:
    if not (0 <= m < n):
        raise ValueError(f"message number must satisfy 0 <= m < n = {n}")
    c, steps = mod_pow_trace(m, e, n)
    return c, [f"ENCRYPT: c = m^e mod n = {m}^{e} mod {n}"] + steps


def decrypt_number(c: int, d: int, n: int) -> Tuple[int, List[str]]:
    if not (0 <= c < n):
        raise ValueError(f"ciphertext number must satisfy 0 <= c < n = {n}")
    m, steps = mod_pow_trace(c, d, n)
    return m, [f"DECRYPT: m = c^d mod n = {c}^{d} mod {n}"] + steps


def encrypt_text(text: str, e: int, n: int) -> Tuple[List[int], List[str]]:
    """Encrypt each character's Unicode code point separately."""
    bad = [ch for ch in text if ord(ch) >= n]
    if bad:
        raise ValueError(
            f"n = {n} is too small for character(s) {sorted(set(bad))!r} "
            f"(code point must be < n). Use larger primes (bits >= 8 handles ASCII)."
        )
    steps = [f"Each character is converted to its code point m, then c = m^{e} mod {n}."]
    cipher = []
    for ch in text:
        m = ord(ch)
        c = pow(m, e, n)
        cipher.append(c)
        steps.append(f"'{ch}' -> {m:>5} -> {m}^{e} mod {n} = {c}")
    return cipher, steps


def decrypt_text(cipher: List[int], d: int, n: int) -> Tuple[str, List[str]]:
    steps = [f"Each number c is converted back with m = c^{d} mod {n}, then to a character."]
    chars = []
    for c in cipher:
        if not (0 <= c < n):
            raise ValueError(f"ciphertext value {c} is outside 0..{n - 1}")
        m = pow(c, d, n)
        try:
            ch = chr(m)
        except (ValueError, OverflowError):
            raise ValueError(f"decrypted value {m} is not a valid character (wrong key?)")
        chars.append(ch)
        steps.append(f"{c:>8} -> {c}^{d} mod {n} = {m:>5} -> '{ch}'")
    return "".join(chars), steps


def parse_cipher(text: str) -> List[int]:
    """Parse 'a b c' or 'a, b, c' into a list of ints."""
    try:
        return [int(tok) for tok in text.replace(",", " ").split()]
    except ValueError:
        raise ValueError("ciphertext must be integers separated by spaces or commas")


# --------------------------------------------------------------------------
# Security demo: why small keys are insecure
# --------------------------------------------------------------------------
def break_small_key(e: int, n: int) -> Tuple[RSAKeyPair, List[str]]:
    """Factor n by trial division and rebuild the private key (educational)."""
    steps = [f"Attacker knows only the public key (e, n) = ({e}, {n})."]
    factors = prime_factorization(n)
    if len(factors) != 2 or any(exp != 1 for _, exp in factors):
        raise ValueError("n is not a product of two distinct primes")
    p, q = factors[0][0], factors[1][0]
    steps.append(f"Factor n by trial division: {n} = {p} * {q}")
    phi = (p - 1) * (q - 1)
    steps.append(f"phi(n) = {phi}")
    d = mod_inverse(e, phi)
    steps.append(f"d = e^(-1) mod phi = {d}  -> private key recovered!")
    steps.append("Real RSA uses primes so large (1024+ bits each) that this factoring is infeasible.")
    return RSAKeyPair(p, q, n, phi, e, d, steps), steps


# --------------------------------------------------------------------------
# Digital signatures (sign with d, verify with e)
# --------------------------------------------------------------------------
def sign_number(h: int, d: int, n: int) -> Tuple[int, List[str]]:
    if not (0 <= h < n):
        raise ValueError(f"hash value must satisfy 0 <= h < n = {n}")
    s, steps = mod_pow_trace(h, d, n)
    return s, [f"SIGN: s = h^d mod n = {h}^{d} mod {n}  (private key)"] + steps


def verify_signature(h: int, s: int, e: int, n: int) -> Tuple[bool, int, List[str]]:
    rec, steps = mod_pow_trace(s, e, n)
    ok = rec == h % n
    steps = [f"VERIFY: s^e mod n = {s}^{e} mod {n}  (public key)"] + steps
    steps.append(f"Recovered {rec} {'==' if ok else '!='} hash {h}  ->  {'VALID' if ok else 'INVALID'}")
    return ok, rec, steps
