import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_AUDIO = path.join(ROOT, 'public', 'audio');
const WORK_DIR = path.join(ROOT, 'assets', 'audio');
const WAV_PATH = path.join(WORK_DIR, 'evening-theme.wav');
const MP3_PATH = path.join(PUBLIC_AUDIO, 'evening-theme.mp3');

const SR = 44100;
const DURATION = 160;
const BPM = 68;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORD_DURATION = BAR * 2;

const left = new Float32Array(SR * DURATION);
const right = new Float32Array(SR * DURATION);

function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function addSample(time, value, pan = 0) {
  if (time < 0 || time >= DURATION) return;
  const index = Math.floor(time * SR);
  if (index < 0 || index >= left.length) return;
  const angle = ((pan + 1) * Math.PI) / 4;
  left[index] += value * Math.cos(angle);
  right[index] += value * Math.sin(angle);
}

/**
 * Мягкое фортепиано: несколько затухающих партиалов с небольшой
 * расстройкой. Без ударных и резкой атаки — звук должен оставаться
 * акварельным, а не «MIDI-пианино».
 */
function piano(start, midi, velocity, pan = 0, decay = 2.1) {
  const freq = midiToFreq(midi);
  const partials = [
    { mult: 1, amp: 1, decay: 1, detune: 1 },
    { mult: 2.002, amp: 0.36, decay: 0.68, detune: 1.0007 },
    { mult: 3.004, amp: 0.16, decay: 0.46, detune: 0.9994 },
    { mult: 4.008, amp: 0.07, decay: 0.3, detune: 1.0011 },
  ];
  const length = Math.min(5.8, decay * 2.8);
  const samples = Math.floor(length * SR);

  for (const partial of partials) {
    const omega = 2 * Math.PI * freq * partial.mult * partial.detune;
    const partialDecay = decay * partial.decay;
    const amp = velocity * partial.amp * 0.23;

    for (let i = 0; i < samples; i += 1) {
      const t = i / SR;
      const attack = 1 - Math.exp(-t / 0.007);
      const release = Math.min(1, (length - t) / 0.35);
      const env = attack * Math.exp(-t / partialDecay) * Math.max(0, release);
      const value = Math.sin(omega * t) * env * amp;
      addSample(start + t, value, pan);
    }
  }
}

function pad(start, midis, duration, velocity = 0.02) {
  const release = 3.2;
  const length = duration + release;
  const samples = Math.floor(length * SR);

  for (const midi of midis) {
    const freq = midiToFreq(midi);
    const detunes = [0.9987, 1.0013];
    for (const detune of detunes) {
      const omega = 2 * Math.PI * freq * detune;
      for (let i = 0; i < samples; i += 1) {
        const t = i / SR;
        const attack = Math.min(1, t / 2.4);
        const releaseEnv =
          t <= duration ? 1 : Math.max(0, 1 - (t - duration) / release);
        const lfo = 0.86 + 0.14 * Math.sin(2 * Math.PI * 0.055 * t + midi);
        const env = attack * releaseEnv * lfo;
        const value = Math.sin(omega * t) * env * velocity * 0.5;
        addSample(start + t, value, detune < 1 ? -0.45 : 0.45);
      }
    }
    const shimmerOmega = 2 * Math.PI * freq * 2.001;
    for (let i = 0; i < samples; i += 1) {
      const t = i / SR;
      const attack = Math.min(1, t / 3);
      const releaseEnv =
        t <= duration ? 1 : Math.max(0, 1 - (t - duration) / release);
      const env = attack * releaseEnv * 0.08;
      addSample(start + t, Math.sin(shimmerOmega * t) * env * velocity, 0);
    }
  }
}

function bass(start, midi, duration, velocity = 0.07) {
  const freq = midiToFreq(midi);
  const length = duration * 0.94;
  const samples = Math.floor(length * SR);
  const omega = 2 * Math.PI * freq;

  for (let i = 0; i < samples; i += 1) {
    const t = i / SR;
    const attack = 1 - Math.exp(-t / 0.05);
    const release = Math.min(1, (length - t) / 1.8);
    const env = attack * Math.exp(-t / 2.4) * Math.max(0, release);
    const value =
      (Math.sin(omega * t) + 0.18 * Math.sin(omega * 2 * t)) * env * velocity;
    addSample(start + t, value, 0);
  }
}

const CHORDS = [
  { name: 'Am', midis: [45, 52, 57, 60, 64, 69, 72, 76], root: 45 },
  { name: 'F', midis: [41, 48, 53, 57, 60, 65, 69, 72], root: 41 },
  { name: 'C', midis: [48, 55, 60, 64, 67, 72, 76, 79], root: 48 },
  { name: 'G', midis: [43, 50, 55, 59, 62, 67, 71, 74], root: 43 },
];

// Индексы нот в аккорде для мелодии: сначала верхний голос, затем ответ.
const MELODY = [
  [7, 5],
  [7, 5],
  [7, 6],
  [6, 5],
];

function playChord(chord, start, cycle, chordIndex) {
  const padNotes = [chord.midis[1], chord.midis[3], chord.midis[5], chord.midis[6]];
  pad(start, padNotes, CHORD_DURATION, 0.019);
  bass(start, chord.root, CHORD_DURATION, 0.065);

  // Мягкое арпеджио: одна нота на долю, с паузами и дыханием.
  const arpPattern = [0, 2, 3, 1, 4, 3, 5, 2];
  const arpBeats = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let i = 0; i < arpPattern.length; i += 1) {
    if ((cycle + chordIndex + i) % 5 === 4) continue;
    const note = chord.midis[arpPattern[i]];
    const velocity = 0.2 + 0.035 * ((i + cycle) % 3);
    const pan = i % 2 === 0 ? -0.18 : 0.18;
    piano(start + arpBeats[i] * BEAT, note, velocity, pan, 1.9);
  }

  // Мелодия появляется не в каждом проходе — так тишина остаётся частью музыки.
  const melody = MELODY[chordIndex];
  const melodyBeats = cycle === 0 ? [5.5] : [1.5, 5.5];
  for (const beat of melodyBeats) {
    const index = beat < 3 ? melody[0] : melody[1];
    const note = chord.midis[index];
    piano(start + beat * BEAT, note, 0.34, 0.08, 2.7);
    if (cycle >= 2 && beat > 3) {
      piano(start + (beat + 1.5) * BEAT, note + 12, 0.11, -0.22, 2.2);
    }
  }
}

function build() {
  console.log('→ Синтезирую фортепиано, пэд и бас…');

  // Вступление: одна тихая гармония Am, редкие ноты.
  pad(0, [52, 57, 60, 64], 12, 0.022);
  bass(0, 45, 12, 0.06);
  const introNotes = [
    [0, 69, 0.26],
    [2.5, 72, 0.2],
    [4.5, 76, 0.23],
    [7, 79, 0.17],
    [9.5, 76, 0.2],
    [11, 72, 0.16],
  ];
  for (const [beat, note, velocity] of introNotes) {
    piano(beat * BEAT, note, velocity, beat % 2 ? 0.12 : -0.12, 2.9);
  }

  const cycles = 5;
  const mainStart = 12;
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    for (let chordIndex = 0; chordIndex < CHORDS.length; chordIndex += 1) {
      const start =
        mainStart + cycle * CHORDS.length * CHORD_DURATION + chordIndex * CHORD_DURATION;
      playChord(CHORDS[chordIndex], start, cycle, chordIndex);
    }
  }

  const outroStart = mainStart + cycles * CHORDS.length * CHORD_DURATION;
  const outroLength = DURATION - outroStart;
  pad(outroStart, [52, 57, 60, 64, 69], outroLength, 0.02);
  bass(outroStart, 45, outroLength, 0.055);
  const outroNotes = [
    [0.2, 69, 0.26],
    [2.2, 72, 0.21],
    [4.4, 76, 0.2],
    [6.4, 81, 0.12],
  ];
  for (const [beat, note, velocity] of outroNotes) {
    piano(outroStart + beat * BEAT, note, velocity, 0, 3.2);
  }

  // Глобальные fade-in / fade-out и нормализация.
  let peak = 0;
  for (let i = 0; i < left.length; i += 1) {
    const t = i / SR;
    const fadeIn = Math.min(1, t / 3);
    const fadeOut = Math.min(1, (DURATION - t) / 6);
    const envelope = fadeIn * Math.max(0, fadeOut);
    left[i] *= envelope;
    right[i] *= envelope;
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }

  const scale = peak > 0 ? 0.82 / peak : 1;
  const pcm = Buffer.alloc(44 + left.length * 4);
  pcm.write('RIFF', 0);
  pcm.writeUInt32LE(36 + left.length * 4, 4);
  pcm.write('WAVE', 8);
  pcm.write('fmt ', 12);
  pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20);
  pcm.writeUInt16LE(2, 22);
  pcm.writeUInt32LE(SR, 24);
  pcm.writeUInt32LE(SR * 4, 28);
  pcm.writeUInt16LE(4, 32);
  pcm.writeUInt16LE(16, 34);
  pcm.write('data', 36);
  pcm.writeUInt32LE(left.length * 4, 40);

  let offset = 44;
  for (let i = 0; i < left.length; i += 1) {
    const l = Math.max(-1, Math.min(1, left[i] * scale));
    const r = Math.max(-1, Math.min(1, right[i] * scale));
    pcm.writeInt16LE(Math.round(l * 32767), offset);
    pcm.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }

  return pcm;
}

async function main() {
  await mkdir(PUBLIC_AUDIO, { recursive: true });
  await mkdir(WORK_DIR, { recursive: true });

  const wav = build();
  await writeFile(WAV_PATH, wav);
  console.log(`→ WAV готов: ${(wav.length / 1024 / 1024).toFixed(1)} МБ`);

  if (!ffmpegPath) {
    throw new Error('ffmpeg-static не найден. Установите зависимости заново.');
  }

  console.log('→ Кодирую MP3 и добавляю мягкую реверберацию…');
  const result = spawnSync(
    ffmpegPath,
    [
      '-y',
      '-i',
      WAV_PATH,
      '-af',
      'highpass=f=32,lowpass=f=12500,aecho=0.72:0.58:110|230|460:0.18|0.1|0.05,loudnorm=I=-19:TP=-2:LRA=10',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '160k',
      '-metadata',
      'title=Один особенный вечер',
      '-metadata',
      'artist=Original ambient theme',
      '-metadata',
      'comment=Оригинальная инструментальная композиция для проекта',
      MP3_PATH,
    ],
    { stdio: 'inherit' },
  );

  if (result.status !== 0) {
    throw new Error(`ffmpeg завершился с кодом ${result.status}`);
  }

  await rm(WAV_PATH, { force: true });
  console.log(`→ Готово: public/audio/evening-theme.mp3`);
}

main().catch((error) => {
  console.error('\nОшибка генерации музыки:', error);
  process.exitCode = 1;
});
