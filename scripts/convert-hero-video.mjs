import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);

const INPUT = process.argv[2] || 'public/images/hero-animated.gif';
const OUTPUT = 'public/images/hero-animated.mp4';
const SIZE = 720;

const resolveFfmpeg = async () => {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;

  try {
    const { default: ffmpegPath } = await import('ffmpeg-static');
    if (ffmpegPath && existsSync(ffmpegPath)) return ffmpegPath;
  } catch {
    // ffmpeg-static no esta instalado, se usa el del PATH
  }

  return 'ffmpeg';
};

if (!existsSync(INPUT)) {
  console.error(
    `No se encontro ${INPUT}.\n` +
      'Recuperá el GIF original desde el historial de git:\n' +
      '  git show <commit>:public/images/hero-animated.gif > public/images/hero-animated.gif'
  );
  process.exit(1);
}

const ffmpeg = await resolveFfmpeg();

await execFileAsync(ffmpeg, [
  '-y',
  '-hide_banner',
  '-loglevel', 'error',
  '-i', path.resolve(INPUT),
  '-vf', `scale=${SIZE}:${SIZE}:flags=lanczos,fps=30`,
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '25',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an',
  path.resolve(OUTPUT),
]);

console.log(`${INPUT} -> ${OUTPUT}`);
