import {Op} from '../../types/op';


export interface MathBasicConfig {
  operations: Op[];
  // global defaults (still supported)
  min: number;
  max: number;

  // NEW: per-operator overrides (optional)
  perOp?: { [K in Op]?: { min: number; max: number }};

  allowNegatives?: boolean;
  integerDivisionOnly?: boolean;
  requiredQuestions: number;
  autoStart?: boolean;
}
