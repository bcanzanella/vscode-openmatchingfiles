# Open Matching Files

[![](https://vsmarketplacebadge.apphb.com/version-short/bcanzanella.openmatchingfiles.svg)](https://marketplace.visualstudio.com/items?itemName=bcanzanella.openmatchingfiles)
[![](https://vsmarketplacebadge.apphb.com/installs-short/bcanzanella.openmatchingfiles.svg)](https://marketplace.visualstudio.com/items?itemName=bcanzanella.openmatchingfiles)
[![](https://vsmarketplacebadge.apphb.com/rating-short/bcanzanella.openmatchingfiles.svg)](https://marketplace.visualstudio.com/items?itemName=bcanzanella.openmatchingfiles)

### Extension for Visual Studio Code

Tired of wasting time opening multiple files with the same name across multiple folders??

Introducing Open Matching Files. Open editors for all files matching your search.

## Preview

![demo](assets/demo.gif)

## Features

- Use the "Open Matching Files..." command or the `alt+f` keyboard shortcut to bring up the search box
- Search for a specific file name or use glob patterns like `**∕*.{ts,js}` or `*.{ts,js}`

## Settings

`omf.openFilesConfirmationLimit { number, default=20 }`

- Shows a confirmation before attempting to open more than 20 files. Set to 0 to disable.

```
  "omf.openFilesConfirmationLimit": 50
```

`files.exclude`

```
"files.exclude": {
    "**/node_modules": true,
    "**/bin": true,
    "**/obj": true,
    "**/SomeAnnoyingFileThatAppearsAllOver.txt": true
}
```

- Open Matching Files uses the same search api as VSCode's command palette file search. Files and folders excluded here will also be excluded from an Open Matching Files search result.

## Requirements

- Visual Studio Code version 1.31.0 or later

## Building

```
npm install --no-save
npm run build
```

Click the `Launch Extension` task to run.

## Feedback & Contributing

- Please report any bugs, suggestions or documentation requests via the [Github issues](https://github.com/bcanzanella/vscode-openmatchingfiles/issues)
