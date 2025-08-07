# SystemOS Repository Server

Um servidor de repositório de pacotes para SystemOS que serve arquivos `.syos` e `.syfo` de forma estática.

## Estrutura

```
repository-server/
├── server.js              # Servidor principal
├── repository/
│   ├── packages.json      # Lista de todos os pacotes
│   └── packages/
│       └── [package-name]/
│           ├── [package-name]-[version].syos  # Arquivo do pacote
│           └── [package-name]-[version].syfo  # Informações do pacote
└── package.json
```

## Instalação

```bash
cd repository-server
npm install
```

## Inicialização

```bash
# Inicializar repositório (copia pacotes existentes)
npm run init

# Iniciar servidor
npm start

# Desenvolvimento (com nodemon)
npm run dev
```

## Endpoints

- `GET /` - Informações do repositório
- `GET /packages.json` - Lista de todos os pacotes disponíveis
- `GET /packages/:packageName/:filename` - Download de arquivos (.syos ou .syfo)
- `GET /health` - Status do servidor

## Formato dos Arquivos

### packages.json
```json
{
  "repository": {
    "name": "SystemOS Official Repository",
    "version": "1.0.0",
    "url": "http://localhost:3000",
    "description": "Official SystemOS package repository"
  },
  "packages": [
    {
      "name": "sysfetch",
      "version": "1.0.0",
      "description": "System information display tool",
      "author": "SystemOS Development Team",
      "category": "utilities",
      "size": 5120,
      "hash": "sha256hash...",
      "downloadUrl": "/packages/sysfetch/sysfetch-1.0.0.syos",
      "infoUrl": "/packages/sysfetch/sysfetch-1.0.0.syfo"
    }
  ],
  "lastUpdated": "2025-01-07T00:00:00.000Z"
}
```

### .syfo (SystemOS Package Info)
```json
{
  "name": "sysfetch",
  "version": "1.0.0",
  "description": "System information display tool",
  "author": "SystemOS Development Team",
  "keywords": ["system", "info", "neofetch"],
  "category": "utilities",
  "size": 5120,
  "hash": "sha256hash...",
  "dependencies": {},
  "permissions": ["system.info"],
  "homepage": "",
  "repository": "",
  "license": "MIT",
  "createdAt": "2025-01-07T00:00:00.000Z",
  "updatedAt": "2025-01-07T00:00:00.000Z",
  "downloadUrl": "/packages/sysfetch/sysfetch-1.0.0.syos",
  "infoUrl": "/packages/sysfetch/sysfetch-1.0.0.syfo"
}
```

## Uso no SystemOS

O SystemOS Package Manager pode usar este repositório através da configuração em `system/repositories.json`:

```json
{
  "repositories": [
    {
      "name": "official",
      "url": "http://localhost:3000",
      "description": "SystemOS Official Repository",
      "enabled": true,
      "priority": 1,
      "type": "official"
    }
  ]
}
```

## Comandos do Package Manager

```bash
# Buscar pacotes
sys search sysfetch

# Listar pacotes disponíveis
sys list

# Instalar do repositório
sys install sysfetch

# Informações do pacote
sys info sysfetch
```
