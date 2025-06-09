# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript and copies icons
- **Development**: `npm run dev` - Watch mode compilation with TypeScript 
- **Lint**: `npm run lint` - ESLint check
- **Lint Fix**: `npm run lintfix` - Auto-fix linting issues
- **Format**: `npm run format` - Prettier formatting
- **Setup Browsers**: `npm run rebuild` - Downloads Playwright browser binaries
- **Test Setup**: `npm run test:setup` - Run test setup script

## Architecture Overview

This is an n8n community node package that provides browser automation capabilities through Playwright. The core architecture:

### Main Components

- **Playwright.node.ts**: Main n8n node implementation with operation definitions and browser lifecycle management
- **operations.ts**: Handler functions for each supported operation (navigate, screenshot, text extraction, form filling, custom scripts)
- **utils.ts**: Browser executable path resolution utilities
- **config.ts**: Browser type definitions and configuration
- **types.ts**: TypeScript interfaces for browser options

### Key Features

- **Multiple Browser Support**: Chromium, Firefox, WebKit with auto-detection of executable paths
- **Custom Script Execution**: Allows users to paste and execute custom Playwright JavaScript with access to the `page` object
- **Browser Binary Management**: Automatic download and setup of browser binaries during installation
- **n8n Integration**: Full n8n workflow integration with proper binary data handling for screenshots

### Browser Binary Management

The package automatically downloads ~1GB of browser binaries during installation. Browser executables are located relative to the package in a `browsers/` directory, with platform-specific path resolution in `utils.ts`.

### Custom Script Operation

The `runPlaywrightScript` operation uses `new Function()` to execute user-provided JavaScript code with access to the Playwright `page` object, allowing advanced automation scenarios beyond the basic operations.

### Build Process

Uses TypeScript compilation plus Gulp for copying static assets (icons, browser binaries) to the `dist/` directory for distribution.