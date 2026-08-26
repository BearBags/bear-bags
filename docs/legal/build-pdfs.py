#!/usr/bin/env python3
"""Build PDF versions of the Bear Bags legal policies from content.json.

Writes real PDFs using only the standard library (no pandoc/LibreOffice needed),
with the base-14 Helvetica fonts every PDF reader has built in.

Usage:  python3 docs/legal/build-pdfs.py
"""

import json
import zlib
from pathlib import Path

HERE = Path(__file__).parent

# A4 in points.
PAGE_W, PAGE_H = 595.28, 841.89
MARGIN_X, MARGIN_TOP, MARGIN_BOTTOM = 62.0, 74.0, 64.0
CONTENT_W = PAGE_W - 2 * MARGIN_X

FOREST = (0.102, 0.227, 0.165)
MUTED = (0.353, 0.420, 0.353)
RULE = (0.788, 0.847, 0.788)

REG, BOLD, OBL = "F1", "F2", "F3"

# Widths per 1000 units for Helvetica / Helvetica-Bold, indexed by codepoint 32..126.
_HELV = (
    "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 556 556 556 556 556 "
    "556 556 556 556 556 278 278 584 584 584 556 1015 667 667 722 722 667 611 778 722 278 "
    "500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 "
    "556 333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 "
    "278 556 500 722 500 500 500 334 260 334 584"
)
_HELV_B = (
    "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 556 556 556 556 556 "
    "556 556 556 556 556 333 333 584 584 584 611 975 722 722 722 722 667 611 778 722 278 "
    "556 722 611 833 722 778 667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 "
    "556 333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389 556 "
    "333 611 556 778 556 556 500 389 280 389 584"
)
WIDTHS = {
    REG: [int(w) for w in _HELV.split()],
    BOLD: [int(w) for w in _HELV_B.split()],
}
WIDTHS[OBL] = WIDTHS[REG]

# Characters the base-14 WinAnsi fonts cannot show, mapped to safe equivalents.
SUBSTITUTIONS = {
    "‘": "'", "’": "'", "“": '"', "”": '"',
    "–": "-", "—": "-", "…": "...", " ": " ",
    "•": "-", "₹": "Rs.", "Ü": "U",
}


def sanitize(text):
    for bad, good in SUBSTITUTIONS.items():
        text = text.replace(bad, good)
    return "".join(ch if 32 <= ord(ch) <= 126 else "?" for ch in text)


def text_width(text, font, size):
    table = WIDTHS[font]
    total = sum(table[ord(ch) - 32] for ch in text if 32 <= ord(ch) <= 126)
    return total * size / 1000.0


def wrap(text, font, size, width):
    words, lines, line = text.split(), [], ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if line and text_width(candidate, font, size) > width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines or [""]


def esc(text):
    return text.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


class PdfBuilder:
    """Lays text out into pages, then serialises them as a PDF."""

    def __init__(self):
        self.pages = []
        self.ops = []
        self.y = PAGE_H - MARGIN_TOP

    def _new_page(self):
        if self.ops:
            self.pages.append("\n".join(self.ops))
        self.ops = []
        self.y = PAGE_H - MARGIN_TOP

    def space(self, amount):
        if self.y - amount < MARGIN_BOTTOM:
            self._new_page()
        else:
            self.y -= amount

    def rule(self, gap_before=8, gap_after=16):
        self.space(gap_before)
        if self.y - 2 < MARGIN_BOTTOM:
            self._new_page()
        r, g, b = RULE
        self.ops.append(
            f"{r:.3f} {g:.3f} {b:.3f} RG 0.8 w "
            f"{MARGIN_X} {self.y:.2f} m {PAGE_W - MARGIN_X} {self.y:.2f} l S"
        )
        self.y -= gap_after

    def text(self, body, *, font=REG, size=10.5, color=None, indent=0.0,
             leading=None, gap_after=9.0, keep_with_next=0.0):
        color = color or (0.2, 0.2, 0.2)
        leading = leading or size * 1.55
        avail = CONTENT_W - indent
        lines = wrap(sanitize(body), font, size, avail)

        needed = len(lines) * leading + keep_with_next
        if self.y - needed < MARGIN_BOTTOM and len(lines) * leading < PAGE_H * 0.6:
            self._new_page()

        r, g, b = color
        for line in lines:
            if self.y - leading < MARGIN_BOTTOM:
                self._new_page()
            self.y -= leading
            self.ops.append(
                f"BT /{font} {size} Tf {r:.3f} {g:.3f} {b:.3f} rg "
                f"{MARGIN_X + indent:.2f} {self.y:.2f} Td ({esc(line)}) Tj ET"
            )
        self.y -= gap_after

    def bullet(self, body, *, size=10.5):
        indent = 16.0
        if self.y - size * 1.55 < MARGIN_BOTTOM:
            self._new_page()
        r, g, b = FOREST
        # Draw the marker on the first line, then the wrapped text beside it.
        marker_y = self.y - size * 1.55
        self.ops.append(
            f"BT /{BOLD} {size} Tf {r:.3f} {g:.3f} {b:.3f} rg "
            f"{MARGIN_X:.2f} {marker_y:.2f} Td (-) Tj ET"
        )
        self.text(body, size=size, indent=indent, gap_after=5.0)

    def finish(self):
        if self.ops:
            self.pages.append("\n".join(self.ops))
        return self.pages


def render(doc, meta):
    pdf = PdfBuilder()

    pdf.text(meta["company"].upper(), font=BOLD, size=9, color=MUTED, gap_after=6)
    pdf.text(doc["title"], font=BOLD, size=25, color=FOREST, gap_after=10)
    pdf.text(doc["intro"], font=OBL, size=11, color=MUTED, gap_after=6)
    pdf.text(f"Last updated: {meta['lastUpdated']}", size=9, color=MUTED, gap_after=2)
    pdf.rule()

    for i, section in enumerate(doc["sections"], start=1):
        pdf.space(8)
        pdf.text(
            f"{i}. {section['heading']}",
            font=BOLD, size=13.5, color=FOREST, gap_after=7,
            keep_with_next=34,
        )
        for text in section.get("paragraphs", []):
            pdf.text(text)
        for item in section.get("bullets", []):
            pdf.bullet(item)
        if section.get("bullets"):
            pdf.space(4)
        for text in section.get("closing", []):
            pdf.text(text)

    pdf.space(10)
    pdf.rule()
    pdf.text("Questions?", font=BOLD, size=12.5, color=FOREST, gap_after=6)
    pdf.text(
        f"Write to {meta['email']} or call {meta['phone']}. "
        "We usually reply within 2 working days.",
        color=MUTED,
    )
    return pdf.finish()


def write_pdf(pages, title, out_path):
    objects = {}
    font_ids = {REG: 5, BOLD: 6, OBL: 7}
    page_ids = [8 + i * 2 for i in range(len(pages))]

    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>"
    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects[2] = (
        f"<< /Type /Pages /Count {len(pages)} /Kids [{kids}] >>"
    )
    objects[3] = (
        f"<< /Title ({esc(sanitize(title))}) /Producer (Bear Bags legal doc builder) >>"
    )
    objects[4] = (
        "<< /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >>"
    )
    for name, base in ((REG, "Helvetica"), (BOLD, "Helvetica-Bold"), (OBL, "Helvetica-Oblique")):
        objects[font_ids[name]] = (
            f"<< /Type /Font /Subtype /Type1 /BaseFont /{base} /Encoding /WinAnsiEncoding >>"
        )

    streams = {}
    for pid, content in zip(page_ids, pages):
        objects[pid] = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W:.2f} {PAGE_H:.2f}] "
            f"/Resources 4 0 R /Contents {pid + 1} 0 R >>"
        )
        streams[pid + 1] = zlib.compress(content.encode("latin-1"))

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = {}
    max_id = max(list(objects) + list(streams))

    for oid in range(1, max_id + 1):
        if oid in objects:
            offsets[oid] = len(out)
            out += f"{oid} 0 obj\n{objects[oid]}\nendobj\n".encode("latin-1")
        elif oid in streams:
            offsets[oid] = len(out)
            data = streams[oid]
            out += (
                f"{oid} 0 obj\n<< /Length {len(data)} /Filter /FlateDecode >>\nstream\n"
            ).encode("latin-1")
            out += data + b"\nendstream\nendobj\n"

    xref_pos = len(out)
    out += f"xref\n0 {max_id + 1}\n".encode("latin-1")
    out += b"0000000000 65535 f \n"
    for oid in range(1, max_id + 1):
        out += f"{offsets[oid]:010d} 00000 n \n".encode("latin-1")
    out += (
        f"trailer\n<< /Size {max_id + 1} /Root 1 0 R /Info 3 0 R >>\n"
        f"startxref\n{xref_pos}\n%%EOF\n"
    ).encode("latin-1")

    out_path.write_bytes(bytes(out))


def main():
    data = json.loads((HERE / "content.json").read_text(encoding="utf-8"))
    meta = data["meta"]

    for doc in data["documents"]:
        pages = render(doc, meta)
        out_path = HERE / f"{doc['file']}.pdf"
        write_pdf(pages, f"{meta['company']} {doc['title']}", out_path)
        print(f"wrote {out_path.relative_to(HERE.parent.parent)} ({len(pages)} pages)")

    print("\nPlaceholders to fill in before sending these out:")
    for item in meta["placeholders"]:
        print(f"  - {item}")


if __name__ == "__main__":
    main()
