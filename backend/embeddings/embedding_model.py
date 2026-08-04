from langchain_huggingface import HuggingFaceEmbeddings

from config.settings import (
    EMBEDDING_MODEL,
    EMBEDDING_DEVICE,
)


class EmbeddingModel:
    """
    Singleton wrapper around the embedding model.

    Responsibilities
    ----------------
    • Load embedding model only once
    • Reuse across the application
    • Produce normalized embeddings
    """

    _embedding = None

    @classmethod
    def get_embedding(cls):

        if cls._embedding is None:

            cls._embedding = HuggingFaceEmbeddings(

                model_name=EMBEDDING_MODEL,

                model_kwargs={
                    "device": EMBEDDING_DEVICE,
                },

                encode_kwargs={
                    "normalize_embeddings": True,
                    "batch_size": 64,
                },

                show_progress=True,
            )

        return cls._embedding

    @classmethod
    def reset(cls):
        """
        Reset the singleton.

        Useful when switching embedding models.
        """

        cls._embedding = None