export function countSentences(text) {
  if (!text.trim()) return 0;
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });
    return [...segmenter.segment(text)].filter(({ segment }) => segment.trim()).length;
  }
  return (text.match(/[^.!?]+(?:[.!?]+|$)/g) ?? []).filter((sentence) => sentence.trim()).length;
}

export function shouldShowPostReady(text, isLoading = false) {
  return !isLoading && countSentences(text) > 1;
}

export function getCheckNotes(result) {
  return Array.isArray(result?.checks) ? result.checks : [];
}
