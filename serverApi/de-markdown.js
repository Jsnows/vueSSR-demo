const Remarkable = require('remarkable')
const high = require('highlight.js')
var demark = new Remarkable('full', {
    html:         true,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       true,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      true,         // autoconvert URL-like texts to links
    linkTarget:   '',           // set target to open link in
    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes orn. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    highlight: function (str, lang) {
      return high.highlightAuto(str).value;
    }
});
function a(str){
    return demark.render(str)
}
module.exports = a;