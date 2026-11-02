// Regeneration convoy, voice-synced timing for chip-design episode 11 (last word ends at 67.32 s). Time unit: seconds
// of video (video t = audio t). The figure's timeline is written directly in voice seconds, so this map is the
// identity (kept so the voice page follows the pipeline). Word times: builds/notes/episodes/chip-design/11.words.json.
// LOOP = 67.5 s (3 s entrance + 67.5 = 70.5 s video).
export const LOOP = 67.5;

export function voiceToFigure(t: number) {
  return t < 3 + LOOP ? t : 3 + ((t - 3) % LOOP);
}
