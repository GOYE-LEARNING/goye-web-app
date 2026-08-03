// hook/useVoiceConversation.ts
//
// Hands-free microphone capture for the ShekiAI panel. The tutor/student
// shouldn't have to press stop before hearing a reply, so instead of a
// manual toggle this watches the mic's actual loudness and ends the
// utterance once they've clearly stopped talking (voice activity
// detection). It also exposes a live 0..1 level so the assistant's orb can
// react to the speaker's voice rather than pulsing on a fixed timer.
import { useCallback, useEffect, useRef, useState } from "react";

// Tuned by ear against a normal speaking voice on a laptop mic:
// SPEECH_LEVEL is comfortably above idle room noise, and the silence window
// is long enough not to cut people off mid-sentence at a natural pause.
const SPEECH_LEVEL = 0.045;
const SILENCE_MS = 1400;
const MAX_UTTERANCE_MS = 45000; // hard stop so a hot mic can't record forever
const MIN_UTTERANCE_MS = 400; // ignore stray clicks/pops

interface Options {
  /** Called with the recorded audio once the speaker goes quiet. */
  onUtterance: (audio: Blob) => void | Promise<void>;
}

export function useVoiceConversation({ onUtterance }: Options) {
  const [isListening, setIsListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const lastLoudAtRef = useRef<number>(0);
  const heardSpeechRef = useRef(false);
  // Kept in a ref so the analyser loop (which closes over its first render)
  // always calls the latest handler without being torn down and restarted.
  const onUtteranceRef = useRef(onUtterance);
  onUtteranceRef.current = onUtterance;

  const teardown = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    recorderRef.current = null;
    setMicLevel(0);
    setIsListening(false);
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop(); // onstop below emits the utterance and tears down
    } else {
      teardown();
    }
  }, [teardown]);

  const start = useCallback(async () => {
    if (recorderRef.current) return; // already listening
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const spoke = heardSpeechRef.current && Date.now() - startedAtRef.current > MIN_UTTERANCE_MS;
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        teardown();
        // Only surface real speech — otherwise a moment of silence would
        // send an empty clip and the assistant would answer nothing.
        if (spoke && blob.size > 0) void onUtteranceRef.current(blob);
      };

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);

      startedAtRef.current = Date.now();
      lastLoudAtRef.current = Date.now();
      heardSpeechRef.current = false;
      recorder.start();
      setIsListening(true);

      const tick = () => {
        if (!audioCtxRef.current) return;
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
        const rms = Math.sqrt(sum / buffer.length);
        setMicLevel(Math.min(1, rms * 6)); // scaled for a usable visual range

        const now = Date.now();
        if (rms > SPEECH_LEVEL) {
          heardSpeechRef.current = true;
          lastLoudAtRef.current = now;
        }
        const quietFor = now - lastLoudAtRef.current;
        const tooLong = now - startedAtRef.current > MAX_UTTERANCE_MS;

        if ((heardSpeechRef.current && quietFor > SILENCE_MS) || tooLong) {
          stop();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setMicError("I couldn't reach your microphone — you can still type to me.");
      teardown();
    }
  }, [stop, teardown]);

  useEffect(() => () => teardown(), [teardown]);

  return { isListening, micLevel, micError, start, stop };
}
