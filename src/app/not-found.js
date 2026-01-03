import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
            <h2 className="text-4xl font-bold">404 - Página Não Encontrada</h2>
            <p className="text-muted-foreground">Opa! Parece que você se perdeu.</p>
            <Button asChild className="gradient-primary">
                <Link href="/dashboard">Voltar para o Dashboard</Link>
            </Button>
        </div>
    )
}
