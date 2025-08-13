export interface ElementRecord {
  atomicNumber: number;
  symbol: string;
  nameEn: string;
  nameNl: string;
  color: string;
}

// iconic color mapping
export const COLOR: Record<string, string> = {
  H: '#e6f2ff', He: '#ffb3e6', Li: '#d0d0dd', Be: '#cfd7db', B: '#88a0b0', C: '#1c1c1c',
  N: '#2f6fff', O: '#3da1ff', F: '#b7ff2f', Ne: '#ff7f33', Na: '#d0d0d0', Mg: '#cfd6d3',
  Al: '#c9ced4', Si: '#6e6f75', P: '#d23a3a', S: '#ffd400', Cl: '#b0ff00', Ar: '#b080ff',
  K: '#d0c3ff', Ca: '#d4dbd1', Sc: '#cdd4db', Ti: '#c7d0d6', V: '#c5cbd4', Cr: '#c1ccd7',
  Mn: '#c0c7d0', Fe: '#c7c7c7', Co: '#9ab1c8', Ni: '#c0c9cf', Cu: '#ff7f3a', Zn: '#cfd8de',
  Ga: '#b9c8cf', Ge: '#7a8a91', As: '#6f7c82', Se: '#ffa37a', Br: '#a14b2b', Kr: '#a0ffcf',
  Rb: '#d1c1ff', Sr: '#d0e0c8', Y: '#c7d8e1', Zr: '#c6cfd6', Nb: '#c3cdd5', Mo: '#c1cbd4',
  Tc: '#b9c4cc', Ru: '#bac7d3', Rh: '#bfcad1', Pd: '#c6d1d7', Ag: '#dcdfe6', Cd: '#c7dbe2',
  In: '#b8cbd6', Sn: '#ccd7de', Sb: '#8596a8', Te: '#7f9bb6', I: '#6a35b8', Xe: '#6db2ff',
  Cs: '#e7caff', Ba: '#d7e8bf', La: '#c5d8e0', Ce: '#c2d4dc', Pr: '#bcd0d8', Nd: '#b6ccd6',
  Pm: '#a6c3cf', Sm: '#a0bdc9', Eu: '#9cbad0', Gd: '#98b5c8', Tb: '#94b0c2', Dy: '#90adbf',
  Ho: '#8aa7ba', Er: '#86a3b6', Tm: '#829fb2', Yb: '#7e9aad', Lu: '#7a96a9', Hf: '#c6ced3',
  Ta: '#c3cbd0', W: '#aeb8bf', Re: '#a6b1b9', Os: '#9eabb4', Ir: '#96a4ad', Pt: '#d5dbe2',
  Au: '#ffcc33', Hg: '#cdd6df', Tl: '#aebfcb', Pb: '#8b8f98', Bi: '#7e8791', Po: '#b58ea6',
  At: '#8b62a8', Rn: '#ff77aa', Fr: '#f0c9ff', Ra: '#e0f8c9', Ac: '#c2d6e1', Th: '#bfcfd8',
  Pa: '#b9cad3', U: '#9cff00', Np: '#a2b7c4', Pu: '#a0b3c0', Am: '#9ab0bf', Cm: '#93aab9',
  Bk: '#8ea6b5', Cf: '#89a1b0', Es: '#849cab', Fm: '#7f97a6', Md: '#7a92a1', No: '#768e9d',
  Lr: '#718998', Rf: '#b7c6d1', Db: '#b4c2cd', Sg: '#b1bfca', Bh: '#aebcc7', Hs: '#abb9c4',
  Mt: '#a8b6c1', Ds: '#a5b3be', Rg: '#a2b0bb', Cn: '#9fadb8', Nh: '#9caab5', Fl: '#99a7b2',
  Mc: '#96a4af', Lv: '#93a1ac', Ts: '#908ea9', Og: '#8d8ba6',
};

const RAW: Array<[number, string, string, string]> = [
  [1, "H", "Hydrogen", "Waterstof"], [2, "He", "Helium", "Helium"], [3, "Li", "Lithium", "Lithium"], [4, "Be", "Beryllium", "Beryllium"], [5, "B", "Boron", "Boor"], [6, "C", "Carbon", "Koolstof"], [7, "N", "Nitrogen", "Stikstof"], [8, "O", "Oxygen", "Zuurstof"], [9, "F", "Fluorine", "Fluor"], [10, "Ne", "Neon", "Neon"],
  [11, "Na", "Sodium", "Natrium"], [12, "Mg", "Magnesium", "Magnesium"], [13, "Al", "Aluminum", "Aluminium"], [14, "Si", "Silicon", "Silicium"], [15, "P", "Phosphorus", "Fosfor"], [16, "S", "Sulfur", "Zwavel"], [17, "Cl", "Chlorine", "Chloor"], [18, "Ar", "Argon", "Argon"], [19, "K", "Potassium", "Kalium"], [20, "Ca", "Calcium", "Calcium"],
  [21, "Sc", "Scandium", "Scandium"], [22, "Ti", "Titanium", "Titaan"], [23, "V", "Vanadium", "Vanadium"], [24, "Cr", "Chromium", "Chroom"], [25, "Mn", "Manganese", "Mangaan"], [26, "Fe", "Iron", "IJzer"], [27, "Co", "Cobalt", "Kobalt"], [28, "Ni", "Nickel", "Nikkel"], [29, "Cu", "Copper", "Koper"], [30, "Zn", "Zinc", "Zink"],
  [31, "Ga", "Gallium", "Gallium"], [32, "Ge", "Germanium", "Germanium"], [33, "As", "Arsenic", "Arseen"], [34, "Se", "Selenium", "Selenium"], [35, "Br", "Bromine", "Broom"], [36, "Kr", "Krypton", "Krypton"], [37, "Rb", "Rubidium", "Rubidium"], [38, "Sr", "Strontium", "Strontium"], [39, "Y", "Yttrium", "Yttrium"], [40, "Zr", "Zirconium", "Zirkonium"],
  [41, "Nb", "Niobium", "Niobium"], [42, "Mo", "Molybdenum", "Molybdeen"], [43, "Tc", "Technetium", "Technetium"], [44, "Ru", "Ruthenium", "Ruthenium"], [45, "Rh", "Rhodium", "Rhodium"], [46, "Pd", "Palladium", "Palladium"], [47, "Ag", "Silver", "Zilver"], [48, "Cd", "Cadmium", "Cadmium"], [49, "In", "Indium", "Indium"], [50, "Sn", "Tin", "Tin"],
  [51, "Sb", "Antimony", "Antimoon"], [52, "Te", "Tellurium", "Telluur"], [53, "I", "Iodine", "Jodium"], [54, "Xe", "Xenon", "Xenon"], [55, "Cs", "Cesium", "Caesium"], [56, "Ba", "Barium", "Barium"], [57, "La", "Lanthanum", "Lanthaan"], [58, "Ce", "Cerium", "Cerium"], [59, "Pr", "Praseodymium", "Praseodymium"], [60, "Nd", "Neodymium", "Neodymium"],
  [61, "Pm", "Promethium", "Promethium"], [62, "Sm", "Samarium", "Samarium"], [63, "Eu", "Europium", "Europium"], [64, "Gd", "Gadolinium", "Gadolinium"], [65, "Tb", "Terbium", "Terbium"], [66, "Dy", "Dysprosium", "Dysprosium"], [67, "Ho", "Holmium", "Holmium"], [68, "Er", "Erbium", "Erbium"], [69, "Tm", "Thulium", "Thulium"], [70, "Yb", "Ytterbium", "Ytterbium"],
  [71, "Lu", "Lutetium", "Lutetium"], [72, "Hf", "Hafnium", "Hafnium"], [73, "Ta", "Tantalum", "Tantaal"], [74, "W", "Tungsten", "Wolfraam"], [75, "Re", "Rhenium", "Rhenium"], [76, "Os", "Osmium", "Osmium"], [77, "Ir", "Iridium", "Iridium"], [78, "Pt", "Platinum", "Platina"], [79, "Au", "Gold", "Goud"], [80, "Hg", "Mercury", "Kwik"],
  [81, "Tl", "Thallium", "Thallium"], [82, "Pb", "Lead", "Lood"], [83, "Bi", "Bismuth", "Bismut"], [84, "Po", "Polonium", "Polonium"], [85, "At", "Astatine", "Astatine"], [86, "Rn", "Radon", "Radon"], [87, "Fr", "Francium", "Francium"], [88, "Ra", "Radium", "Radium"], [89, "Ac", "Actinium", "Actinium"], [90, "Th", "Thorium", "Thorium"],
  [91, "Pa", "Protactinium", "Protactinium"], [92, "U", "Uranium", "Uranium"], [93, "Np", "Neptunium", "Neptunium"], [94, "Pu", "Plutonium", "Plutonium"], [95, "Am", "Americium", "Americium"], [96, "Cm", "Curium", "Curium"], [97, "Bk", "Berkelium", "Berkelium"], [98, "Cf", "Californium", "Californium"], [99, "Es", "Einsteinium", "Einsteinium"], [100, "Fm", "Fermium", "Fermium"],
  [101, "Md", "Mendelevium", "Mendelevium"], [102, "No", "Nobelium", "Nobelium"], [103, "Lr", "Lawrencium", "Lawrencium"], [104, "Rf", "Rutherfordium", "Rutherfordium"], [105, "Db", "Dubnium", "Dubnium"], [106, 'Sg', 'Seaborgium', 'Seaborgium'], [107, 'Bh', 'Bohrium', 'Bohrium'], [108, 'Hs', 'Hassium', 'Hassium'], [109, 'Mt', 'Meitnerium', 'Meitnerium'], [110, 'Ds', 'Darmstadtium', 'Darmstadtium'],
  [111, "Rg", "Roentgenium", "Roentgenium"], [112, "Cn", "Copernicium", "Copernicium"], [113, "Nh", "Nihonium", "Nihonium"], [114, "Fl", "Flerovium", "Flerovium"], [115, "Mc", "Moscovium", "Moscovium"], [116, "Lv", "Livermorium", "Livermorium"], [117, "Ts", "Tennessine", "Tennessine"], [118, "Og", "Oganesson", "Oganesson"],
];

export const DEFAULT_ELEMENTS_118: ElementRecord[] = RAW.map(([n, sym, en, nl]) => ({
  atomicNumber: n, symbol: sym, nameEn: en, nameNl: nl, color: COLOR[sym] ?? '#cfd3d8'
}));
