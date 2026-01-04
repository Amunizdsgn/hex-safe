# Como fazer Deploy na Vercel 🚀

Agora que seu código está pronto e conectado ao Supabase, vamos colocá-lo no ar!

## 1. Enviar Código para o GitHub
Como eu já salvei (commit) todas as suas alterações aqui no computador, você só precisa enviar para a nuvem.

Abra seu terminal e rode:
```bash
git push
```
*(Se der erro pedindo para configurar 'upstream', o próprio git vai te dar o comando certo para copiar e colar).*

## 2. Configurar na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** -> **"Project"**.
3. Selecione seu repositório do GitHub (`hex-safe` ou similar).
4. Clique em **Import**.

## 3. Configurar Variáveis de Ambiente (CRÍTICO)
Na tela de configuração do projeto na Vercel, antes de clicar em "Deploy":
1. Procure a seção **"Environment Variables"**.
2. Adicione as mesmas variáveis que colocamos no `.env.local`:
   - **Nome:** `NEXT_PUBLIC_SUPABASE_URL` | **Valor:** (Sua URL do Supabase)
   - **Nome:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Valor:** (Sua Chave Pública do Supabase)
3. Clique em **Deploy**.

## 4. Testar
Assim que finalizar, a Vercel vai te dar um link (ex: `hex-safe.vercel.app`).
Acesse, faça login (se tiver auth configurado) ou navegue. Tudo o que você fizer lá será salvo no seu banco de dados Supabase.

✅ **Parabéns! Seu sistema financeiro está online e profissional.**
