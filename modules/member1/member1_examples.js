/* Member 1 - "Try it" real-world example cards for the sidebar frontend.
   Fills the module's inputs and presses its own buttons; no calculation happens here. */
(() => {
  const set = o => { for (const k in o) $('#m1_' + k).value = o[k]; };
  const go = (vals, btn, card) => { set(vals); $('#' + card).scrollIntoView({ behavior: 'smooth' }); $('#m1_' + btn).click(); };
  exCards('#ex1', [
    { tag: 'Everyday · Clocks', t: 'Clock & time-zone maths', d: 'What time is it 100 hours after 9 AM? Clock arithmetic is mod 24: (9 + 100) mod 24 = 13, i.e. 1 PM.',
      run: () => { $('#m1_operation').value = 'addition'; go({ a: 9, b: 100, n: 24 }, 'calculateBtn', 'm1_calc_card'); } },
    { tag: 'Everyday · Calendars', t: 'Weekday of a future date', d: 'Weekdays repeat every 7 days. Wednesday is day 3 (Sunday = 0); 100 days later is (3 + 100) mod 7 = 5, a Friday.',
      run: () => { $('#m1_operation').value = 'addition'; go({ a: 3, b: 100, n: 7 }, 'calculateBtn', 'm1_calc_card'); } },
    { tag: 'Books · ISBN-10', t: 'ISBN check digit', d: 'The weighted digit sum of ISBN 0-306-40615-2 is 132. A valid ISBN-10 has sum ≡ 0 (mod 11) – check it.',
      run: () => go({ congA: 132, congB: 0, congN: 11 }, 'checkCongruenceBtn', 'm1_cong_card') },
    { tag: 'Computing · Hash tables', t: 'Which slot does a key go in?', d: 'Databases store a key in slot (key mod table size). See how keys 0–19 spread over a 5-slot table.',
      run: () => go({ remainderN: 5, rangeStart: 0, rangeEnd: 19 }, 'generateClassesBtn', 'm1_rem_card') },
    { tag: 'Cryptography · Affine cipher', t: 'Finding a decryption multiplier', d: 'Solving 5x ≡ 1 (mod 26) gives x = 21, the inverse of the Affine key a = 5 – exactly what decryption needs.',
      run: () => go({ linearA: 5, linearB: 1, linearN: 26 }, 'solveLinearBtn', 'm1_lin_card') }
  ]);
})();
