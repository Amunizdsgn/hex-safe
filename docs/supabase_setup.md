# Guia de Configuração do Supabase 🚀

Para que seu sistema salve os dados de verdade, siga estes passos. É rápido e gratuito.

## 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com) e faça login (pode usar o GitHub).
2. Clique em **"New Project"**.
3. Escolha a organização (pode criar uma nova).
4. Dê um nome (ex: `hex-safe-financial`).
5. Defina uma senha forte para o banco de dados (guarde-a).
6. Escolha a região mais próxima (São Paulo / Brazil).
7. Clique em **"Create new project"**.

## 2. Rodar o Script do Banco
1. No menu lateral esquerdo, clique em **SQL Editor**.
2. Clique em **"New query"**.
3. Copie **TODO o conteúdo** do arquivo `supabase/schema.sql` do seu projeto local.
4. Cole no editor do Supabase.
5. Clique em **"Run"** (botão verde no canto inferior direito).
   - *Se aparecer "Success", suas tabelas de Clientes, CRM e Transações foram criadas!*

## 3. Pegar as Chaves de Acesso
1. No menu lateral esquerdo, vá em **Project Settings** (ícone de engrenagem).
2. Clique em **API**.
3. Você verá dois campos importantes:
   - **Project URL**: (algo como `https://xyzxyz.supabase.co`)
   - **Project API keys (anon / public)**: (uma chave longa começando com `ey...`)

## 4. Conectar no Projeto
1. No seu computador, na pasta do projeto, crie um arquivo chamado `.env.local`.
2. Cole o seguinte conteúdo, substituindo pelos seus dados do passo anterior:

```bash
NEXT_PUBLIC_SUPABASE_URL=Sua_URL_Aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=Sua_Chave_Publica_Aqui
```

3. Reinicie o terminal do projeto (`Ctrl + C` e depois `npm run dev`).

✅ **Pronto!** Agora vou atualizar o código para começar a ler e gravar nesse banco novo.
