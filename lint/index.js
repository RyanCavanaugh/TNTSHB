// @ts-check

var promisify = require("util").promisify;
var markdownlint = require("markdownlint");
var glob = promisify(require("glob"));
var path = require("path");
var fs = require("fs");

const readFile = promisify(fs.readFile);

var markdownConfig = /** @type {import("markdownlint").MarkdownlintConfig} */ (require("./.markdownlint.json"));

main().catch(e => console.error("" + e));

async function main() {
    const cwd = __dirname;
    var inputFiles = await glob(path.join(cwd, "../chapters/**/*.md"), {
        cwd,
    });
    var options = {
        files: inputFiles,
        config: {
            "default": false,
            "heading-style": {
                "style": "atx"
            },
            "ul-style": {
                "style": "asterisk"
            },
            "list-indent": true,
            "ul-start-left": true,
            //"ul-indent": {
            //    "indent": 4
            //},
            "no-trailing-spaces": true,
            "no-hard-tabs": true,
            "no-reversed-links": true,
            //"no-multiple-blanks": true,
            "no-missing-space-atx": true,
            "no-multiple-space-atx": true,
            "blanks-around-headings": true,
            "heading-start-left": true,
            "no-trailing-punctuation": {
                "punctuation": ".,;:!"
            },
            "no-multiple-space-blockquote": true,
            "no-blanks-blockquote": true,
            "ol-prefix": {
                "style": "ordered"
            },
            "list-marker-space": true,
            "blanks-around-fences": true,
            "blanks-around-lists": true,
            "no-bare-urls": true,
            "hr-style": {
                "style": "---"
            },
            "no-space-in-emphasis": true,
            "no-space-in-links": true,
            "fenced-code-language": true
        }
        ,
    };

    var result = await promisify(markdownlint)(options);
    //console.log(result.toString(true).split("\n").filter(x => x.includes("code-language")));
    console.log(result.toString())
    var exitCode = 0;
    for (const fileErrors of Object.values(result)) {
        exitCode += fileErrors.length;
    }
    inputFiles.map(async fileName => {
        const contents = await readFile(fileName, { encoding: "utf8"});
        checkForImproperlyIndentedFencedCodeBlocks(fileName, contents);
    });
    process.exit(exitCode);
}

/**
 * @param {string} fileName
 * @param {string} text
 */
function checkForImproperlyIndentedFencedCodeBlocks(fileName, text) {
    var lines = text.split(/\r?\n/g);
    var numErrors = 0;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var codeBlockMatch = line.match(/^(\s*)```\S+/);

        if (codeBlockMatch) {
            var startingColumn = codeBlockMatch[1].length;
            if (startingColumn === 0 || startingColumn === getCorrectStartingColumnForLine(lines, i)) {
                continue;
            }

            numErrors++;
            console.log(fileName + ": " +
                        i + 1 + ": A fenced code block following a list item must be indented to the first non-whitespace character of the list item.")
        }
    }

    return numErrors;
}

/**
 * @param {string[]} lines
 * @param {number} lineIndex
 */
function getCorrectStartingColumnForLine(lines, lineIndex) {
    for (var i = lineIndex - 1; i >= 0; i--) {
        var line = lines[i];

        if (line.length === 0) {
            continue;
        }

        var m;
        if (m = line.match(/^\s*([\*\-]|(\d+\.))\s*/)) {
            return m[0].length;
        }
        if (m = line.match(/^(\s*)/)) {
            return m[0].length;
        }
    }

    return 0;
}
