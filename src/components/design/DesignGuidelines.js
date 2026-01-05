"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export function DesignGuidelines() {
    return (
        <div className="space-y-8">

            {/* Section 1: Font Suggestions */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Sugestões de Fontes</CardTitle>
                    <CardDescription>Combinações testadas e aprovadas para seus layouts</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Opção 1</TableHead>
                                <TableHead className="w-[25%]">Opção 2</TableHead>
                                <TableHead className="w-[25%]">Opção 3</TableHead>
                                <TableHead className="w-[25%]">Opção 4</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Sora</TableCell>
                                <TableCell>Helvetica</TableCell>
                                <TableCell>Barlow</TableCell>
                                <TableCell>Metropolis</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Saira</TableCell>
                                <TableCell>Raleway</TableCell>
                                <TableCell>Quicksand</TableCell>
                                <TableCell>Nunito</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Poppins</TableCell>
                                <TableCell>Manrope</TableCell>
                                <TableCell>Exo</TableCell>
                                <TableCell>Plus Jakarta Sans</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Inter</TableCell>
                                <TableCell>Lato</TableCell>
                                <TableCell>Rubik</TableCell>
                                <TableCell>Space Grotesk</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Fira Sans</TableCell>
                                <TableCell>Open Sans</TableCell>
                                <TableCell>CINZEL</TableCell>
                                <TableCell>Barlow Condensed</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Section 2: Typography Scale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Escala Tipográfica: Desktop</CardTitle>
                        <CardDescription>Tamanhos recomendados para telas grandes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="block text-sm font-semibold text-muted-foreground mb-1">Títulos</span>
                            <div className="bg-secondary/20 p-3 rounded-md border border-border/50">
                                <p className="text-xl font-bold">32px a 64px</p>
                                <p className="text-xs text-muted-foreground mt-1">2em a 4em</p>
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-semibold text-muted-foreground mb-1">Subtítulos</span>
                            <div className="bg-secondary/20 p-3 rounded-md border border-border/50">
                                <p className="text-lg font-semibold">20px a 24px</p>
                                <p className="text-xs text-muted-foreground mt-1">1.25em a 1.5em</p>
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-semibold text-muted-foreground mb-1">Parágrafos</span>
                            <div className="bg-secondary/20 p-3 rounded-md border border-border/50">
                                <p className="text-base">14px a 18px</p>
                                <p className="text-xs text-muted-foreground mt-1">0.875em a 1.125em</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Escala Tipográfica: Mobile</CardTitle>
                        <CardDescription>Adaptação para telas pequenas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="block text-sm font-semibold text-muted-foreground mb-1">Títulos</span>
                            <div className="bg-secondary/20 p-3 rounded-md border border-border/50">
                                <p className="text-xl font-bold">24px a 40px</p>
                                <p className="text-xs text-muted-foreground mt-1">1.5em a 2.5em</p>
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-semibold text-muted-foreground mb-1">Subtítulos</span>
                            <div className="bg-secondary/20 p-3 rounded-md border border-border/50">
                                <p className="text-lg font-semibold">18px a 20px</p>
                                <p className="text-xs text-muted-foreground mt-1">1.125em a 1.25em</p>
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-semibold text-muted-foreground mb-1">Parágrafos</span>
                            <div className="bg-secondary/20 p-3 rounded-md border border-border/50">
                                <p className="text-base">14px a 16px</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 3: Spacing System */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Sistema de Espaçamento (Respiro)</CardTitle>
                    <CardDescription>Regras para consistência visual e ritmo vertical</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">8</span>
                                Regra de 8 Pontos
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">Para tamanhos de fontes e espaçamentos entre itens menores.</p>
                            <div className="flex flex-wrap gap-2">
                                {[4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128, 256].map(size => (
                                    <div key={size} className="flex flex-col items-center">
                                        <div className="h-8 bg-primary/20 rounded border border-primary/30 flex items-center justify-center text-xs w-full px-2">
                                            {size}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">20</span>
                                Regra de 20 Pontos
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">Para tamanhos de sessões e margens maiores.</p>
                            <div className="flex flex-wrap gap-2">
                                {[20, 40, 60, 80, 100, 120, 160, 180].map(size => (
                                    <div key={size} className="flex flex-col items-center">
                                        <div className="h-8 bg-secondary rounded border border-secondary-foreground/20 flex items-center justify-center text-xs w-full px-2">
                                            {size}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-foreground">Paddings Recomendados (Vertical)</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-background p-3 rounded border">
                                <span className="text-sm font-medium">Desktop</span>
                                <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded text-primary">80px - 128px</span>
                            </div>
                            <div className="flex justify-between items-center bg-background p-3 rounded border">
                                <span className="text-sm font-medium">Tablet</span>
                                <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded text-primary">64px - 80px</span>
                            </div>
                            <div className="flex justify-between items-center bg-background p-3 rounded border">
                                <span className="text-sm font-medium">Mobile</span>
                                <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded text-primary">64px</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
