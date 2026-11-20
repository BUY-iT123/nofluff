const replacements = new Map([
  ["i", "I"], ["im", "I'm"], ["ive", "I've"], ["id", "I'd"], ["ill", "I'll"],
  ["dont", "don't"], ["cant", "can't"], ["wont", "won't"], ["didnt", "didn't"],
  ["doesnt", "doesn't"], ["isnt", "isn't"], ["yrs", "years"], ["ppl", "people"],
  ["bc", "because"], ["thx", "thanks"], ["u", "you"], ["ur", "your"],
]);

const itsContexts = new Set([
  "not", "that", "been", "so", "just", "like", "going", "because", "time", "what",
  "how", "why", "still", "only", "really", "about", "fine", "okay", "the", "a",
]);

export function rewrite(text) {
  const tokens = text.match(/\s+|[\p{L}\p{N}’']+|[^\s\p{L}\p{N}’']+/gu) ?? [];
  const segs = [];
  let changed = 0;
  let sentenceStart = true;
  const words = tokens.map((token, index) => ({ token, index })).filter(({ token }) => /^[\p{L}\p{N}’']+$/u.test(token));
  const nextWordByIndex = new Map(words.map((word, index) => [word.index, words[index + 1]?.token?.toLowerCase()]));

  tokens.forEach((token, index) => {
    if (/^\s+$/u.test(token)) {
      segs.push({ t: token, c: false });
      return;
    }

    if (/^[\p{L}\p{N}’']+$/u.test(token)) {
      const lower = token.toLowerCase();
      let replacement = lower === "its" && itsContexts.has(nextWordByIndex.get(index)) ? "it's" : replacements.get(lower) ?? token;
      if (sentenceStart && replacement) replacement = replacement[0].toUpperCase() + replacement.slice(1);
      const didChange = replacement !== token;
      if (didChange) changed += 1;
      segs.push({ t: replacement, c: didChange });
      sentenceStart = false;
      return;
    }

    segs.push({ t: token, c: false });
    if (/[.!?]/u.test(token)) sentenceStart = true;
  });

  segs.forEach((segment, index) => {
    if (!/^\s+$/u.test(segment.t)) return;
    const before = segs[index - 1];
    const after = segs[index + 1];
    segment.c = Boolean(before?.c && after?.c);
  });

  const finalText = segs.map(({ t }) => t).join("").trimEnd();
  if (finalText && !/[.!?…]$/u.test(finalText)) segs.push({ t: ".", c: false });
  return { segs, changed };
}
