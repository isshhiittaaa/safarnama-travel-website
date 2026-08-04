"""
backend/rag/pdf_ingest.py

Handles ingestion of PDF documents (tourism stats, city maps) using
Sarvam AI's Document Digitization API. Extracted text/tables are
returned as plain strings for downstream chunking in document_builder.py.
"""

import os
import zipfile

from sarvamai import SarvamAI

from config.settings import SARVAM_API_KEY


client = SarvamAI(api_subscription_key=SARVAM_API_KEY)


def digitize_pdf(pdf_path: str, output_format: str = "html") -> str:
    """
    Sends a PDF (max 10 pages) to Sarvam Document Digitization
    and returns the combined extracted text/table content as a
    single string.

    Args:
        pdf_path: path to the PDF file (max 10 pages).
        output_format: "html" (preserves table structure, default)
                        or "md" (plain markdown).

    Returns:
        Combined extracted content from all pages, as a string.
    """

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    # -------------------------------------------------
    # Create and run the digitization job
    # -------------------------------------------------

    job = client.document_intelligence.create_job(
        language="en-IN",
        output_format=output_format,
    )

    job.upload_file(pdf_path)
    job.start()

    print(f"[pdf_ingest] Processing {pdf_path} ...")

    status = job.wait_until_complete(timeout=600)

    if status.job_state not in ("Completed", "PartiallyCompleted"):
        raise RuntimeError(
            f"Sarvam job did not complete successfully. "
            f"State: {status.job_state}"
        )

    if status.job_state == "PartiallyCompleted":
        print(
            f"[pdf_ingest] WARNING: some pages failed for {pdf_path}. "
            f"Continuing with the pages that succeeded."
        )

    # -------------------------------------------------
    # Download and extract the output ZIP
    # -------------------------------------------------

    zip_path = pdf_path.replace(".pdf", "_output.zip")
    job.download_output(zip_path)

    extract_dir = pdf_path.replace(".pdf", "_extracted")
    os.makedirs(extract_dir, exist_ok=True)

    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_dir)

    # -------------------------------------------------
    # Combine all page-level output files in order
    # -------------------------------------------------

    extension = ".html" if output_format == "html" else ".md"

    page_files = sorted(
        f for f in os.listdir(extract_dir)
        if f.endswith(extension)
    )

    if not page_files:
        raise RuntimeError(
            f"No {extension} files found in {extract_dir}. "
            f"Check output_format matches what was requested."
        )

    combined = ""
    for fname in page_files:
        file_path = os.path.join(extract_dir, fname)
        with open(file_path, encoding="utf-8") as f:
            combined += f.read() + "\n\n"

    print(f"[pdf_ingest] Done: {pdf_path} -> {len(page_files)} page(s) extracted")

    return combined


# ==========================================================
# Standalone test
# ==========================================================

if __name__ == "__main__":

    test_pdf = "data/pdf/1_tourism_statistics.pdf"

    text = digitize_pdf(test_pdf, output_format="html")

    print("\n" + "=" * 80)
    print("EXTRACTED CONTENT (first 2000 chars)")
    print("=" * 80)
    print(text[:2000])