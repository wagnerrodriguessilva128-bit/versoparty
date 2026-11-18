# VersoParty

Site estático para compartilhar vídeos enviados por visitantes e links do YouTube. Os envios ficam pendentes até aprovação manual.

## Arquivos
- `index.html`: estrutura da página.
- `style.css`: visual.
- `app.js`: funções e conexão Supabase.
- `supabase.sql`: banco de dados, políticas e bucket de vídeos.
- `CONFIGURACAO.md`: instruções de configuração e publicação.

## Importante
O site publicado anteriormente só tinha um `index.html`. Para uploads públicos persistentes é necessário configurar o Supabase seguindo `CONFIGURACAO.md`. Não coloque a `service_role key` no navegador; use somente a chave publicável/anon.
