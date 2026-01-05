"use client"

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, KeyRound, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecoverPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleRecover = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/atualizar-senha`,
            });

            if (error) {
                throw error;
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <KeyRound className="w-6 h-6 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
                <CardDescription>
                    Digite seu email para receber um link de redefinição
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {success ? (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex flex-col items-center gap-3 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <div className="space-y-1">
                            <h3 className="font-semibold text-green-500">Email enviado!</h3>
                            <p className="text-sm text-muted-foreground">
                                Verifique sua caixa de entrada para redefinir sua senha.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleRecover} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                className="bg-secondary/50 border-white/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full gradient-primary hover:opacity-90 transition-opacity"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Enviar link de recuperação
                        </Button>
                    </form>
                )}
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o login
                </Link>
            </CardFooter>
        </Card>
    );
}
