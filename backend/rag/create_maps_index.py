import glob

from backend.rag.pdf_ingest import digitize_pdf
from backend.rag.document_builder import DocumentBuilder
from backend.embeddings.embedding_model import EmbeddingModel
from backend.rag.vector_store import VectorStore


def index_map_pdf(pdf_path: str, source_name: str, image_prefix: str, builder, vector_store):

    print(f"Digitizing {pdf_path} via Sarvam...")

    html_text = digitize_pdf(pdf_path, output_format="html")

    image_paths = sorted(
        glob.glob(f"data/images/city_maps/{image_prefix}-*.png") +
        glob.glob(f"data/images/city_maps/{image_prefix}-*.jpeg") +
        glob.glob(f"data/images/city_maps/{image_prefix}-*.jpg")
    )

    print(f"Found {len(image_paths)} extracted images for {image_prefix}")

    documents = builder.build_pdf_documents(
        html_text=html_text,
        city="varanasi",
        source_name=source_name,
        image_paths=image_paths,
    )

    print(f"Documents built: {len(documents)}")

    for doc in documents:
        print("-" * 60)
        print(doc.metadata)
        print(doc.page_content[:150])

    ids = [doc.metadata["document_id"] for doc in documents]

    vector_store.add_documents(documents, ids=ids)

    print(f"Added {len(documents)} documents from {source_name}")


def main():

    try:
        builder = DocumentBuilder()

        embedding = EmbeddingModel.get_embedding()
        vector_store = VectorStore(embedding)

        index_map_pdf(
            pdf_path="data/pdf/2_city_overview_maps.pdf",
            source_name="city_overview_maps",
            image_prefix="overview",
            builder=builder,
            vector_store=vector_store,
        )

        index_map_pdf(
            pdf_path="data/pdf/3_site_accessibility_maps.pdf",
            source_name="site_accessibility_maps",
            image_prefix="access",
            builder=builder,
            vector_store=vector_store,
        )

        print("Total documents in collection now:", vector_store.count())

    except Exception as e:
        print(f"Error while indexing maps: {e}")


if __name__ == "__main__":
    main()