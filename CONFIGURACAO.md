# Configurar o VersoParty (passo a passo)

O Render Static Site hospeda os arquivos do site. O Supabase guarda os vídeos e os dados para que todos os visitantes vejam o mesmo catálogo.

## 1. Criar o Supabase
1. Acesse https://supabase.com e crie uma conta/projeto.
2. No painel do projeto, abra **SQL Editor** > **New query**.
3. Abra `supabase.sql`, copie tudo, cole no SQL Editor e clique em **Run**.
4. Vá a **Project Settings** > **API** (ou **API Keys**).
5. Copie a **Project URL** e a chave **publishable** (ou a chave `anon` legada). Nunca use `service_role` ou `secret key` no site.

## 2. Ligar o site ao Supabase
1. Abra `app.js`.
2. Troque `COLE_A_URL_DO_SEU_PROJETO` pela Project URL.
3. Troque `COLE_SUA_CHAVE_PUBLICA` pela chave publishable/anon.
4. Salve o arquivo.

## 3. Atualizar o GitHub
1. Abra o repositório https://github.com/wagnerrodriguessilva128-bit/versoparty
2. Clique em **Add file** > **Upload files**.
3. Envie `index.html`, `style.css`, `app.js`, `supabase.sql`, `CONFIGURACAO.md` e `README.md` (substitua os arquivos existentes quando solicitado).
4. Clique em **Commit changes**.
5. O Render deve publicar a atualização automaticamente. Aguarde o status **Live**.

## 4. Aprovar vídeos enviados
No Supabase, abra **Table Editor** > `videos`.
- `pending`: aguardando aprovação.
- Para publicar, altere `status` para `approved`.
- Para negar, altere `status` para `rejected`.

Os visitantes só conseguem ver vídeos aprovados. Faça a moderação antes de aprovar conteúdo.

## Limites e cuidados
- O formulário limita arquivos a 50 MB e aceita MP4, WebM e MOV. O bucket também aplica limite de 50 MB.
- O plano gratuito do Supabase tem limites de armazenamento e transferência; confira o painel de uso antes de receber muitos vídeos.
- Upload anônimo pode receber spam ou conteúdo impróprio. As políticas permitem envio pendente, não publicação direta, mas para um site aberto ao público é recomendável adicionar autenticação, CAPTCHA, limites de envio e moderação.
- Curtidas simples usam o navegador e não impedem completamente curtidas repetidas por outros dispositivos.
- Links do YouTube precisam ser vídeos públicos/incorporáveis. Alguns vídeos bloqueiam incorporação por decisão do proprietário.
- Compartilhe apenas vídeos seus ou que você tenha autorização para publicar.
