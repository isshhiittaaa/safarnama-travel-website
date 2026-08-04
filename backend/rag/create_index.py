from backend.rag.loader import CSVLoader
from backend.rag.document_builder import DocumentBuilder
from backend.embeddings.embedding_model import EmbeddingModel
from backend.rag.vector_store import VectorStore


def main():

    try:
        print("Loading datasets...")

        loader = CSVLoader()
        city_data = loader.load_all()

        print("Building documents...")

        builder = DocumentBuilder()
        documents = builder.build_documents(city_data)

        print(f"Documents: {len(documents)}")

        print("Loading embedding model...")

        embedding = EmbeddingModel.get_embedding()

        print("Creating ChromaDB...")

        vector_store = VectorStore(embedding)

        db = vector_store.create(documents)

        print(f"Successfully indexed {len(documents)} documents.")

    except Exception as e:
        print(f"Error while creating index: {e}")


if __name__ == "__main__":
    main()