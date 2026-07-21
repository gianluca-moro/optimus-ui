export type Theme = 'Aura' | 'Lara' | 'Material' | 'Nora';

export interface Schema {
    project?: string;
    theme?: Theme;
    skipInstall?: boolean;
}
