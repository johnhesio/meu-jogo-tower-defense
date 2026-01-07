// Exportamos para poder usar noutros arquivos
export const ELEMENTOS = {
    AGUA: { cor: '#3498db', forteContra: 'FOGO' },
    FOGO: { cor: '#e74c3c', forteContra: 'AR' },
    TERRA: { cor: '#795548', forteContra: 'AGUA' },
    AR: { cor: '#ecf0f1', forteContra: 'TERRA' },
    LUZ: { cor: '#f1c40f', forteContra: 'ESCURIDAO' },
    ESCURIDAO: { cor: '#8e44ad', forteContra: 'LUZ' }
};

export const CAMINHO = [
    { x: 0, y: 540 },
    { x: 960, y: 540 },
    { x: 960, y: 200 },
    { x: 1500, y: 200 },
    { x: 1500, y: 900 },
    { x: 1920, y: 900 }
];