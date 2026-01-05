"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const curatedFonts = [
    {
        name: 'Inter',
        category: 'Sans Serif',
        description: 'A moderna e versátil fonte padrão da web atual. Excelente legibilidade.',
        importCode: '@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\');',
        cssCode: 'font-family: \'Inter\', sans-serif;',
        previewText: 'A rápida raposa marrom pula sobre o cão preguiçoso.'
    },
    {
        name: 'Playfair Display',
        category: 'Serif',
        description: 'Ideal para títulos elegantes e editoriais. Traz sofisticação.',
        importCode: '@import url(\'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap\');',
        cssCode: 'font-family: \'Playfair Display\', serif;',
        previewText: 'Elegância é apenas uma questão de escolha.'
    },
    {
        name: 'Roboto',
        category: 'Sans Serif',
        description: 'Geométrica e amigável. A fonte padrão do Material Design.',
        importCode: '@import url(\'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap\');',
        cssCode: 'font-family: \'Roboto\', sans-serif;',
        previewText: 'Design é inteligência tornada visível.'
    },
    {
        name: 'Outfit',
        category: 'Sans Serif',
        description: 'Moderna, geométrica e com personalidade. Ótima para marcas tech.',
        importCode: '@import url(\'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap\');',
        cssCode: 'font-family: \'Outfit\', sans-serif;',
        previewText: 'O futuro é construído hoje.'
    },
    {
        name: 'Fira Code',
        category: 'Monospace',
        description: 'A melhor fonte para programar, com ligaturas para símbolos de código.',
        importCode: '@import url(\'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap\');',
        cssCode: 'font-family: \'Fira Code\', monospace;',
        previewText: 'const design = () => { return "Awesome" };'
    }
];

export function FontGallery() {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado!');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedFonts.map((font) => (
                <Card key={font.name} className="glass-card hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{font.name}</CardTitle>
                            <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">{font.category}</span>
                        </div>
                        <CardDescription className="line-clamp-2">{font.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded bg-secondary/20 border border-border/50">
                            <p className="text-lg" style={{ fontFamily: font.name }}>{font.previewText}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => copyToClipboard(font.importCode)}
                            >
                                <Copy className="w-3 h-3 mr-2" /> Import
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => copyToClipboard(font.cssCode)}
                            >
                                <Copy className="w-3 h-3 mr-2" /> CSS
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed border-2 border-muted-foreground/20 bg-transparent hover:bg-secondary/10 transition-colors cursor-pointer text-center">
                <ExternalLink className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="font-medium">Google Fonts</p>
                <p className="text-xs text-muted-foreground">Explorar mais opções</p>
            </Card>
        </div>
    );
}
