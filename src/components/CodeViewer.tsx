export interface CodeViewerProps {
  code: string;
}

const REG_KEYWORDS = /SELECT|FROM|NATURAL|JOIN|⋈|ON|AS|WHERE|AND|OR|IS|NOT|NULL/g;
const REG_ATTRIBUTE = /(?<=\.)[\wäüöß]+/gi;
const REG_UNDERLINE = /____(.*?)____/g;
const REG_BOLD = /\*\*\*\*(.*?)\*\*\*\*/g;

// Macht den anzuzeigenden Query farbig
function codeStyler(doc: string): string {
  // Keywords rot färben
  doc = doc.replaceAll(REG_KEYWORDS, (substr) => `<span class="keyword">${substr}</span>`);
  doc = doc.replaceAll(REG_ATTRIBUTE, (substr) => `<span class="relationAttribute">${substr}</span>`);
  doc = doc.replaceAll(REG_UNDERLINE, (substr) => {
    REG_UNDERLINE.lastIndex = 0;
    const toUnderline = REG_UNDERLINE.exec(substr)![1];
    return `<span class="underline">${toUnderline}</span>`;
  });
  doc = doc.replaceAll(REG_BOLD, (substr) => {
    REG_BOLD.lastIndex = 0;
    const toBold = REG_BOLD.exec(substr)![1];
    return `<span class="bold">${toBold}</span>`;
  });

  let lineNo = 1;
  doc = `<tr><td class="lineNumber">${lineNo++}</td><td class="codeLine">` + doc.replaceAll('\n', () => `</td></tr><tr><td class="lineNumber">${lineNo++}</td><td class="codeLine">`);
  doc += '</td></tr>';
  // doc += '<br><br><br><br><br><br><br><br><br><br>';
  doc = doc.replaceAll(/ (?= )/g, '&nbsp;');
  return doc;
}

function CodeViewer(props: CodeViewerProps): JSX.Element {
  const htmledCode = codeStyler(props.code);

  return (
    <div className="codeViewer">
      <table>
        <tbody dangerouslySetInnerHTML={{ __html: htmledCode }}></tbody>
      </table>
    </div>
  );
}

export default CodeViewer;
