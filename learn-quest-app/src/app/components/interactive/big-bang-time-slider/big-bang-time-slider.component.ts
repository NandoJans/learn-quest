import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Epoch = { label: string; start: number; end: number; note: string };
type SliderConfig = {
  height?: number;         // px
  tMin?: number;           // seconds (log space)
  tMax?: number;           // seconds (log space)
  initialT?: number;       // seconds
  epochs?: Epoch[];        // list of epochs
};

const YEAR = 31557600;

@Component({
  selector: 'app-big-bang-time-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './big-bang-time-slider.component.html',
  styleUrls: ['./big-bang-time-slider.component.css']
})
export class BigBangTimeSliderComponent implements AfterViewInit, OnDestroy {
  /** External config (module host passes this). */
  @Input() config: SliderConfig = {};

  @ViewChild('universeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // drawing
  private ctx!: CanvasRenderingContext2D;
  private off!: HTMLCanvasElement;
  private offCtx!: CanvasRenderingContext2D;
  private raf?: number;
  private dpr = Math.min(window.devicePixelRatio || 1, 2);
  private ro?: ResizeObserver;

  // time & slider (log space)
  private logMin = -36;
  private logMax = 17; // ~ 3e9 years
  slider = 0.5; // 0..1
  t = 1;        // seconds (derived from slider)

  // data/state
  epochs: Epoch[] = [];
  height = 360;

  // scene caches
  private quarks = Array.from({length:160}, (_,i)=>({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()*2-1)*0.12, vy: (Math.random()*2-1)*0.12,
    c: ['#ff5a5a','#5ab0ff','#5aff8a'][i%3], r: 3 + (i%7===0?1.5:0)
  }));
  private atoms = Array.from({length:140}, ()=>({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()*2-1)*0.02, vy: (Math.random()*2-1)*0.02,
    r: 8 + Math.random()*4, phase: Math.random()*Math.PI*2
  }));

  /** Merge incoming config with defaults */
  private applyConfig() {
    const defaults: Required<SliderConfig> = {
      height: 360,
      tMin: 1e-36,
      tMax: Math.pow(10, 17), // ~3e9 yr
      initialT: 1,
      epochs: [
        { label: 'Inflatie',             start: 1e-36,            end: 1e-32,             note: 'Razendsnelle expansie van de ruimte.' },
        { label: 'Hadronisatie',         start: 1e-32,            end: 1e-6,              note: 'Quarks binden tot hadronen (protonen/neutronen).' },
        { label: 'Leptonentijd',         start: 1e-6,             end: 1,                note: 'Leptonen domineren; veel annihilatieparen.' },
        { label: 'Neutrinodekoppeling',  start: 1,                end: 2,                 note: 'Neutrino’s vliegen vrij door het heelal.' },
        { label: 'Fotonentijd',          start: 10,               end: 120,               note: 'Fotonen domineren, sterk gekoppeld aan plasma.' },
        { label: 'Nucleosynthese (BBN)', start: 120,              end: 1200,              note: 'Vorming van H/He/Li-kernen.' },
        { label: 'Plasma-tijd',          start: 1200,             end: 3.7e5*YEAR,        note: 'Hete, ioniseerde plasma; nog ondoorzichtig.' },
        { label: 'Recombinatie/CMB',     start: 3.7e5*YEAR,       end: 3.7e5*YEAR,        note: 'Heelal wordt doorzichtig; CMB ontstaat.' },
        { label: 'Donkere Middeleeuwen', start: 3.7e5*YEAR,       end: 1.5e8*YEAR,        note: 'Weinig lichtbronnen; bijna zwart heelal.' },
        { label: 'Eerste sterren',       start: 1.5e8*YEAR,       end: 5e8*YEAR,          note: 'Populatie III sterren ontsteken.' },
        { label: 'Sterrenstelsels',      start: 5e8*YEAR,         end: 1e9*YEAR,          note: 'Galaxy-vorming en -groei.' },
      ]
    };

    this.height = this.config.height ?? defaults.height;
    const tMin = this.config.tMin ?? defaults.tMin;
    const tMax = this.config.tMax ?? defaults.tMax;
    this.logMin = Math.log10(tMin);
    this.logMax = Math.log10(tMax);

    // epochs
    this.epochs = (this.config.epochs ?? defaults.epochs).slice().sort((a,b)=>a.start-b.start);

    // starting time
    const startT = Math.min(Math.max(this.config.initialT ?? defaults.initialT, tMin), tMax);
    this.slider = (Math.log10(startT) - this.logMin) / (this.logMax - this.logMin);
    this.updateTime();
  }

  // ---------- lifecycle
  ngAfterViewInit() {
    this.applyConfig();
    this.setupCanvases();
    this.animate();

    // responsive full-width
    this.ro = new ResizeObserver(() => this.setupCanvases());
    this.ro.observe(this.canvasRef.nativeElement);
  }
  ngOnDestroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
  }

  // ---------- derived epoch
  get currentEpoch(): Epoch | undefined {
    return this.epochs.find(e => this.t >= e.start && this.t <= e.end);
  }

  // ---------- UI
  setTFromInput(ev: Event) {
    this.slider = +(ev.target as HTMLInputElement).value;
    this.updateTime();
  }
  private updateTime() {
    const logT = this.logMin + this.slider * (this.logMax - this.logMin);
    this.t = Math.pow(10, logT);
  }

  // ---------- canvas setup
  private setupCanvases() {
    const c = this.canvasRef.nativeElement;
    const cssW = c.clientWidth || 800;
    const cssH = this.height;

    c.width  = Math.floor(cssW * this.dpr);
    c.height = Math.floor(cssH * this.dpr);
    c.style.height = cssH + 'px';

    this.ctx = c.getContext('2d')!;
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.scale(this.dpr, this.dpr);

    if (!this.off) this.off = document.createElement('canvas');
    this.off.width  = c.width;
    this.off.height = c.height;
    this.offCtx = this.off.getContext('2d')!;
    this.offCtx.setTransform(1,0,0,1,0,0);
    this.offCtx.scale(this.dpr, this.dpr);
  }

  // ---------- render loop
  private animate = () => {
    this.drawFrame();
    this.raf = requestAnimationFrame(this.animate);
  };

  private drawFrame() {
    const c = this.canvasRef.nativeElement;
    const w = c.width / this.dpr;
    const h = c.height / this.dpr;

    // --- background: hot early → cool → near-black in Dark Ages
    const postRecomb = this.t >= 3.7e5 * YEAR;
    const darkAges   = postRecomb && this.t < 1.5e8 * YEAR;

    const g = this.ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.1);
    if (darkAges) {
      g.addColorStop(0, 'rgba(20,30,60,0.10)');
      g.addColorStop(1, 'rgba(5,8,20,1)');
    } else if (postRecomb) {
      // cool tint, no warmth
      g.addColorStop(0, 'rgba(120,160,255,0.12)');
      g.addColorStop(1, 'rgba(8,12,28,1)');
    } else {
      // early hot = gradient from bright blue through yellow, orange, red, gray, to black
      const heat = this.heat(); // 1 → 0 (hottest to coolest)

      // Directly map heat to core color
      let core;
      if (heat > 0.85) {
        core = 'rgba(60, 180, 255, 1.0)'; // Bright blue (hottest)
      } else if (heat > 0.7) {
        core = 'rgba(130, 210, 255, 1.0)'; // Light blue
      } else if (heat > 0.55) {
        core = 'rgba(255, 240, 110, 1.0)'; // Yellow
      } else if (heat > 0.4) {
        core = 'rgba(255, 170, 50, 1.0)'; // Orange
      } else if (heat > 0.25) {
        core = 'rgba(230, 100, 80, 1.0)'; // Faint red
      } else if (heat > 0.1) {
        core = 'rgba(170, 110, 110, 1.0)'; // Reddish gray
      } else {
        core = 'rgba(120, 120, 130, 1.0)'; // Gray (coolest)
      }

      // Build the gradient with direct color stops
      g.addColorStop(0, core);

      // Create a series of color stops based on the heat level
      if (heat > 0.85) { // Hottest - bright blue core with light blue halo
        g.addColorStop(0.2, 'rgba(100, 180, 255, 0.9)');
        g.addColorStop(0.4, 'rgba(180, 230, 255, 0.7)');
        g.addColorStop(0.7, 'rgba(220, 240, 255, 0.4)');
      } else if (heat > 0.7) { // Light blue transitioning to yellow
        g.addColorStop(0.2, 'rgba(180, 230, 255, 0.9)');
        g.addColorStop(0.4, 'rgba(220, 240, 200, 0.7)');
        g.addColorStop(0.7, 'rgba(240, 240, 180, 0.4)');
      } else if (heat > 0.55) { // Yellow with orange hints
        g.addColorStop(0.2, 'rgba(255, 240, 110, 0.9)');
        g.addColorStop(0.4, 'rgba(255, 210, 100, 0.7)');
        g.addColorStop(0.7, 'rgba(255, 180, 80, 0.4)');
      } else if (heat > 0.4) { // Orange with red hints
        g.addColorStop(0.2, 'rgba(255, 170, 50, 0.9)');
        g.addColorStop(0.4, 'rgba(255, 140, 60, 0.7)');
        g.addColorStop(0.7, 'rgba(240, 120, 80, 0.4)');
      } else if (heat > 0.25) { // Red with reddish gray hints
        g.addColorStop(0.2, 'rgba(230, 100, 80, 0.9)');
        g.addColorStop(0.4, 'rgba(210, 100, 90, 0.7)');
        g.addColorStop(0.7, 'rgba(180, 110, 100, 0.4)');
      } else if (heat > 0.1) { // Reddish gray to gray
        g.addColorStop(0.2, 'rgba(170, 110, 110, 0.8)');
        g.addColorStop(0.4, 'rgba(150, 110, 120, 0.6)');
        g.addColorStop(0.7, 'rgba(130, 110, 130, 0.3)');
      } else { // Gray to black
        g.addColorStop(0.2, 'rgba(120, 120, 130, 0.7)');
        g.addColorStop(0.4, 'rgba(100, 100, 110, 0.5)');
        g.addColorStop(0.7, 'rgba(80, 80, 90, 0.3)');
      }

      // Always end with near-black
      g.addColorStop(1, 'rgba(8, 12, 28, 1)');
    }
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0,0,w,h);


    // --- offscreen emissive (additive)
    const oc = this.offCtx;
    oc.save();
    oc.globalCompositeOperation = 'lighter';
    oc.clearRect(0,0,w,h);

    if      (this.t < 1e-32)                this.drawInflation(oc,w,h);
    else if (this.t < 1e-6)                 this.drawHadronisation(oc,w,h);
    else if (this.t < 10)                   this.drawLeptons(oc,w,h);
    else if (this.t < 2)                    this.drawNeutrinoEra(oc,w,h);
    else if (this.t < 120)                  this.drawPhotonEra(oc,w,h);     // faint warm haze
    else if (this.t < 1200)                 this.drawBBN(oc,w,h);           // nuclei hints
    else if (this.t < 3.7e5*YEAR)           this.drawPlasma(oc,w,h);        // soft warm fog
    else if (this.t < 1.5e8*YEAR)           this.drawDarkAges(oc,w,h);      // almost nothing
    else if (this.t < 5e8*YEAR)             this.drawFirstStars(oc,w,h);    // sparse bright
    else                                     this.drawGalaxies(oc,w,h);     // starfields
    oc.restore();

    // --- bloom tuned by epoch
    let bloomAlpha = 0.85;
    let blurPx = 6;
    if (darkAges)      { bloomAlpha = 0.22; blurPx = 3; }
    else if (postRecomb) { bloomAlpha = 0.45; blurPx = 5; }

    this.ctx.save();
    this.ctx.filter = `blur(${blurPx}px)`;
    this.ctx.globalAlpha = bloomAlpha;
    this.ctx.drawImage(this.off, 0, 0, this.off.width, this.off.height, 0,0, w, h);
    this.ctx.filter = 'none';
    this.ctx.globalAlpha = 1;
    this.ctx.drawImage(this.off, 0, 0, this.off.width, this.off.height, 0,0, w, h);
    this.ctx.restore();
  }

  // ---------- epoch visuals
  private drawInflation(ctx:CanvasRenderingContext2D, w:number, h:number){
    const t = performance.now()/1000;
    ctx.lineWidth = 8;
    for (let r = 20; r < Math.max(w,h); r += 40) {
      ctx.strokeStyle = `rgba(255,220,140,0.7)`;
      ctx.beginPath();
      ctx.arc(w/2, h/2, r + Math.sin(t*3 + r*0.05)*10, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,245,210,0.95)';
    ctx.beginPath(); ctx.arc(w/2, h/2, 28 + Math.sin(t*5)*6, 0, 2*Math.PI); ctx.fill();
  }

  private drawHadronisation(ctx:CanvasRenderingContext2D,w:number,h:number){
    // very faint clustering glow (caricature)
    for(let i=0;i<80;i++){
      const x = Math.random()*w, y = Math.random()*h;
      ctx.fillStyle = '#ffd48033'; ctx.beginPath(); ctx.arc(x,y,10,0,2*Math.PI); ctx.fill();
    }
  }

  private drawLeptons(ctx:CanvasRenderingContext2D,w:number,h:number){
    for(let i=0;i<220;i++){
      ctx.fillStyle = 'rgba(180,220,255,0.8)';
      ctx.fillRect(Math.random()*w, Math.random()*h, 1, 1);
    }
  }

  private drawNeutrinoEra(ctx:CanvasRenderingContext2D, w:number, h:number){
    const t = performance.now()/1000;
    const R = Math.min(w,h)/2;
    for (let i=0;i<240;i++){
      const a = (i/240)*Math.PI*2 + (t*0.6) % (Math.PI*2);
      const r1 = (i%40)/40 * R*0.3;
      const r2 = R*(0.45 + ((i*37)%100)/100 * 0.5);
      const x1 = w/2 + Math.cos(a)*r1, y1 = h/2 + Math.sin(a)*r1;
      const x2 = w/2 + Math.cos(a)*r2, y2 = h/2 + Math.sin(a)*r2;
      ctx.strokeStyle = 'rgba(180,220,255,0.9)';
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    ctx.globalAlpha = 0.06; ctx.fillStyle = '#8cc6ff'; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1;
  }

  private drawPhotonEra(ctx:CanvasRenderingContext2D,w:number,h:number){
    ctx.globalAlpha = 0.12; ctx.fillStyle = '#6fb7ff'; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1;
  }

  private drawBBN(ctx:CanvasRenderingContext2D,w:number,h:number){
    for(let i=0;i<60;i++){
      const x = Math.random()*w, y = Math.random()*h;
      const g = ctx.createRadialGradient(x,y,0,x,y,7);
      g.addColorStop(0,'rgba(255,240,200,0.8)'); g.addColorStop(1,'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,7,0,2*Math.PI); ctx.fill();
    }
  }

  private drawPlasma(ctx:CanvasRenderingContext2D,w:number,h:number){
    ctx.globalAlpha = 0.08; ctx.fillStyle = '#78a7ff'; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1;
    for (const p of this.quarks){
      p.x += p.vx*0.02; p.y += p.vy*0.02;
      if (p.x<0||p.x>1) p.vx*=-1;
      if (p.y<0||p.y>1) p.vy*=-1;
      const x = p.x*w, y = p.y*h;
      ctx.beginPath(); ctx.fillStyle = p.c;
      ctx.arc(x,y, p.r*0.7, 0, Math.PI*2); ctx.fill();
    }
  }

  private drawDarkAges(ctx:CanvasRenderingContext2D,w:number,h:number){
    // almost black; a hint of residual photons
    ctx.globalAlpha = 0.02; ctx.fillStyle = '#9bb7ff'; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1;
  }

  private drawFirstStars(ctx:CanvasRenderingContext2D,w:number,h:number){
    // sparse bright points (few massive stars)
    for(let i=0;i<80;i++){
      const x = Math.random()*w, y = Math.random()*h;
      const g = ctx.createRadialGradient(x,y,0,x,y,12);
      g.addColorStop(0,'rgba(255,255,220,1)'); g.addColorStop(1,'rgba(255,255,220,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,12,0,2*Math.PI); ctx.fill();
    }
  }

  private drawGalaxies(ctx:CanvasRenderingContext2D, w:number, h:number){
    // spirals + dense starfield (cool/white only)
    const rand = this.rng(999);
    for (let i=0;i<7;i++){
      const cx = rand()*w, cy = rand()*h;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let a=0; a<Math.PI*4; a+=0.2){
        const r = a*5 + rand()*2;
        const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r;
        ctx.fillRect(x,y,1,1);
      }
    }
    ctx.globalAlpha = .9;
    for (let i=0;i<550;i++){
      ctx.fillStyle = `rgba(255,255,255,${0.4+rand()*0.6})`;
      ctx.fillRect(rand()*w, rand()*h, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- helpers
  private heat(): number {
    // 1 at early times → 0 at late times
    const v = (Math.log10(this.t) - this.logMin) / (this.logMax - this.logMin);
    return 1 - Math.min(Math.max(v,0),1);
  }
  private rng(seed=1234){ let s=seed>>>0; return ()=> (s = (s*1664525+1013904223)>>>0) / 4294967296; }

  // Friendly age formatting:
  // - >= 1s: k/m/b suffix
  // - < 1s: ms, µs, ns, ps, fs, as…
  fmtAge(s: number): string {
    if (s >= 1e9) return `${(s/1e9).toFixed(this.frac(s,1e9))} b s`;
    if (s >= 1e6) return `${(s/1e6).toFixed(this.frac(s,1e6))} m s`;
    if (s >= 1e3) return `${(s/1e3).toFixed(this.frac(s,1e3))} k s`;
    if (s >= 1)   return `${s.toFixed(this.frac(s,1))} s`;

    const units = [
      {u:'ms', f:1e-3},{u:'µs',f:1e-6},{u:'ns',f:1e-9},{u:'ps',f:1e-12},
      {u:'fs',f:1e-15},{u:'as',f:1e-18},{u:'zs',f:1e-21},{u:'ys',f:1e-24},
    ];
    for (const {u,f} of units) {
      if (s >= f) return `${(s/f).toFixed(2)} ${u}`;
    }
    return s.toExponential(2) + ' s';
  }
  private frac(n:number, unit:number){ return (n % unit === 0) ? 0 : 2; }

  dragging = false;

  onScrub(ev: Event) {
    this.slider = +(ev.target as HTMLInputElement).value;
    this.updateTime();
  }

  /** On release, animate to the nearest epoch boundary (soft snap) */
  onScrubEnd() {
    this.dragging = false;
    const targetT = this.nearestEpochBoundary(this.t);
    this.animateToT(targetT, 320); // 320ms ease-out
  }

  private nearestEpochBoundary(currentT: number): number {
    const bounds = Array.from(new Set(this.epochs.map(e => e.start).concat([3.7e5*31557600]))).sort((a,b)=>a-b);
    const lg = Math.log10(currentT);
    let best = currentT, bestD = Infinity;
    for (const b of bounds) {
      const d = Math.abs(Math.log10(b) - lg);
      if (d < bestD) { bestD = d; best = b; }
    }
    // snap only if within 0.15 decade
    return bestD < 0.15 ? best : currentT;
  }

  /** Ease slider to a time in ms duration */
  protected animateToT(targetT: number, duration = 300) {
    const start = performance.now();
    const startSlider = this.slider;
    const targetSlider = (Math.log10(targetT) - this.logMin) / (this.logMax - this.logMin);
    const ease = (x:number)=>1-Math.pow(1-x,3); // easeOutCubic

    const step = (now:number) => {
      const t = Math.min((now - start)/duration, 1);
      this.slider = startSlider + (targetSlider - startSlider) * ease(t);
      this.updateTime();
      if (t < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

}
