"use client"

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypographyCalculator } from '@/components/design/TypographyCalculator';
import { CodeLibrary } from '@/components/design/CodeLibrary';
import { FontGallery } from '@/components/design/FontGallery';
import { DesignGuidelines } from '@/components/design/DesignGuidelines';
import { PenTool, Code, Type, BookOpen } from 'lucide-react';

export default function DesignToolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Ferramentas de Design</h2>
                <p className="text-muted-foreground">Utilitários para Web Design e Desenvolvimento</p>
            </div>

            <Tabs defaultValue="guidelines" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="guidelines" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Diretrizes
                    </TabsTrigger>
                    <TabsTrigger value="typography" className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Tipografia
                    </TabsTrigger>
                    <TabsTrigger value="library" className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Biblioteca
                    </TabsTrigger>
                    <TabsTrigger value="fonts" className="flex items-center gap-2">
                        <PenTool className="w-4 h-4" />
                        Fontes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="guidelines" className="mt-6 space-y-6">
                    <DesignGuidelines />
                </TabsContent>

                <TabsContent value="typography" className="mt-6 space-y-6">
                    <TypographyCalculator />
                </TabsContent>

                <TabsContent value="library" className="mt-6 space-y-6">
                    <CodeLibrary />
                </TabsContent>

                <TabsContent value="fonts" className="mt-6 space-y-6">
                    <FontGallery />
                </TabsContent>
            </Tabs>
        </div>
    );
}
