import fitz  # PyMuPDF
import os
import io

from PIL import Image


def extract_embedded_images(
    pdf_path: str,
    output_prefix: str,
    output_dir: str = "data/images/city_maps",
    min_width: int = 200,
    min_height: int = 200,
):
    """
    Extracts only the embedded raster images from a PDF (e.g. maps
    pasted in as screenshots), skipping page text/captions entirely.
    Filters out tiny images (logos, bullet icons, etc.) using
    min_width/min_height.

    Any image in an unusual format (e.g. JPX/JPEG2000) or color mode
    (e.g. CMYK) is converted to standard RGB PNG so it can be
    displayed in the browser / Streamlit.
    """

    os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    saved_count = 0

    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)

        for img_index, img in enumerate(image_list):

            xref = img[0]
            base_image = doc.extract_image(xref)

            width = base_image["width"]
            height = base_image["height"]

            # skip tiny images (icons, logos, decorative elements)
            if width < min_width or height < min_height:
                continue

            image_bytes = base_image["image"]
            ext = base_image["ext"]  # e.g. "png", "jpeg", "jpx"

            # -------------------------------------------------
            # Standard formats — save as-is
            # -------------------------------------------------

            if ext in ("png", "jpg", "jpeg"):

                output_path = os.path.join(
                    output_dir,
                    f"{output_prefix}-p{page_num + 1}-img{img_index + 1}.{ext}",
                )

                with open(output_path, "wb") as f:
                    f.write(image_bytes)

                print(f"Saved: {output_path} ({width}x{height})")
                saved_count += 1

                continue

            # -------------------------------------------------
            # Unusual formats (e.g. jpx / JPEG2000) or color modes
            # (e.g. CMYK) — convert to standard RGB PNG
            # -------------------------------------------------

            try:
                pil_img = Image.open(io.BytesIO(image_bytes))

                if pil_img.mode != "RGB":
                    pil_img = pil_img.convert("RGB")

                output_path = os.path.join(
                    output_dir,
                    f"{output_prefix}-p{page_num + 1}-img{img_index + 1}.png",
                )

                pil_img.save(output_path, "PNG")

                print(
                    f"Saved (converted from {ext}): {output_path} "
                    f"({width}x{height})"
                )
                saved_count += 1

            except Exception as e:
                print(
                    f"Could not convert {ext} image on page "
                    f"{page_num + 1}: {e}"
                )

    doc.close()
    print(f"Total embedded images extracted from {pdf_path}: {saved_count}")


if __name__ == "__main__":

    extract_embedded_images(
        pdf_path="data/pdf/2_city_overview_maps.pdf",
        output_prefix="overview",
    )

    extract_embedded_images(
        pdf_path="data/pdf/3_site_accessibility_maps.pdf",
        output_prefix="access",
    )

    print("Done.")