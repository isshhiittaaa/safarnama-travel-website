from backend.rag.pdf_ingest import digitize_pdf
from backend.rag.document_builder import DocumentBuilder
from backend.embeddings.embedding_model import EmbeddingModel
from backend.rag.vector_store import VectorStore


def main():

    try:
        print("Digitizing tourism_stats PDF via Sarvam...")

        html_text = digitize_pdf(
            "data/pdf/1_tourism_statistics.pdf",
            output_format="html",
        )

        print("Building documents...")

        builder = DocumentBuilder()

        documents = builder.build_pdf_documents(
            html_text=html_text,
            city="varanasi",
            source_name="tourism_statistics_report",
        )

        print(f"Documents built: {len(documents)}")

        for doc in documents[:3]:
            print("-" * 60)
            print(doc.metadata)
            print(doc.page_content[:200])

        print("Loading embedding model...")

        embedding = EmbeddingModel.get_embedding()

        vector_store = VectorStore(embedding)

        print("Adding documents to existing ChromaDB collection...")

        ids = [doc.metadata["document_id"] for doc in documents]

        vector_store.add_documents(documents, ids=ids)

        print(f"Successfully added {len(documents)} documents.")
        print("Total documents in collection now:", vector_store.count())

    except Exception as e:
        print(f"Error while indexing PDF: {e}")


if __name__ == "__main__":
    main()