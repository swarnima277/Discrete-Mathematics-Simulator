"""Discrete Mathematics Simulator - run:  python app.py  (opens http://localhost:8000)
No pip installs needed. Members 1-4 are integrated here:
  Member 1 - modules/member1 (runs in the browser; served as static JS)
  Member 2 - modules/member2 (Number Theory Toolkit, API endpoints below)
  Member 3 / Member 4 - classical crypto and RSA, API endpoints below."""
import hashlib, json, os, threading, webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from modules.member3 import cipher_module as c3, main as s3   # Member 3 (classical crypto)
from modules.member4 import rsa_core as rc                    # Member 4 (RSA)
from modules.member2 import number_theory_toolkit as nt       # Member 2 (number theory)

ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


class Err(Exception):
    pass


def I(v, name):
    try:
        return int(str(v).strip())
    except ValueError:
        raise Err(f"{name} must be a whole number")


def rows(steps):
    return [[str(x) for x in r] for r in steps]


# ---------------- Member 2: Number Theory Toolkit ----------------
def m2_gcd(d):
    a, b = I(d.get("a"), "a"), I(d.get("b"), "b")
    if a == 0 and b == 0:
        raise Err("GCD of 0 and 0 is undefined.")
    g = nt.gcd(a, b)
    return {"gcd": g, "lcm": nt.lcm(a, b), "coprime": g == 1,
            "divisors": nt.divisors(g), "steps": rows(nt.euclid_steps(a, b)[0])}


def m2_extended_gcd(d):
    a, b = I(d.get("a"), "a"), I(d.get("b"), "b")
    g, s, t, steps = nt.extended_gcd(a, b)
    return {"gcd": g, "s": s, "t": t, "identity": f"{a}*({s}) + {b}*({t}) = {g}", "steps": rows(steps)}


def m2_inverse(d):
    a, n = I(d.get("a"), "a"), I(d.get("n"), "modulus")
    if n < 2:
        raise Err("Modulus must be at least 2.")
    return {"additive": nt.additive_inverse(a, n), "multiplicative": nt.multiplicative_inverse(a, n)}


def m2_factor(d):
    n = I(d.get("n"), "n")
    if n < 2:
        raise Err("Enter an integer greater than or equal to 2.")
    if n > 10 ** 13:
        raise Err("n is too large to factor in this demo (limit 10^13).")
    factors, ladder = nt.prime_factors(n)
    phi, _ = nt.euler_phi(n)
    return {"number": n, "factorization": nt.fmt_factors(factors),
            "factors": [[p, e] for p, e in sorted(factors.items())],
            "ladder": rows(ladder), "phi": phi, "divisors": nt.divisors(n)}


# ---------------- Member 3 ----------------
def m3_run(d):
    msg, enc = str(d.get("message", "")), d.get("mode") == "encrypt"
    if not msg.strip():
        raise Err("Enter a message first.")
    if d["cipher"] == "caesar":
        k = I(d.get("key"), "Key")
        f, g = (c3.caesar_encrypt, s3.caesar_encrypt) if enc else (c3.caesar_decrypt, s3.caesar_decrypt)
        out, steps = f(msg, k), g(msg, k)[1]
        return {"result": out, "steps": rows(steps), "map": c3.caesar_encrypt(ALPHA, k),
                "info": f"Caesar shift k = {k}:  E(x) = (x + {k}) mod 26,  D(y) = (y - {k}) mod 26"}
    a, b = I(d.get("a"), "a"), I(d.get("b"), "b")
    f, g = (c3.affine_encrypt, s3.affine_encrypt) if enc else (c3.affine_decrypt, s3.affine_decrypt)
    out, steps = f(msg, a, b), g(msg, a, b)[1]
    return {"result": out, "steps": rows(steps), "map": c3.affine_encrypt(ALPHA, a, b),
            "info": f"gcd({a}, 26) = 1 ✓   a⁻¹ mod 26 = {pow(a, -1, 26)}   E(x) = ({a}x + {b}) mod 26"}


def m3_brute(d):
    msg = str(d.get("message", ""))
    if not msg.strip():
        raise Err("Enter the ciphertext first.")
    return {"rows": [[k, c3.caesar_decrypt(msg, k)] for k in range(26)]}


# ---------------- Member 4 ----------------
def m4_keygen(d):
    def opt(x):
        return None if str(d.get(x, "")).strip() == "" else I(d[x], x)
    bits = I(d.get("bits") or 10, "bits")
    if not 4 <= bits <= 24:
        raise Err("bits must be between 4 and 24 (demo-sized keys).")
    k = rc.generate_keys(p=opt("p"), q=opt("q"), e=opt("e"), bits=bits)
    key = {x: str(getattr(k, x)) for x in ("p", "q", "n", "phi", "e", "d")}
    return {"key": key, "steps": k.steps + [""] + rc.explain_correctness(k)}


def m4_encrypt(d):
    e, n = I(d["e"], "e"), I(d["n"], "n")
    if d["mode"] == "number":
        c, st = rc.encrypt_number(I(d["value"], "Message"), e, n)
        return {"cipher": str(c), "steps": st}
    cipher, st = rc.encrypt_text(str(d["value"]), e, n)
    table = [[ch, ord(ch), c] for ch, c in zip(str(d["value"]), cipher)]
    return {"cipher": " ".join(map(str, cipher)), "steps": st, "table": rows(table)}


def m4_decrypt(d):
    dd, n = I(d["d"], "d"), I(d["n"], "n")
    if d["mode"] == "number":
        m, st = rc.decrypt_number(I(d["value"], "Ciphertext"), dd, n)
        return {"plain": str(m), "steps": st}
    nums = rc.parse_cipher(str(d["value"]))
    text, st = rc.decrypt_text(nums, dd, n)
    table = [[c, pow(c, dd, n), ch] for c, ch in zip(nums, text)]
    return {"plain": text, "steps": st, "table": rows(table)}


def _hash(msg, n):  # toy: real systems sign a full SHA-256 hash with padding
    return int.from_bytes(hashlib.sha256(msg.encode()).digest(), "big") % n


def m4_sign(d):
    n = I(d["n"], "n")
    h = _hash(str(d["message"]), n)
    s, st = rc.sign_number(h, I(d["d"], "d"), n)
    return {"hash": str(h), "signature": str(s), "steps": st}


def m4_verify(d):
    n = I(d["n"], "n")
    h = _hash(str(d["message"]), n)
    ok, rec, st = rc.verify_signature(h, I(d["signature"], "Signature"), I(d["e"], "e"), n)
    return {"valid": ok, "hash": str(h), "steps": st}


def m4_attack(d):
    n = I(d["n"], "n")
    if n > 10 ** 13:
        raise Err("n is too large to factor in this demo - which is exactly why real keys are huge.")
    k, st = rc.break_small_key(I(d["e"], "e"), n)
    return {"steps": st, "d": str(k.d)}


ROUTES = {"m2_gcd": m2_gcd, "m2_extended_gcd": m2_extended_gcd, "m2_inverse": m2_inverse,
          "m2_factor": m2_factor, "m3_run": m3_run, "m3_brute": m3_brute, "keygen": m4_keygen, "encrypt": m4_encrypt,
          "decrypt": m4_decrypt, "sign": m4_sign, "verify": m4_verify, "attack": m4_attack}
BASE = Path(__file__).parent
HTML = BASE / "index.html"
STATIC = {"/modules/member1/member1.js": "modules/member1/member1.js",
          "/modules/member1/member1_examples.js": "modules/member1/member1_examples.js",
          "/modules/member2/member2.js": "modules/member2/member2.js",
          "/modules/member1/member1_sim.js": "modules/member1/member1_sim.js",   # application simulators
          "/modules/member2/member2_sim.js": "modules/member2/member2_sim.js"}


for _p in sorted((BASE / "modules").glob("ui/*.js")) + sorted((BASE / "modules").glob("unit*/*.js")):  # Unit 1-6 simulators (browser scripts)
    STATIC["/modules/" + _p.relative_to(BASE / "modules").as_posix()] = _p.relative_to(BASE).as_posix()


class H(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/index.html"):
            self._send(200, HTML.read_bytes(), "text/html")
        elif path in STATIC:  # fixed whitelist of per-module browser scripts
            self._send(200, (BASE / STATIC[path]).read_bytes(), "application/javascript")
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        fn = ROUTES.get(self.path.removeprefix("/api/"))
        if not fn:
            return self._send(404, {"error": "unknown endpoint"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            self._send(200, fn(body))
        except (Err, ValueError, TypeError, KeyError) as ex:
            self._send(400, {"error": str(ex).strip("'") or "Invalid input"})

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    url = f"http://localhost:{port}"
    print(f"Discrete Math Simulator running at {url}  (Ctrl+C to stop)")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
