import {Op} from '../../types/op';


export interface MathBasicConfig {
  operations: Op[];             // e.g. ['+','-','×','÷']
  min: number;                  // e.g. 0
  max: number;                  // e.g. 12
  allowNegatives: boolean;      // e.g. false
  integerDivisionOnly: boolean; // e.g. true
  requiredQuestions: number;    // e.g. 10  (how many questions a learner must complete)
  autoStart?: boolean;          // optional: start immediately for learner
}
