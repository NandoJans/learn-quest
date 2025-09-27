// html-field.component.ts
import {Component, ElementRef, ViewChild, forwardRef, AfterViewInit} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-html-field',
  standalone: true,
  templateUrl: './html-field.component.html',
  styleUrls: ['./html-field.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HtmlFieldComponent),
    multi: true
  }]
})
export class HtmlFieldComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('ed') ed!: ElementRef<HTMLDivElement>;
  disabled = false;
  protected _html = '';
  private needsRender = false;

  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void {
    const next = val ?? '';
    if (next !== this._html) {
      this._html = next;

      // if view already ready, update DOM (unless user is typing)
      if (this.ed && !this.isFocused) {
        this.ed.nativeElement.innerHTML = this._html || '<p><br></p>';
      } else {
        // view not ready yet — render later in ngAfterViewInit
        this.needsRender = true;                       // <— add
      }
    }
  }

  ngAfterViewInit() {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      document.execCommand('styleWithCSS', false, 'true');
    } catch {}

    if (this._html) {
      this.ed.nativeElement.innerHTML = this._html;
    } else {
      this.ed.nativeElement.innerHTML = '<p><br></p>';
    }

    if (this.needsRender && !this.isFocused) {
      this.ed.nativeElement.innerHTML = this._html || '<p><br></p>';
      this.needsRender = false;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput() {
    this._html = this.ed.nativeElement.innerHTML;
    this.onChange(this._html);
    this.onTouched();
  }

  format(cmd: 'bold'|'italic'|'underline') {
    this.focusEditor();
    document.execCommand(cmd);
    this.onInput();
  }

  makeLink() {
    const url = prompt('Enter URL (https://…)') || '';
    if (!url) return;
    document.execCommand('createLink', false, url);
    // add rel/target if needed:
    this.normalizeLinks();
    this.onInput();
  }

  onKeyDown(e: KeyboardEvent) {
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === 'b') { e.preventDefault(); this.format('bold'); return; }
    if (meta && e.key.toLowerCase() === 'i') { e.preventDefault(); this.format('italic'); return; }
    if (meta && e.key.toLowerCase() === 'u') { e.preventDefault(); this.format('underline'); return; }

    if (e.key === ' ' ) { if (this.tryAutoList(e)) return; }
    if (e.key === 'Enter') { if (this.handleEnterInList(e)) return; }
    if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertHTML', false, '&nbsp;&nbsp;'); this.onInput(); }
  }

  private getBlockInfo() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    while (node && node !== this.ed.nativeElement && !(node instanceof HTMLElement && /^(P|DIV|LI|H[1-6])$/.test(node.tagName))) {
      node = node.parentNode;
    }
    const block = (node as HTMLElement) || this.ed.nativeElement;
    return { range, block };
  }

  private tryAutoList(e: KeyboardEvent): boolean {
    const info = this.getBlockInfo(); if (!info) return false;
    const { range, block } = info;
    // tekst vanaf block-begin tot caret
    const probe = range.cloneRange();
    probe.setStart(block, 0);
    const before = probe.toString();

    const m = before.match(/^\s*([*-])\s$/); // "- " of "* "
    if (!m) return false;

    e.preventDefault();
    // verwijder marker
    const kill = probe.cloneRange();
    kill.setStart(block, 0);
    kill.setEnd(block, 1); // ruimer werkt niet altijd; dus:
    document.execCommand('undo'); // fallback als bovenstaande te agressief is
    // Betere, robuuste aanpak:
    document.execCommand('delete'); // verwijder net getypte spatie
    document.execCommand('undo');   // we willen eigen insertHTML doen

    // Bouw <ul><li>
    const html = '<ul><li>\u200b</li></ul>'; // zero-width spatie voor caret
    document.execCommand('insertHTML', false, html);

    // caret netjes in <li>
    const ul = this.ed.nativeElement.querySelector('ul');
    const li = ul?.querySelector('li');
    if (li) {
      const r = document.createRange(); const s = window.getSelection();
      r.selectNodeContents(li); r.collapse(true); s?.removeAllRanges(); s?.addRange(r);
    }
    this.onInput();
    return true;
  }

  private handleEnterInList(e: KeyboardEvent): boolean {
    const sel = window.getSelection(); if (!sel || sel.rangeCount === 0) return false;
    const li = (sel.anchorNode as Node).parentElement?.closest('li');
    if (!li) return false;

    // Als de <li> leeg is → Enter: lijst verlaten
    if (li.textContent?.replace(/\u200b|\s/g, '') === '') {
      e.preventDefault();
      const ul = li.parentElement!;
      const exitP = document.createElement('p'); exitP.innerHTML = '<br>';
      ul.after(exitP);
      li.remove();
      // caret in nieuwe paragraaf
      const r = document.createRange(); r.selectNodeContents(exitP); r.collapse(true);
      const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r);
      this.onInput();
      return true;
    }
    // default gedrag (nieuwe <li>) is prima
    return false;
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    // paste as text to avoid unsafe markup
    document.execCommand('insertText', false, text);
    this.onInput();
  }

  private normalizeLinks() {
    const el = this.ed.nativeElement;
    el.querySelectorAll('a[href]').forEach(a => {
      a.setAttribute('target','_blank');
      a.setAttribute('rel','noopener');
    });
  }

  isFocused = false;

  onToolDown(e: MouseEvent) {
    e.preventDefault();            // houdt focus in de editor
    this.focusEditor();
  }

  onFocus() { this.isFocused = true; }
  onBlur()  { this.isFocused = false; this.onTouched(); }

  focusEditor() { this.ed.nativeElement.focus(); }

  setHeading(tag: 'h1'|'h2'|'h3'|'h4') {
    this.focusEditor();
    document.execCommand('formatBlock', false, tag);
    this.onInput();
  }

}
