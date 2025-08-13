import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_ELEMENTS_118, ElementRecord } from '../../../data/elements.data';

export type Lang = 'en' | 'nl';
export type Mode = 'm1_name_mc' | 'm2_name_open' | 'm3_proton_mc' | 'm4_proton_open';

export interface PeriodicQuizConfig {
  language?: Lang | 'auto';
  initialMode?: Mode;
  colorHintsDefault?: boolean;
  perfectModeDefault?: boolean;
  autoAdvanceMs?: number;        // default 1000; 0 = off
  persistKeyPrefix?: string;     // default 'ptq'
  dataset?: ElementRecord[];     // custom dataset, else default 118 used
}

/** I18N */
const I18N: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Periodic Table Quiz',
    mode: 'Mode',
    m1: 'Identify Element – Multiple Choice',
    m2: 'Identify Element – Open input',
    m3: 'Proton Count – Multiple Choice',
    m4: 'Proton Count – Open input',
    settings: 'Settings',
    colorHints: 'Color hints',
    perfectMode: 'Perfect Mode',
    score: 'Score',
    mistakes: 'Mistakes',
    answered: 'Answered',
    correct: 'Correct',
    highscore: 'Best (Perfect)',
    next: 'Next',
    check: 'Check',
    correctA: 'Correct!',
    incorrectA: 'Incorrect',
    correctAnswer: 'Correct answer',
    enterName: 'Enter element name',
    enterProtons: 'Enter proton count',
    language: 'Language',
    footerHelp: 'Shortcuts: 1–4 choose, Enter submit/next, L language, M cycle modes.',
    reset: 'Reset / New Round',
  },
  nl: {
    title: 'Periodiek Systeem Quiz',
    mode: 'Modus',
    m1: 'Element herkennen – Meerkeuze',
    m2: 'Element herkennen – Open invoer',
    m3: 'Protonen tellen – Meerkeuze',
    m4: 'Protonen tellen – Open invoer',
    settings: 'Instellingen',
    colorHints: 'Kleurhints',
    perfectMode: 'Perfecte modus',
    score: 'Score',
    mistakes: 'Fouten',
    answered: 'Beantwoord',
    correct: 'Goed',
    highscore: 'Beste (Perfect)',
    next: 'Volgende',
    check: 'Controleer',
    correctA: 'Goed!',
    incorrectA: 'Onjuist',
    correctAnswer: 'Juiste antwoord',
    enterName: 'Voer elementnaam in',
    enterProtons: 'Voer aantal protonen in',
    language: 'Taal',
    footerHelp: 'Sneltoetsen: 1–4 kiezen, Enter verzenden/volgende, L taal, M modus wisselen.',
    reset: 'Reset / Nieuwe ronde',
  },
};

/** Utils */
function norm(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function shuffle<T>(arr: T[]): T[] { const a=[...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function detectLang(): Lang {
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('nl') ? 'nl' : 'en';
}
function withAlpha(hex: string, a: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex;
  const r = parseInt(m[1].slice(0,2),16), g = parseInt(m[1].slice(2,4),16), b = parseInt(m[1].slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Distractors */
function makeNameOptions(cur: ElementRecord, lang: Lang, all: ElementRecord[]): string[] {
  const key = lang === 'en' ? 'nameEn' : 'nameNl';
  const others = shuffle(all.filter(e => e.atomicNumber !== cur.atomicNumber));
  const picks = others.slice(0,3).map(e => (e as any)[key] as string);
  return shuffle([ (cur as any)[key] as string, ...picks ]);
}
function makeProtonOptions(cur: ElementRecord): number[] {
  const c = cur.atomicNumber;
  const pool = shuffle([2,3,4,5,6,-2,-3,-4,-5,-6]);
  const set = new Set<number>([c]);
  for (const off of pool) {
    const cand = clamp(c + off, 1, 118);
    set.add(cand);
    if (set.size >= 4) break;
  }
  return shuffle([...set].slice(0,4));
}

@Component({
  selector: 'app-periodic-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periodic-quiz.component.html',
  styleUrls: ['./periodic-quiz.component.css'],
})
export class PeriodicQuizComponent implements OnInit, OnDestroy {
  /** Config (JSON) */
  @Input() config: PeriodicQuizConfig = {};
  /** Emits when perfect-mode highscore improves (fewest mistakes) */
  @Output() highscoreChange = new EventEmitter<number>();

  // Signals (state)
  private prefix = signal('ptq');
  dataset = signal<ElementRecord[]>(DEFAULT_ELEMENTS_118);

  lang = signal<Lang>('en');
  mode = signal<Mode>('m1_name_mc');
  colorHints = signal(true);
  perfectMode = signal(false);
  autoAdvanceMs = signal(1000);

  answered = signal(0);
  correctCount = signal(0);
  mistakes = signal(0);
  highscore = signal<number>(Number.POSITIVE_INFINITY);

  queue = signal<number[]>([]);
  qIndex = signal(0);

  mcSelection = signal<string | number | null>(null);
  openValue = '';
  feedback = signal<{ ok: boolean; detail?: string } | null>(null);

  // Template-friendly proxies
  t = computed(() => I18N[this.lang()]);
  current = computed(() => this.dataset()[this.queue()[this.qIndex()]]);
  nameFor = (e: ElementRecord) => this.lang() === 'en' ? e.nameEn : e.nameNl;
  highscoreDisplay = computed(() => this.highscore() === Number.POSITIVE_INFINITY ? '—' : String(this.highscore()));

  mcOptions = computed(() => {
    const cur = this.current();
    if (!cur) return [];
    if (this.mode() === 'm1_name_mc') return makeNameOptions(cur, this.lang(), this.dataset());
    if (this.mode() === 'm3_proton_mc') return makeProtonOptions(cur);
    return [];
  });

  mcNameOptions = computed<string[]>(() => {
    const cur = this.current();
    return this.mode() === 'm1_name_mc' && cur
      ? makeNameOptions(cur, this.lang(), this.dataset())
      : [];
  });

  mcProtonOptions = computed<number[]>(() => {
    const cur = this.current();
    return this.mode() === 'm3_proton_mc' && cur
      ? makeProtonOptions(cur)
      : [];
  });

  get modeStr() { return this.mode(); }
  set modeStr(v: Mode) { this.mode.set(v); this.persist('mode', v); }

  get colorHintsBool() { return this.colorHints(); }
  set colorHintsBool(v: boolean) { this.colorHints.set(v); this.persist('colorHints', v ? '1' : '0'); }

  get perfectModeBool() { return this.perfectMode(); }
  set perfectModeBool(v: boolean) { this.perfectMode.set(v); this.persist('perfectMode', v ? '1' : '0'); }

  canCheck = () => {
    const m = this.mode();
    if (m === 'm1_name_mc' || m === 'm3_proton_mc') return this.mcSelection() !== null;
    if (m === 'm2_name_open') return this.openValue.trim().length > 0;
    if (m === 'm4_proton_open') return /^\d+$/.test(this.openValue.trim()) && +this.openValue >= 1 && +this.openValue <= 118;
    return false;
  };

  // Persistence helpers
  private k(name: string) { return `${this.prefix()}_${name}`; }
  private persist(name: string, val: string) { try { localStorage.setItem(this.k(name), val); } catch {} }
  private read(name: string) { try { return localStorage.getItem(this.k(name)); } catch { return null; } }

  ngOnInit(): void {
    const cfg = this.config || {};
    this.prefix.set(cfg.persistKeyPrefix || 'ptq');
    this.autoAdvanceMs.set(typeof cfg.autoAdvanceMs === 'number' ? Math.max(0, cfg.autoAdvanceMs) : 1000);
    this.dataset.set((cfg.dataset && cfg.dataset.length) ? cfg.dataset.slice() : DEFAULT_ELEMENTS_118);

    // language
    const savedLang = (this.read('lang') as Lang | null);
    let startLang: Lang;
    if (savedLang === 'en' || savedLang === 'nl') startLang = savedLang;
    else if (cfg.language === 'en' || cfg.language === 'nl') startLang = cfg.language;
    else startLang = detectLang();
    this.lang.set(startLang);

    // settings
    const savedMode = this.read('mode') as Mode | null;
    this.mode.set(savedMode ?? cfg.initialMode ?? 'm1_name_mc');

    const savedHints = this.read('colorHints');
    this.colorHints.set(savedHints != null ? savedHints === '1' : (cfg.colorHintsDefault ?? true));

    const savedPerfect = this.read('perfectMode');
    this.perfectMode.set(savedPerfect != null ? savedPerfect === '1' : (cfg.perfectModeDefault ?? false));

    const hs = this.read('highscore');
    if (hs) this.highscore.set(+hs);

    // build initial queue
    this.queue.set(shuffle(this.dataset().map((_, i) => i)));
    this.qIndex.set(0);

    // persist some toggles/lang
    effect(() => this.persist('lang', this.lang()));
    effect(() => this.persist('colorHints', this.colorHints() ? '1' : '0'));
    effect(() => this.persist('perfectMode', this.perfectMode() ? '1' : '0'));
  }

  ngOnDestroy(): void {}

  setLang(l: Lang) { this.lang.set(l); }

  withA(col: string, a: number) { return withAlpha(col, a); }

  selectMC(v: string | number) { this.mcSelection.set(v); }

  onCheck() {
    const cur = this.current();
    if (!cur) return;
    const m = this.mode();

    let ok: boolean;
    let detail = '';

    if (m === 'm1_name_mc') {
      ok = this.mcSelection() === this.nameFor(cur);
      if (!ok) detail = `${this.t()['correctAnswer']}: ${this.nameFor(cur)}`;
    } else if (m === 'm2_name_open') {
      ok = norm(this.openValue) === norm(this.nameFor(cur));
      if (!ok) detail = `${this.t()['correctAnswer']}: ${this.nameFor(cur)}`;
    } else if (m === 'm3_proton_mc') {
      ok = this.mcSelection() === cur.atomicNumber;
      if (!ok) detail = `${this.t()['correctAnswer']}: ${cur.atomicNumber}`;
    } else {
      const n = parseInt(this.openValue.trim(), 10);
      ok = Number.isInteger(n) && n === cur.atomicNumber;
      if (!ok) detail = `${this.t()['correctAnswer']}: ${cur.atomicNumber}`;
    }

    this.answered.update(v => v + 1);
    if (ok) this.correctCount.update(v => v + 1);
    else this.mistakes.update(v => v + 1);

    this.feedback.set(ok ? { ok: true } : { ok: false, detail });

    // perfect mode: re-queue wrong
    if (!ok && this.perfectMode()) {
      this.queue.update(q => [...q, q[this.qIndex()]]);
    }

    // auto-advance after correct
    const delay = this.autoAdvanceMs();
    if (ok && delay > 0) {
      window.setTimeout(() => this.nextQuestion(), delay);
    }
  }

  nextQuestion() {
    const idx = this.qIndex() + 1;
    const q = this.queue();
    if (idx >= q.length) {
      // round ends
      if (this.perfectMode()) {
        const m = this.mistakes();
        if (m < this.highscore()) {
          this.highscore.set(m);
          this.persist('highscore', String(m));
          this.highscoreChange.emit(m);
        }
      }
      const last = this.current()?.atomicNumber;
      this.resetRound(last);
      return;
    }
    this.qIndex.set(idx);
    this.feedback.set(null);
    this.mcSelection.set(null);
    this.openValue = '';
  }

  resetRound(avoidAtomic?: number) {
    const idxs = shuffle(this.dataset().map((_, i) => i));
    if (avoidAtomic != null && idxs.length > 1 && this.dataset()[idxs[0]].atomicNumber === avoidAtomic) {
      const j = 1 + Math.floor(Math.random() * (idxs.length - 1));
      [idxs[0], idxs[j]] = [idxs[j], idxs[0]];
    }
    this.queue.set(idxs);
    this.qIndex.set(0);
    this.feedback.set(null);
    this.mcSelection.set(null);
    this.openValue = '';
    this.answered.set(0);
    this.correctCount.set(0);
    this.mistakes.set(0);
  }

  // keyboard shortcuts
  onKey(e: any) {
    if (!(e instanceof KeyboardEvent)) return;
    if (e.key === 'Enter') {
      if (this.feedback()) this.nextQuestion();
      else if (this.canCheck()) this.onCheck();
    } else if (['1','2','3','4'].includes(e.key)) {
      const i = +e.key - 1;
      if (this.mode() === 'm1_name_mc') {
        const opts = this.mcNameOptions();
        if (opts[i] !== undefined) this.mcSelection.set(opts[i]);
      } else if (this.mode() === 'm3_proton_mc') {
        const opts = this.mcProtonOptions();
        if (opts[i] !== undefined) this.mcSelection.set(opts[i]);
      }
    } else if (e.key.toLowerCase() === 'l') {
      this.setLang(this.lang() === 'en' ? 'nl' : 'en');
    } else if (e.key.toLowerCase() === 'm') {
      const order: Mode[] = ['m1_name_mc','m2_name_open','m3_proton_mc','m4_proton_open'];
      const idx = order.indexOf(this.mode());
      const next = order[(idx+1)%order.length];
      this.mode.set(next);
      this.persist('mode', next);
    }
  }

  // Double-tap-to-check support (works for touch and mouse)
  private lastTapTime = 0;
  private lastTapValue: string | number | null = null;

  onOptionTap(opt: string | number) {
    const now = performance.now();
    const DOUBLE_TAP_MS = 350;

    // First tap selects; second tap on same option within window checks
    if (this.mcSelection() === opt) {
      // already selected: treat as potential double tap
      if (this.lastTapValue === opt && (now - this.lastTapTime) < DOUBLE_TAP_MS) {
        // double tap -> submit
        if (this.canCheck()) this.onCheck();
      }
      this.lastTapTime = now;
      this.lastTapValue = opt;
      return;
    }

    // different option: select it and start a new double-tap window
    this.mcSelection.set(opt);
    this.lastTapTime = now;
    this.lastTapValue = opt;
  }

}
