"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"
import { toast } from 'sonner';

const suggestedFonts = [
    { name: 'Inter', category: 'sans' },
    { name: 'Roboto', category: 'sans' },
    { name: 'Sora', category: 'sans' },
    { name: 'Helvetica', category: 'sans' },
    { name: 'Barlow', category: 'sans' },
    { name: 'Metropolis', category: 'sans' },
    { name: 'Saira', category: 'sans' },
    { name: 'Raleway', category: 'sans' },
    { name: 'Quicksand', category: 'sans' },
    { name: 'Nunito', category: 'sans' },
    { name: 'Poppins', category: 'sans' },
    { name: 'Manrope', category: 'sans' },
    { name: 'Exo', category: 'sans' },
    { name: 'Plus Jakarta Sans', category: 'sans' },
    { name: 'Lato', category: 'sans' },
    { name: 'Rubik', category: 'sans' },
    { name: 'Space Grotesk', category: 'sans' },
    { name: 'Fira Sans', category: 'sans' },
    { name: 'Open Sans', category: 'sans' },
    { name: 'Cinzel', category: 'serif' }, // Treated as Display/Serif
    { name: 'Barlow Condensed', category: 'condensed' },
    { name: 'Merriweather', category: 'serif' },
    { name: 'Playfair Display', category: 'serif' },
];

export function TypographyCalculator() {
    const [baseSize, setBaseSize] = useState(16);
    const [targetPx, setTargetPx] = useState(16);
    const [selectedFontName, setSelectedFontName] = useState('Inter');
    const [results, setResults] = useState({
        rem: '1rem',
        lineHeight: '1.5',
        letterSpacing: '0em'
    });

    useEffect(() => {
        const px = parseFloat(targetPx) || 0;
        const base = parseFloat(baseSize) || 16;
        const font = suggestedFonts.find(f => f.name === selectedFontName) || suggestedFonts[0];
        const category = font.category;

        if (px === 0) return;

        // REM Calculation
        const remVal = px / base;

        // Base Logic
        let lh = 1.5;
        let ls = 0;

        // 1. Calculate Base Values based on Size
        if (px > 20) { lh = 1.4; ls = -0.01; }
        if (px > 32) { lh = 1.2; ls = -0.02; }
        if (px > 48) { lh = 1.1; ls = -0.03; }
        if (px < 14) { lh = 1.6; ls = 0.02; }

        // 2. Adjust based on Font Category
        switch (category) {
            case 'serif':
                lh += 0.1;
                if (px < 20) ls += 0.01;
                break;
            case 'condensed':
                ls += 0.02; // Condensed fonts often need a tiny bit more room to breathe if not display
                break;
            case 'mono':
                if (px < 20) ls = 0;
                else ls = -0.02;
                break;
            // sans is default
        }

        // Special case for Display titles regardless of category
        if (px > 60) {
            lh = Math.max(1.0, lh - 0.1);
        }

        setResults({
            rem: `${parseFloat(remVal.toFixed(3))}rem`,
            lineHeight: parseFloat(lh.toFixed(2)).toString(),
            letterSpacing: `${parseFloat(ls.toFixed(3))}em`
        });
    }, [targetPx, baseSize, selectedFontName]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para a área de transferência!');
    };

    const generateCSS = () => {
        return `font-family: '${selectedFontName}', sans-serif;
font-size: ${results.rem};
line-height: ${results.lineHeight};
letter-spacing: ${results.letterSpacing};`;
    };

    // Load ALL fonts on mount to ensure instant preview
    useEffect(() => {
        const fontFamilies = suggestedFonts
            .filter(f => !['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'].includes(f.name))
            .map(f => `family=${f.name.replace(/\s+/g, '+')}:wght@300;400;500;700`);

        const query = fontFamilies.join('&');
        const href = `https://fonts.googleapis.com/css2?${query}&display=swap`;

        if (!document.getElementById('google-fonts-all')) {
            const link = document.createElement('link');
            link.id = 'google-fonts-all';
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Calculadora REM Inteligente</CardTitle>
                    <CardDescription>Ajustes ópticos baseados no tamanho e na fonte escolhida.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tamanho Base (HTML)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={baseSize}
                                    onChange={(e) => setBaseSize(e.target.value)}
                                    className="w-full"
                                />
                                <span className="text-muted-foreground text-sm">px</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Fonte do Projeto</Label>
                            <Select value={selectedFontName} onValueChange={setSelectedFontName}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectGroup>
                                        <SelectLabel>Sans Serif</SelectLabel>
                                        {suggestedFonts.filter(f => f.category === 'sans').map(f => (
                                            <SelectItem key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Serif / Display</SelectLabel>
                                        {suggestedFonts.filter(f => f.category === 'serif').map(f => (
                                            <SelectItem key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Outras</SelectLabel>
                                        {suggestedFonts.filter(f => f.category === 'condensed' || f.category === 'mono').map(f => (
                                            <SelectItem key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tamanho Desejado</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={targetPx}
                                onChange={(e) => setTargetPx(e.target.value)}
                                className="flex-1"
                            />
                            <span className="text-muted-foreground font-bold w-8">px</span>
                        </div>
                        <Slider
                            value={[targetPx]}
                            min={10}
                            max={100}
                            step={1}
                            onValueChange={(val) => setTargetPx(val[0])}
                            className="py-4"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card bg-secondary/10 border-primary/20">
                <CardHeader>
                    <CardTitle>Resultado Otimizado</CardTitle>
                    <CardDescription>Valores calculados para {selectedFontName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-background border border-border text-center">
                            <p className="text-xs text-muted-foreground mb-1">Size</p>
                            <p className="font-mono font-bold text-primary">{results.rem}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background border border-border text-center">
                            <p className="text-xs text-muted-foreground mb-1">Line Height</p>
                            <p className="font-mono font-bold text-green-500">{results.lineHeight}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background border border-border text-center">
                            <p className="text-xs text-muted-foreground mb-1">Spacing</p>
                            <p className="font-mono font-bold text-blue-500">{results.letterSpacing}</p>
                        </div>
                    </div>

                    <div className="relative p-4 rounded-lg bg-black/80 font-mono text-sm text-gray-300">
                        <pre className="whitespace-pre-wrap">
                            {generateCSS()}
                        </pre>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8 hover:bg-white/10"
                            onClick={() => copyToClipboard(generateCSS())}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Preview ({selectedFontName}):</p>
                        <p style={{
                            fontSize: `${targetPx}px`,
                            lineHeight: results.lineHeight,
                            letterSpacing: results.letterSpacing,
                            fontFamily: `"${selectedFontName}", sans-serif`, // Fallback mostly sans
                            transition: 'all 0.2s'
                        }}>
                            The quick brown fox jumps over the lazy dog.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
