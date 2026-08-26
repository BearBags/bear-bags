#!/usr/bin/env python3
"""Build Word (.docx) versions of the Bear Bags legal policies from content.json.

A .docx is just a zip of XML parts, so this needs nothing beyond the standard
library. Open the output in Word or Google Docs and "Save as PDF" to get PDFs.

Usage:  python3 docs/legal/build-docs.py
"""

import json
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

HERE = Path(__file__).parent
FOREST = "1A3A2A"
MUTED = "5A6B5A"

CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

ROOT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

# Word needs a numbering part for real bullet glyphs; a literal "•" in the run
# keeps this dependency-free and renders identically everywhere.
STYLES = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
<w:sz w:val="22"/><w:szCs w:val="22"/>
</w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
<w:name w:val="Normal"/>
<w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
</w:style>
</w:styles>"""


def run(text, *, bold=False, size=22, color=None, italic=False):
    props = ""
    if bold:
        props += "<w:b/>"
    if italic:
        props += "<w:i/>"
    if color:
        props += f'<w:color w:val="{color}"/>'
    props += f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>'
    return (
        f"<w:r><w:rPr>{props}</w:rPr>"
        f'<w:t xml:space="preserve">{escape(text)}</w:t></w:r>'
    )


def para(runs, *, after=160, before=0, indent=0, align=None, rule=False):
    props = "<w:pPr>"
    if align:
        props += f'<w:jc w:val="{align}"/>'
    if indent:
        props += f'<w:ind w:left="{indent}" w:hanging="220"/>'
    if rule:
        props += (
            '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" '
            f'w:color="C9D8C9"/></w:pBdr>'
        )
    props += f'<w:spacing w:before="{before}" w:after="{after}" w:line="276" w:lineRule="auto"/>'
    props += "</w:pPr>"
    return f"<w:p>{props}{''.join(runs)}</w:p>"


def build_body(doc, meta):
    parts = []

    # Title block
    parts.append(para([run(meta["company"].upper(), bold=True, size=18, color=MUTED)], after=40))
    parts.append(para([run(doc["title"], bold=True, size=44, color=FOREST)], after=80))
    parts.append(para([run(doc["intro"], size=21, color=MUTED, italic=True)], after=60))
    parts.append(
        para(
            [run(f"Last updated: {meta['lastUpdated']}", size=18, color=MUTED)],
            after=240,
            rule=True,
        )
    )

    for i, section in enumerate(doc["sections"], start=1):
        parts.append(
            para(
                [run(f"{i}. {section['heading']}", bold=True, size=26, color=FOREST)],
                before=200,
                after=100,
            )
        )
        for text in section.get("paragraphs", []):
            parts.append(para([run(text)]))
        for bullet in section.get("bullets", []):
            parts.append(
                para(
                    [run("•   ", bold=True, color=FOREST), run(bullet)],
                    indent=360,
                    after=80,
                )
            )
        for text in section.get("closing", []):
            parts.append(para([run(text)], before=80))

    # Contact footer
    parts.append(
        para(
            [run("Questions?", bold=True, size=24, color=FOREST)],
            before=320,
            after=80,
            rule=True,
        )
    )
    parts.append(
        para(
            [
                run(
                    f"Write to {meta['email']} or call {meta['phone']}. "
                    f"We usually reply within 2 working days.",
                    color=MUTED,
                )
            ]
        )
    )

    return "".join(parts)


def build_docx(doc, meta, out_path):
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body>{build_body(doc, meta)}"
        '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>'
        "</w:sectPr></w:body></w:document>"
    )

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", ROOT_RELS)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS)
        z.writestr("word/styles.xml", STYLES)
        z.writestr("word/document.xml", document)


def main():
    data = json.loads((HERE / "content.json").read_text(encoding="utf-8"))
    meta = data["meta"]

    for doc in data["documents"]:
        out_path = HERE / f"{doc['file']}.docx"
        build_docx(doc, meta, out_path)
        print(f"wrote {out_path.relative_to(HERE.parent.parent)}")

    print("\nPlaceholders to fill in before sending these out:")
    for item in meta["placeholders"]:
        print(f"  - {item}")


if __name__ == "__main__":
    main()
