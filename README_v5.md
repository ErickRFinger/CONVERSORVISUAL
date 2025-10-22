# ✨ Sistema de Conversão v5.0 - Visual Tech

<div align="center">

![Status](https://img.shields.io/badge/Status-Completo-success)
![Version](https://img.shields.io/badge/Version-5.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple)
![License](https://img.shields.io/badge/License-ISC-green)

**Sistema completo de conversão de arquivos com recursos avançados**

[🚀 Demo](#) | [📖 Documentação](MELHORIAS_IMPLEMENTADAS.md) | [🔧 Deploy](DEPLOY_VERCEL_ATUALIZADO.md) | [📝 Changelog](CHANGELOG.md)

</div>

---

## 🎯 O Que É?

Sistema web profissional para conversão de:
- 🖼️ **Imagens** (JPG, PNG, WEBP, BMP, GIF, TIFF, AVIF, HEIF)
- 📄 **Documentos** (TXT, HTML, PDF)
- 📦 **Arquivos** (ZIP, TAR, TAR.GZ)

Com recursos avançados de edição, histórico, PWA e muito mais!

---

## ✨ Destaques da v5.0

### 🎨 Interface Moderna
```
✅ Dark Mode completo com toggle
✅ Animações suaves e profissionais
✅ Responsivo mobile-first
✅ Notificações toast elegantes
✅ Design limpo e intuitivo
```

### 🛠️ Funcionalidades Avançadas
```
✅ Conversão em LOTE (múltiplas imagens)
✅ Edição de imagens (rotação, flip, zoom)
✅ Slider de qualidade (1-100%)
✅ Histórico de conversões (LocalStorage)
✅ Comparação antes/depois
✅ Metadados EXIF
✅ Preview de documentos
```

### 🔒 Segurança Robusta
```
✅ Rate limiting (20 req/min)
✅ Validação MIME type real
✅ Limite de tamanho (10MB)
✅ Sanitização de inputs
✅ Error handling completo
```

### 📱 PWA Completo
```
✅ Instalável (desktop/mobile)
✅ Funciona offline
✅ Service Worker com cache
✅ Atualização automática
✅ Prompt de instalação
```

---

## 🚀 Início Rápido

### Instalação Local

```bash
# Clonar repositório
git clone [url-do-repo]
cd SISTEMA\ DE\ CONVERSÃO

# Instalar dependências
npm install

# Iniciar servidor
npm start

# Acessar
http://localhost:3000
```

### Deploy na Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 📊 Funcionalidades Completas

### 🖼️ Conversão de Imagens

| Funcionalidade | Descrição |
|----------------|-----------|
| **Formatos** | JPG, PNG, WEBP, BMP, GIF, TIFF, AVIF, HEIF |
| **Qualidade** | Slider de 1-100% |
| **Edição** | Rotação 90°, espelhamento H/V |
| **Zoom** | Clique para ampliar 2x |
| **Metadados** | Dimensões, tamanho, MP, ratio |
| **Comparação** | Modal antes/depois |
| **Lote** | Múltiplas imagens simultaneamente |

### 📄 Conversão de Documentos

| Funcionalidade | Descrição |
|----------------|-----------|
| **TXT → HTML** | Conversão nativa |
| **HTML → TXT** | Remove tags HTML |
| **→ PDF** | Via print do navegador |
| **Preview** | Visualização de conteúdo |

### 📦 Compactação de Arquivos

| Funcionalidade | Descrição |
|----------------|-----------|
| **Compactar** | Múltiplos arquivos → ZIP/TAR/TAR.GZ |
| **Extrair** | ZIP/TAR → Arquivos individuais |
| **Visualizar** | Lista de arquivos antes de processar |

---

## 🎨 Capturas de Tela

### Tema Claro
```
┌─────────────────────────────────────────┐
│  🌙 [Dark Mode]  📜 [Histórico]         │
│                                         │
│     Conversor de Mídia Visual Tech      │
│   Converta imagens, documentos e...    │
│                                         │
│  [Imagens] [Documentos] [Arquivos]     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  📤 Arraste e solte uma imagem    │ │
│  │         ou                        │ │
│  │    [Selecione o Arquivo]         │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Tema Escuro
```
┌─────────────────────────────────────────┐
│  ☀️ [Light Mode]  📜 [Histórico]        │
│                                         │
│     Conversor de Mídia Visual Tech      │
│   (gradiente escuro elegante)          │
│                                         │
│  [Modo escuro ativo]                   │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sharp** - Processamento de imagens
- **Multer** - Upload de arquivos
- **Archiver/Unzipper/Tar** - Compactação

### Frontend
- **HTML5/CSS3** - Estrutura e estilo
- **JavaScript ES6+** - Lógica da aplicação
- **Bootstrap 5.3.2** - Framework CSS
- **Bootstrap Icons** - Ícones

### PWA
- **Service Worker** - Cache e offline
- **Web App Manifest** - Metadados PWA
- **Cache API** - Armazenamento local

### Deploy
- **Vercel** - Hospedagem serverless

---

## 📈 Arquitetura do Sistema

```
┌─────────────────────────────────────────┐
│          Frontend (PWA)                 │
│  ┌──────────────────────────────────┐  │
│  │  HTML/CSS/JS + Service Worker    │  │
│  │  - Dark Mode                     │  │
│  │  - Histórico                     │  │
│  │  - Edição de Imagens            │  │
│  └──────────────────────────────────┘  │
└─────────────┬───────────────────────────┘
              │
              ↓ HTTP/Fetch API
              │
┌─────────────┴───────────────────────────┐
│      Backend (Express.js)               │
│  ┌──────────────────────────────────┐  │
│  │  Rate Limiting                   │  │
│  │  Validação de Arquivos           │  │
│  │  Conversão (Sharp/Native)        │  │
│  │  API Routes                      │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🔒 Segurança

### Validações Implementadas

1. **Rate Limiting**
   - 20 requisições por minuto por IP
   - Janela deslizante de 60 segundos
   - Resposta HTTP 429 ao exceder

2. **Validação de Arquivos**
   - MIME type real (não apenas extensão)
   - Lista branca de tipos permitidos
   - Limite de 10MB por arquivo

3. **Sanitização**
   - Parâmetros de entrada validados
   - Escape de HTML em previews
   - Limpeza automática de arquivos temporários

4. **Error Handling**
   - Try-catch em todas as operações
   - Mensagens de erro específicas
   - Cleanup em caso de falha

---

## 📊 Performance

### Otimizações

- ✅ Service Worker com cache inteligente
- ✅ Estratégia Network First + Cache Fallback
- ✅ Assets estáticos via CDN da Vercel
- ✅ Compressão de imagens configurável
- ✅ Limpeza automática de arquivos (1h)
- ✅ Lazy loading de componentes
- ✅ Transições CSS otimizadas

### Métricas Esperadas

- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Lighthouse Score**: 90+ (Performance, PWA, Accessibility)
- **Bundle Size**: ~50KB (JS) + ~15KB (CSS)

---

## 📱 Suporte a Dispositivos

| Dispositivo | Suporte | Funcionalidades |
|-------------|---------|-----------------|
| **Desktop** | ✅ Full | Todas |
| **Tablet** | ✅ Full | Todas |
| **Mobile** | ✅ Full | Todas + Touch Gestures |
| **Offline** | ✅ Parcial | Assets em cache |

### Navegadores Suportados

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

---

## 📝 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| [MELHORIAS_IMPLEMENTADAS.md](MELHORIAS_IMPLEMENTADAS.md) | Detalhes técnicos de todas as melhorias |
| [DEPLOY_VERCEL_ATUALIZADO.md](DEPLOY_VERCEL_ATUALIZADO.md) | Guia completo de deploy |
| [RESUMO_FINAL_MELHORIAS.md](RESUMO_FINAL_MELHORIAS.md) | Resumo executivo |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões |
| [README_v5.md](README_v5.md) | Este arquivo |

---

## 🐛 Reportar Bugs

Encontrou um bug? 

1. Verifique se já não foi reportado
2. Abra uma issue com:
   - Descrição detalhada
   - Passos para reproduzir
   - Comportamento esperado vs real
   - Screenshots (se aplicável)
   - Browser e versão

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Guidelines

- Código limpo e comentado
- Seguir padrão de código existente
- Testes (se aplicável)
- Documentação atualizada

---

## 🎯 Roadmap

### v5.1 (Próximo)
- [ ] Redimensionamento de imagens
- [ ] Crop (recorte)
- [ ] Filtros de imagem
- [ ] Suporte a RAW

### v6.0 (Futuro)
- [ ] API REST pública
- [ ] Autenticação de usuários
- [ ] Dashboard de estatísticas
- [ ] Integração com cloud storage

---

## 📄 Licença

ISC License - Visual Tech © 2025

---

## 👥 Créditos

**Desenvolvido com ❤️ por Visual Tech**

### Agradecimentos

- Bootstrap Team - Framework CSS
- Sharp - Processamento de imagens
- Vercel - Hospedagem
- Comunidade Open Source

---

## 📞 Contato

- **Website**: [em breve]
- **Email**: [em breve]
- **GitHub**: [seu-repo]

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/usuario/repo?style=social)](https://github.com/usuario/repo)

</div>

---

## 🎉 Agradecimentos Finais

Obrigado por usar o **Sistema de Conversão v5.0**!

Este projeto foi completamente renovado com **14 novas funcionalidades principais**, incluindo PWA, dark mode, conversão em lote, edição de imagens, histórico, e muito mais.

**Aproveite o sistema e boa conversão! 🚀**

---

*Última atualização: 22/10/2025 - v5.0.0*

