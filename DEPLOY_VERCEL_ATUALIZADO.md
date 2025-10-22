# 🚀 Guia de Deploy na Vercel - ATUALIZADO

## ✅ Problema Resolvido

O sistema agora está configurado corretamente para deploy na Vercel. Os arquivos estáticos (CSS, JS, imagens) serão servidos corretamente.

## 📋 Mudanças Realizadas

### 1. **vercel.json** - Configuração Otimizada
- Adicionados builds separados para arquivos estáticos usando `@vercel/static`
- Rotas configuradas para servir CSS, JS e imagens diretamente pela CDN da Vercel
- Rotas de API direcionadas ao servidor Express

### 2. **.vercelignore** - Otimização do Deploy
- Arquivos temporários e desnecessários excluídos do deploy
- Reduz o tamanho do bundle e acelera o deploy
- Pastas `uploads/` e `converted/` são ignoradas (serão criadas em /tmp na Vercel)

### 3. **server.js** - Já Preparado
- Detecta automaticamente quando está rodando na Vercel
- Usa `/tmp` para arquivos temporários (único diretório gravável na Vercel)
- Configurado para export como módulo (`module.exports = app`)

## 🔧 Como Fazer o Deploy

### Opção 1: Via CLI da Vercel

1. **Instalar Vercel CLI** (se ainda não tiver):
```bash
npm install -g vercel
```

2. **Fazer Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Deploy em Produção**:
```bash
vercel --prod
```

### Opção 2: Via GitHub + Vercel Dashboard

1. **Subir código para GitHub**:
```bash
git init
git add .
git commit -m "Sistema de conversão - Deploy Vercel"
git branch -M main
git remote add origin <SEU_REPOSITORIO_GITHUB>
git push -u origin main
```

2. **No Dashboard da Vercel**:
   - Acesse https://vercel.com/dashboard
   - Clique em "Add New Project"
   - Importe seu repositório do GitHub
   - A Vercel detectará automaticamente o `vercel.json`
   - Clique em "Deploy"

## ⚙️ Variáveis de Ambiente (Opcional)

Se precisar adicionar variáveis de ambiente:

1. No dashboard da Vercel, vá em Settings > Environment Variables
2. Adicione as variáveis necessárias
3. Faça redeploy do projeto

## ⚠️ Limitações na Vercel

A versão gratuita da Vercel tem algumas limitações:

- **Timeout**: 10 segundos para Hobby plan, 60s para Pro
- **Tamanho de arquivo**: Uploads limitados a 5MB (Hobby) ou 50MB (Pro)
- **Armazenamento**: Arquivos em `/tmp` são temporários e apagados após cada execução
- **Memória**: 1024MB para serverless functions

## 🎯 Verificar Após Deploy

Após o deploy, verifique:

1. ✅ Página inicial carrega corretamente
2. ✅ CSS e estilos estão aplicados
3. ✅ Logo e imagens aparecem
4. ✅ JavaScript funciona (interações da página)
5. ✅ Conversões de imagem funcionam
6. ✅ Download de arquivos convertidos funciona

## 🐛 Troubleshooting

### Se os estilos ainda não carregarem:

1. Verifique o console do navegador (F12) para erros
2. Confirme que as rotas em `vercel.json` estão corretas
3. Limpe o cache do navegador (Ctrl + Shift + R)
4. Faça um novo deploy: `vercel --prod --force`

### Se conversões falharem:

1. Verifique os logs na Vercel: `vercel logs <URL_DO_PROJETO>`
2. Confirme que as dependências estão instaladas (package.json)
3. Teste se o problema é timeout (arquivos muito grandes)

## 📊 Monitoramento

Para ver logs em tempo real:
```bash
vercel logs <URL_DO_PROJETO> --follow
```

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)

---

✨ **Pronto!** Seu sistema está configurado e otimizado para deploy na Vercel.

