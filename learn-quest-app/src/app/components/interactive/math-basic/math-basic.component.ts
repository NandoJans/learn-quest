import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {DecimalPipe, NgFor, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Op} from '../../../types/op';
import {MathBasicConfig} from '../../../interfaces/interactive/math-basic-config';
import {Mode} from '../../../types/mode';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-math-basic',
  imports: [
    NgIf,
    FormsModule,
    DecimalPipe,
    FaIconComponent,
    NgFor
  ],
  templateUrl: './math-basic.component.html',
  styleUrl: './math-basic.component.css'
})
export class MathBasicComponent implements OnChanges {
  ops: Op[] = ['+', '-', '×', '÷'];
  trackByOp = (_: number, op: Op) => op;

  /** Mode: 'author' shows settings; 'learner' hides them */
  @Input() mode: Mode = 'learner';

  /** Config from backend (author can edit; learner uses as-is) */
  @Input({ required: true }) config!: MathBasicConfig;

  /** Emits when author saves their settings (JSON-ready object) */
  @Output() saveConfig = new EventEmitter<MathBasicConfig>();

  /** Learner progress & completion events */
  @Output() problemGenerated = new EventEmitter<{ a:number; b:number; op:Op; answer:number }>();
  @Output() checkedAnswer = new EventEmitter<{ correct:boolean; given:number | null; expected:number }>();
  @Output() completed = new EventEmitter<{ total:number; correct:number; accuracy:number }>();

  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  // --- runtime state (signals) ---
  current = signal<{ a:number; b:number; op:Op } | null>(null);
  checked = signal(false);
  correct = signal(false);

  // editable draft (author mode only). We keep a shallow copy to avoid mutating input directly.
  draft: MathBasicConfig | null = null;

  // learner state
  answer: number | null = null;
  stats = { correct: 0, total: 0, streak: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.ensureConfigValid();
      if (this.mode === 'author') {
        this.draft = { ...this.config };
      }
      if (this.mode === 'learner') {
        // reset learner session when config changes
        this.resetSession();
        if (this.config.autoStart !== false) this.newProblem();
      }
    }
    if (changes['mode']) {
      if (this.mode === 'author') {
        this.draft = { ...this.config };
        this.ensureDraftPerOpObject();
      } else {
        this.draft = null;
        this.resetSession();
        if (this.config?.autoStart !== false) this.newProblem();
      }
    }
  }

  private ensureDraftPerOpObject() {
    if (!this.draft) return;
    this.draft.perOp = this.draft.perOp ?? {};
  }

  /** Update per-op min/max safely from template-driven inputs */
  onPerOpChange(op: Op, which: 'min' | 'max', raw: any) {
    if (!this.draft) return;
    this.ensureDraftPerOpObject();

    const val = Number(raw);
    if (!Number.isFinite(val)) return;

    const globalMin = this.draft.min;
    const globalMax = this.draft.max;

    const cur = this.draft.perOp![op] ?? { min: globalMin, max: globalMax };
    cur[which] = val;

    // If override equals global again, drop it to keep JSON minimal
    if (cur.min === globalMin && cur.max === globalMax) {
      delete this.draft.perOp![op];
    } else {
      this.draft.perOp![op] = cur;
    }
  }

  /** Optional: call before save to strip empty perOp */
  private cleanupPerOp() {
    if (!this.draft?.perOp) return;
    const globalMin = this.draft.min;
    const globalMax = this.draft.max;

    for (const op of this.ops) {
      const r = this.draft.perOp[op as Op];
      if (!r) continue;
      if (r.min === globalMin && r.max === globalMax) {
        delete this.draft.perOp[op as Op];
      }
    }
    if (Object.keys(this.draft.perOp).length === 0) {
      delete this.draft.perOp; // remove entirely if empty
    }
  }

  // ---------- AUTHOR MODE ----------
  toggleDraftOp(op: Op, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    if (!this.draft) return;
    const set = new Set<Op>(this.draft.operations ?? []);
    if (checked) set.add(op); else set.delete(op);
    this.draft.operations = Array.from(set);
  }

  saveDraft() {
    if (!this.draft) return;
    this.cleanupPerOp();               // optional tidy-up
    const cleaned = this.normalizeConfig(this.draft);
    this.saveConfig.emit(cleaned);
  }

  // ---------- LEARNER MODE ----------
  resetSession() {
    this.current.set(null);
    this.checked.set(false);
    this.correct.set(false);
    this.answer = null;
    this.stats = { correct: 0, total: 0, streak: 0 };
  }

  newProblem() {
    const cfg = this.config;
    const ops = (cfg?.operations ?? []).filter(Boolean) as Op[];
    if (ops.length === 0) { this.current.set(null); return; }

    const op = ops[Math.floor(Math.random() * ops.length)];

    // pick range: per-op override → global
    const range = cfg.perOp?.[op] ?? { min: cfg.min, max: cfg.max };
    const rnd = () => this.randInt(range.min, range.max);

    let a = 0, b = 0;

    switch (op) {
      case '+':
        a = rnd(); b = rnd();
        break;
      case '-':
        a = rnd(); b = rnd();
        if (!cfg.allowNegatives && a < b) [a, b] = [b, a];
        break;
      case '×':
        a = rnd(); b = rnd();
        break;
      case '÷':
        if (cfg.integerDivisionOnly) {
          b = this.nonZero(rnd);
          const q = rnd();
          a = b * q;
          if (!cfg.allowNegatives) { a = Math.abs(a); b = Math.abs(b); }
        } else {
          a = rnd(); b = this.nonZero(rnd);
          if (!cfg.allowNegatives) { a = Math.abs(a); b = Math.abs(b); }
        }
        break;
    }

    this.current.set({ a, b, op });
    this.answer = null;
    this.checked.set(false);
    this.correct.set(false);

    this.problemGenerated.emit({ a, b, op, answer: this.eval(a, b, op) });

    setTimeout(() => this.answerInput?.nativeElement.focus(), 0);
  }

  autoNext: ReturnType<typeof setTimeout> | null = null;


  check() {
    const p = this.current();
    if (!p) return;

    const expected = this.eval(p.a, p.b, p.op);
    const given = this.answer;
    const isCorrect = given !== null && Number(given) === expected;

    this.checked.set(true);
    this.correct.set(isCorrect);

    this.stats.total += 1;
    if (isCorrect) {
      this.stats.correct += 1;
      this.stats.streak += 1;
      this.autoNext = setTimeout(() => this.next(), 1000);
    }
    else { this.stats.streak = 0; }

    this.checkedAnswer.emit({ correct: isCorrect, given: given ?? null, expected });

    // completion gate
    if (this.stats.total >= (this.config?.requiredQuestions ?? 0)) {
      const acc = this.stats.total ? this.stats.correct / this.stats.total : 0;
      this.completed.emit({ total: this.stats.total, correct: this.stats.correct, accuracy: acc });
    }
  }

  reveal() {
    const p = this.current();
    if (!p) return;
    this.answer = this.eval(p.a, p.b, p.op);
    this.check();
  }

  next() {
    // Only proceed if we haven’t met the required question count
    if (this.stats.total >= (this.config?.requiredQuestions ?? 0)) return;
    this.newProblem();
    clearTimeout(this.autoNext!);
  }

  solution(): number {
    const p = this.current();
    return p ? this.eval(p.a, p.b, p.op) : 0;
  }

  // ---------- helpers ----------
  private eval(a: number, b: number, op: Op): number {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return this.config.integerDivisionOnly ? Math.trunc(a / b) : a / b;
    }
  }

  private randInt(min: number, max: number): number {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  }

  private nonZero(gen: () => number): number {
    let v = gen();
    if (v === 0) v = 1;
    return v;
  }

  private ensureConfigValid() {
    if (!this.config) throw new Error('MathBasicComponent: config is required.');
    if (!Array.isArray(this.config.operations) || this.config.operations.length === 0) {
      this.config.operations = ['+'];
    }
    // Global range
    if (typeof this.config.min !== 'number') this.config.min = 0;
    if (typeof this.config.max !== 'number') this.config.max = 10;
    if (this.config.min > this.config.max) [this.config.min, this.config.max] = [this.config.max, this.config.min];

    // Per-op ranges (coerce if present)
    const coerce = (r?: {min:number; max:number}) => {
      if (!r) return;
      if (typeof r.min !== 'number') r.min = this.config.min;
      if (typeof r.max !== 'number') r.max = this.config.max;
      if (r.min > r.max) [r.min, r.max] = [r.max, r.min];
    };
    coerce(this.config.perOp?.['+']);
    coerce(this.config.perOp?.['-']);
    coerce(this.config.perOp?.['×']);
    coerce(this.config.perOp?.['÷']);

    if (typeof this.config.requiredQuestions !== 'number' || this.config.requiredQuestions < 1) {
      this.config.requiredQuestions = 10;
    }
  }


  private normalizeConfig(c: MathBasicConfig): MathBasicConfig {
    const ops = Array.from(new Set(c.operations)).filter(Boolean) as Op[];

    const normRange = (min?: number, max?: number) => {
      const a = Number.isFinite(min) ? (min as number) : 0;
      const b = Number.isFinite(max) ? (max as number) : 10;
      return { min: Math.min(a, b), max: Math.max(a, b) };
    };

    const global = normRange(c.min, c.max);

    const perOp: MathBasicConfig['perOp'] = {};
    (['+','-','×','÷'] as Op[]).forEach(op => {
      const src = c.perOp?.[op];
      if (src) perOp[op] = normRange(src.min, src.max);
    });

    const rq = Math.max(1, Math.floor(c.requiredQuestions ?? 10));

    return {
      operations: ops.length ? ops : ['+'],
      min: global.min,
      max: global.max,
      perOp,
      allowNegatives: !!c.allowNegatives,
      integerDivisionOnly: !!c.integerDivisionOnly,
      requiredQuestions: rq,
      autoStart: c.autoStart !== false
    };
  }

  protected readonly faCheck = faCheck;
}
