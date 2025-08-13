import { Field } from "../../types/field";

export interface FieldSchema {
  key: string;
  label: string;
  type: Field;
  description?: string;
  required?: boolean;

  // common constraints
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;

  // enum
  options?: { value: string; label: string }[];

  // array
  items?: Omit<FieldSchema, 'key' | 'required'>; // homogeneous array item

  // object (flatten children under a group)
  properties?: FieldSchema[];
}
