// Full adder, voice-synced timing for chip-design episode 12 (last word ends at 69.34 s). Time unit: seconds of video
// (video t = audio t). The figure's timeline is written directly in voice seconds, so this map is the identity (kept so
// the voice page follows the pipeline). Word times: builds/notes/episodes/chip-design/12.words.json.
// LOOP = 68 s (3 s entrance + 68 = 71 s video).
export const LOOP = 68;

export function voiceToFigure(t: number) {
  return t < 3 + LOOP ? t : 3 + ((t - 3) % LOOP);
}
