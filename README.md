# Open Matching Files

[![](https://vsmarketplacebadge.apphb.com/version-short/bcanzanella.openmatchingfiles.svg)](https://marketplace.visualstudio.com/items?itemName=bcanzanella.openmatchingfiles)
[![](https://vsmarketplacebadge.apphb.com/installs-short/bcanzanella.openmatchingfiles.svg)](https://marketplace.visualstudio.com/items?itemName=bcanzanella.openmatchingfiles)
[![](https://vsmarketplacebadge.apphb.com/rating-short/bcanzanella.openmatchingfiles.svg)](https://marketplace.visualstudio.com/items?itemName=bcanzanella.openmatchingfiles)

### Extension for Visual Studio Code

Tired of wasting time opening multiple files with the same name across multiple folders??

Introducing Open Matching Files. Open editors for all files matching your search.

## Preview

![demo](assets/demo.gif)

## Usage

- Use the "Open Matching Files..." command or the `alt+f` keyboard shortcut to bring up the search box and type your search

## Features
- Works with any file type or programming language
- Search for a specific file name that can appear many times across many folders and open them all!
   - `web.config`
   - `app.config`
   - `packages.config`
   - `package.json`
   - `.gitignore`
   - `bower.json`
   - `tsconfig.json`

- Search using glob patterns and open them all! 
  - `**∕*.{ts,js}`
  - `*.{ts,js}`
  - `*.yaml`
  - `stored-procedure-*.sql`
  - `*.csproj`

## Settings

`omf.openFilesConfirmationLimit { number, default=20 }`

- Shows a confirmation before attempting to open more than 20 files. Set to 0 to disable.

```
  "omf.openFilesConfirmationLimit": 50
```

## Integrates with settings.json

Open Matching Files uses the same search api as VSCode's command palette file search. Files and folders excluded here will also be excluded from an Open Matching Files search result.

```
"files.exclude": {
    "**/node_modules": true,
    "**/bin": true,
    "**/obj": true,
    "**/SomeAnnoyingFileThatAppearsAllOver.txt": true
}
```

## Requirements

- Visual Studio Code version 1.31.0 or later

## Building

```
npm install --no-save
npm run build
```
alternatively...

```
npm install --no-save
npm run watch
```

## Testing

```
npm install --no-save
npm run test
```

## Launching

Click the `Launch Extension` task to run.

## Feedback & Contributing

Please report any bugs, suggestions or documentation requests via [Github issues](https://github.com/bcanzanella/vscode-openmatchingfiles/issues)
