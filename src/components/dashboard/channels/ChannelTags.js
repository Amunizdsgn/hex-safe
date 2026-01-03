"use client"

import { Tag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export function ChannelTags({ channels }) {
    // Extract unique tags
    const allTags = Array.from(new Set(channels.flatMap(c => c.tags || [])));

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-2 px-2">
                <Tag className="w-3 h-3" /> Filtros:
            </span>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors">
                Todos
            </Badge>
            {allTags.map(tag => (
                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors">
                    {tag}
                </Badge>
            ))}
        </div>
    );
}
