import {EventEmitter} from '@angular/core';


export interface InteractiveModule<T = any> {
  config: T;
  configChange?: EventEmitter<T>;
}
