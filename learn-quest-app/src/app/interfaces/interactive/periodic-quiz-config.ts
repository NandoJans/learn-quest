import {Lang} from '../../types/lang';
import {PeriodicQuizMode} from '../../types/interactive/periodic-quiz-mode';

export interface PeriodicQuizConfig {
  language: Lang,
  initialMode: PeriodicQuizMode,
  colorHintsDefault: boolean,
  perfectModeDefault: boolean,
  autoAdvanceMs: 1000,
  persistKeyPrefix: 'ptq',
}
