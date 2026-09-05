import fitz
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

pdf_path = Path("attached_assets/Tawsileh_Intercity_1788604120741.pdf")
out_dir = Path(".agents/outputs/tawsileh_pdf")
out_dir.mkdir(parents=True, exist_ok=True)

doc = fitz.open(pdf_path)
rendered = []
text_parts = []

for index, page in enumerate(doc):
    page_no = index + 1
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    page_path = out_dir / f"page-{page_no:03d}.png"
    pix.save(page_path)
    rendered.append(Image.open(page_path).convert("RGB"))
    text_parts.append(f"\n--- PAGE {page_no} ---\n{page.get_text()}")

(out_dir / "extracted_text.txt").write_text("".join(text_parts), encoding="utf-8")

thumb_width = 260
thumbs = []
for page_no, image in enumerate(rendered, start=1):
    ratio = thumb_width / image.width
    thumb = image.resize((thumb_width, int(image.height * ratio)))
    canvas = Image.new("RGB", (thumb_width, thumb.height + 28), "white")
    canvas.paste(thumb, (0, 28))
    draw = ImageDraw.Draw(canvas)
    draw.text((8, 7), f"Page {page_no}", fill="black")
    thumbs.append(canvas)

cols = 4
rows = (len(thumbs) + cols - 1) // cols
cell_w = thumb_width
cell_h = max(t.height for t in thumbs)
contact = Image.new("RGB", (cols * cell_w, rows * cell_h), "#d9d9d9")
for i, thumb in enumerate(thumbs):
    x = (i % cols) * cell_w
    y = (i // cols) * cell_h
    contact.paste(thumb, (x, y))
contact.save(out_dir / "contact-sheet.png")

print(f"pages={len(doc)}")
print(f"output={out_dir}")
print(f"text_chars={sum(len(part) for part in text_parts)}")