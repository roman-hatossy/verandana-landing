const fs = require('fs');

function patch(file, pattern, replacer, note) {
  if (!fs.existsSync(file)) return;
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  src = src.replace(pattern, replacer);
  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log(`✅ ${note} -> ${file}`);
  } else {
    console.log(`ℹ️  (no change) ${note} -> ${file}`);
  }
}

/**
 * 1) components/InquiryForm.tsx
 *    Naprawa: { ... : \`Wypełnij formularz (\${formProgress}%)\` }  ->  { ... : `Wypełnij formularz (${formProgress}%)` }
 *    (usuwamy backslashy przed ` i ${...})
 */
patch(
  'components/InquiryForm.tsx',
  /\{(\s*formProgress\s*>=\s*50\s*\?\s*'Wyślij zapytanie'\s*:\s*)\\`Wypełnij formularz\s*\(\\\$\{formProgress\}%\)\\`\s*\}/g,
  '{$1`Wypełnij formularz (${formProgress}%)`}',
  'InquiryForm: unescape backticks in submit label'
);

/**
 * 2) components/Calendar.tsx
 *    key={day} -> key={`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`}
 */
patch(
  'components/Calendar.tsx',
  /key=\{day\}/g,
  'key={`${year}-${String(month+1).padStart(2, \'0\')}-${String(day).padStart(2, \'0\')}`}',
  'Calendar: stable composite keys'
);

/**
 * 3) components/FileUpload.tsx
 *    Math.random() id -> crypto.randomUUID() z fallbackiem
 */
patch(
  'components/FileUpload.tsx',
  /id:\s*Math\.random\(\)\.toString\(36\)\.slice\(2,\s*11\)/g,
  'id: (typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto).randomUUID() : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,11)))',
  'FileUpload: cryptographically stable IDs'
);

// Bonus: gdyby ktoś dopisał inny wariant labelu z cudzysłowami i spacjami
patch(
  'components/InquiryForm.tsx',
  /\{\s*formProgress\s*>=\s*50\s*\?\s*['"]Wyślij zapytanie['"]\s*:\s*\\`Wypełnij formularz\s*\(\\\$\{formProgress\}%\)\\`\s*\}/g,
  '{formProgress >= 50 ? \'Wyślij zapytanie\' : `Wypełnij formularz (${formProgress}%)`}',
  'InquiryForm: alt pattern for label'
);

console.log('--- DONE PATCHING ---');
