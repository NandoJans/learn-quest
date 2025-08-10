import {Component, EventEmitter, Input, Output, signal, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Op} from '../../../types/op';
import {MathBasicConfig} from '../../../interfaces/interactive/math-basic-config';
import {Mode} from '../../../types/mode';

@Component({
  selector: 'app-math-basic',
  imports: [
    NgIf,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './math-basic.component.html',
  styleUrl: './math-basic.component.css'
})
export class MathBasicComponent {
  max(max: any): any {
      throw new Error('Method not implemented.');
  }
  resetSeries() {
      throw new Error('Method not implemented.');
  }
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
      } else {
        this.draft = null;
        this.resetSession();
        if (this.config?.autoStart !== false) this.newProblem();
      }
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
    const rnd = () => this.randInt(cfg.min, cfg.max);

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
  }

  check() {
    const p = this.current();
    if (!p) return;

    const expected = this.eval(p.a, p.b, p.op);
    const given = this.answer;
    const isCorrect = given !== null && Number(given) === expected;

    this.checked.set(true);
    this.correct.set(isCorrect);

    this.stats.total += 1;
    if (isCorrect) { this.stats.correct += 1; this.stats.streak += 1; }
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
    if (!this.config) throw new Error('MathPracticeComponent: config is required.');
    if (!Array.isArray(this.config.operations) || this.config.operations.length === 0) {
      throw new Error('MathPracticeComponent: operations must contain at least one operator.');
    }
    if (typeof this.config.min !== 'number' || typeof this.config.max !== 'number') {
      throw new Error('MathPracticeComponent: min/max must be numbers.');
    }
    if (typeof this.config.requiredQuestions !== 'number' || this.config.requiredQuestions < 1) {
      throw new Error('MathPracticeComponent: requiredQuestions must be >= 1.');
    }
  }

  private normalizeConfig(c: MathBasicConfig): MathBasicConfig {
    const ops = Array.from(new Set(c.operations)).filter(Boolean) as Op[];
    const min = Number.isFinite(c.min) ? c.min : 0;
    const max = Number.isFinite(c.max) ? c.max : 10;
    const rq = Math.max(1, Math.floor(c.requiredQuestions ?? 10));
    return {
      operations: ops.length ? ops : ['+'],
      min: Math.min(min, max),
      max: Math.max(min, max),
      allowNegatives: c.allowNegatives,
      integerDivisionOnly: c.integerDivisionOnly,
      requiredQuestions: rq,
      autoStart: !!c.autoStart
    };
  }
}
