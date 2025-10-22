# 🎨 Sistema de Conversão Visual Tech v4.0

![Visual Tech](assets/images/logo.png)

Sistema de conversão de arquivos **100% nativo** - sem necessidade de programas externos!

## 🌐 Demo Online

**[https://conversorvisual.vercel.app](https://conversorvisual.vercel.app)**

---

## ✨ Funcionalidades

### 📷 **Conversão de Imagens**
Converta entre diversos formatos de imagem usando a poderosa biblioteca Sharp:

**Formatos Suportados:**
- JPG/JPEG
- PNG
- WEBP
- BMP
- GIF
- TIFF
- AVIF
- HEIF

**Recursos:**
- Conversão em alta qualidade
- Ajuste de qualidade personalizável
- Preview em tempo real
- Download automático

---

### 📄 **Conversão de Documentos**
Sistema 100% nativo usando funcionalidades do navegador:

**Conversões Disponíveis:**
- **TXT → HTML**: Conversão direta no servidor
- **HTML → TXT**: Conversão direta no servidor
- **TXT/HTML → PDF**: Usando `window.print()` do navegador

**Sem dependências externas!** Não precisa instalar LibreOffice, Pandoc ou qualquer outro software.

---

### 📦 **Compactação e Descompactação**
Gerenciamento completo de arquivos compactados:

**Formatos Suportados:**
- **ZIP**: Criar e extrair
- **TAR**: Criar e extrair
- **TAR.GZ**: Criar e extrair

**Recursos:**
- Compactação de múltiplos arquivos
- Extração com download automático em ZIP
- Preservação de estrutura de pastas
- Compressão otimizada

---

## 🚀 Instalação Local

### **Pré-requisitos**
- Node.js >= 18.0.0
- npm ou yarn

### **Passo a Passo**

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/conversor-visual.git
cd conversor-visual

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start

# 4. Abra no navegador
http://localhost:3000
```

---

## 🌍 Deploy no Vercel

### **Método Rápido**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### **Método Manual**

1. Faça fork deste repositório
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe seu repositório
5. Deploy automático!

**Leia o guia completo:** [DEPLOY_VERCEL.txt](DEPLOY_VERCEL.txt)

---

## 📁 Estrutura do Projeto

```
conversor-visual/
│
├── assets/
│   ├── css/
│   │   └── style.css          # Estilos (tema amarelo/preto)
│   ├── images/
│   │   └── logo.png           # Logo Visual Tech
│   └── js/
│       └── script.js          # Frontend JavaScript
│
├── uploads/                    # Arquivos enviados (temporário)
├── converted/                  # Arquivos convertidos (temporário)
│
├── server.js                   # Backend Node.js/Express
├── index.html                  # Interface principal
├── package.json                # Dependências
│
├── vercel.json                 # Configuração Vercel
├── .vercelignore              # Arquivos ignorados no deploy
├── .gitignore                 # Arquivos ignorados no Git
│
└── README.md                   # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sharp** - Conversão de imagens
- **Archiver** - Criação de arquivos ZIP/TAR
- **Unzipper** - Extração de ZIP
- **Tar** - Manipulação de arquivos TAR
- **Multer** - Upload de arquivos

### **Frontend**
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Ícones
- **Vanilla JavaScript** - Sem frameworks adicionais

---

## 🎨 Tema Visual

**Cores da Logo Visual Tech:**
- **Amarelo Dourado** (#FFD700)
- **Laranja** (#FFA500)
- **Preto** (#1a1a1a)

**Design:**
- Degradê de fundo amarelo → laranja → preto
- Botões e tabs com gradiente dourado
- Textos brancos com sombras para legibilidade
- Interface responsiva (mobile-first)

---

## 📋 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Mesmo que npm start
npm run dev
```

---

## ⚙️ Configuração

### **Variáveis de Ambiente**

O sistema detecta automaticamente se está rodando no Vercel e ajusta os diretórios:

- **Local**: `uploads/` e `converted/`
- **Vercel**: `/tmp/uploads` e `/tmp/converted`

### **Limpeza Automática**

Arquivos mais antigos que 1 hora são automaticamente removidos a cada 30 minutos.

---

## 🔒 Limitações

### **Vercel (Plano Gratuito)**
- Tamanho máximo de arquivo: **50 MB**
- Tempo máximo de execução: **10 segundos**
- Armazenamento efêmero (`/tmp`)

### **Recomendações**
- Para arquivos grandes, considere rodar localmente
- Para produção intensiva, use um VPS ou servidor dedicado

---

## 📄 Licença

ISC © 2025 Visual Tech

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

---

## 📞 Suporte

- **Documentação Completa**: [DEPLOY_VERCEL.txt](DEPLOY_VERCEL.txt)
- **Issues**: [GitHub Issues](https://github.com/SEU_USUARIO/conversor-visual/issues)

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ pela equipe **Visual Tech**

---

**🌟 Se este projeto foi útil, deixe uma estrela no GitHub!**
