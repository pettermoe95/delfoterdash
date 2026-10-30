import fs from 'fs';
import { modes, primitives } from '../tokens';
import { getWriteableCSSTokens } from './getWriteableCSSTokens';

function writeCSSVariables() {
    const primitiveVariables = getWriteableCSSTokens(primitives);
    const lightMode = getWriteableCSSTokens(modes.light);
    const darkMode = getWriteableCSSTokens(modes.dark);

    const fileContent = `
  :root {
  ${primitiveVariables}
  ${lightMode};
  }
  [data-theme="dark"] {
  ${darkMode};
  }
  `;

    const aliasContent = `
  :root {
  ${lightMode}
  }
  [data-theme="dark"] {
  ${darkMode}
  }
  `;

    fs.writeFile('src/styling/tokens.css', fileContent, (err) => {
        err && console.log('Error: ', err);
    });
    fs.writeFile('src/styling/alias.css', aliasContent, (err) => {
        err && console.log('Error: ', err);
    });
}

writeCSSVariables();
