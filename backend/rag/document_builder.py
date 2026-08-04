from langchain_core.documents import Document
from bs4 import BeautifulSoup
import pandas as pd
from io import StringIO


class DocumentBuilder:
    """
    Converts normalized tourism datasets into LangChain Documents.

    Features
    --------
    • Merges AI metadata with attraction dataset
    • Cleans missing values
    • Produces rich page_content for semantic search
    • Produces normalized metadata for filtering
    """

    # =====================================================

    def build_documents(
        self,
        city_datasets: dict,
    ) -> list[Document]:

        documents = []

        for city, datasets in city_datasets.items():

            ai_lookup = self._build_ai_lookup(datasets)

            for category, dataframe in datasets.items():

                for index, (_, row) in enumerate(dataframe.iterrows()):

                    row = row.to_dict()

                    if category == "attractions":
                        row = self._merge_ai_metadata(
                            row,
                            ai_lookup,
                        )

                    page_content = self._build_page_content(
                        city,
                        category,
                        row,
                    )

                    metadata = self._build_metadata(
                        city,
                        category,
                        row,
                        index,
                    )

                    documents.append(
                        Document(
                            page_content=page_content,
                            metadata=metadata,
                        )
                    )

        return documents

    # =====================================================

    def _build_ai_lookup(
        self,
        datasets: dict,
    ) -> dict:

        lookup = {}

        ai_df = datasets.get("ai_metadata")

        if ai_df is None:
            return lookup

        for _, row in ai_df.iterrows():

            row = row.to_dict()

            place_id = str(
                row.get("place_id", "")
            ).strip()

            if place_id:
                lookup[place_id] = row

        return lookup

    # =====================================================

    def _merge_ai_metadata(
        self,
        row: dict,
        ai_lookup: dict,
    ) -> dict:

        attraction_id = str(
            row.get("attraction_id", "")
        ).strip()

        ai_row = ai_lookup.get(attraction_id)

        if not ai_row:
            return row

        for key, value in ai_row.items():

            if key == "place_id":
                continue

            if (
                key not in row
                or pd.isna(row[key])
                or str(row[key]).strip() == ""
            ):
                row[key] = value

        return row

    # =====================================================

    def _build_page_content(
        self,
        city: str,
        category: str,
        row: dict,
    ) -> str:

        lines = [
            f"City: {city}",
            f"Category: {category}",
            "",
        ]

        priority_fields = [
            "place_name",
            "restaurant_name",
            "hotel_name",
            "short_description",
            "full_description",
            "history",
            "highlights",
            "best_time_to_visit",
            "opening_time",
            "closing_time",
            "entry_fee",
            "rating",
            "budget_category",
            "religious_score",
            "history_score",
            "food_score",
            "nature_score",
            "family_score",
            "popularity_score",
        ]

        used = set()

        for field in priority_fields:

            if field not in row:
                continue

            value = row[field]

            if pd.isna(value):
                continue

            value = str(value).strip()

            if not value:
                continue

            lines.append(
                f"{field.replace('_', ' ').title()}: {value}"
            )

            used.add(field)

        for field, value in row.items():

            if field in used:
                continue

            if pd.isna(value):
                continue

            value = str(value).strip()

            if not value:
                continue

            lines.append(
                f"{field.replace('_', ' ').title()}: {value}"
            )

        return "\n".join(lines)

    # =====================================================

    def _build_metadata(
        self,
        city: str,
        category: str,
        row: dict,
        index: int,
    ) -> dict:

        metadata = {
            "city": city.lower(),
            "category": category.lower(),
            "source_dataset": category.lower(),
            "document_id": f"{city}_{category}_{index}",
        }

        searchable = []

        for column, value in row.items():

            if pd.isna(value):
                continue

            key = (
                column.strip()
                .lower()
                .replace(" ", "_")
            )

            value = (
                value.strip()
                if isinstance(value, str)
                else value
            )

            if isinstance(value, str) and not value:
                continue

            if key == "category":
                metadata["place_category"] = value
                continue

            if key == "city":
                metadata["place_city"] = value
                continue

            metadata[key] = value

            if isinstance(value, str):
                searchable.append(value.lower())

        metadata["search_text"] = " ".join(searchable)

        return metadata


   # =====================================================
    # Builds documents from Sarvam-digitized PDF HTML.
    # Each chunk is classified independently via ContentClassifier —
    # no fixed category is assigned to the whole PDF.
    # =====================================================

    def build_pdf_documents(
        self,
        html_text: str,
        city: str = "varanasi",
        source_name: str = "official_pdf",
        classifier=None,
        image_paths: list = None,
    ) -> list[Document]:

        from bs4 import BeautifulSoup
        import pandas as pd
        from io import StringIO

        if classifier is None:
            from backend.rag.content_classifier import ContentClassifier
            classifier = ContentClassifier()

        documents = []

        # -------------------------------------------------
        # 1. Tables — classify each table independently
        # -------------------------------------------------

        try:
            tables = pd.read_html(StringIO(html_text))
        except ValueError:
            tables = []

        for i, df in enumerate(tables):

            table_text = df.to_string(index=False)

            if not classifier.is_meaningful(table_text):
                continue

            category = classifier.classify(table_text)

            content = (
                f"City: {city}\n"
                f"Category: {category}\n"
                f"Content Type: Table\n"
                f"Source: {source_name}\n\n"
                f"{table_text}"
            )

            metadata = {
                "city": city.lower(),
                "category": category,
                "source_dataset": source_name,
                "document_id": f"{city}_{source_name}_table_{i}",
                "content_type": "table",
            }

            if image_paths and i < len(image_paths):
                metadata["image_path"] = image_paths[i]

            documents.append(
                Document(page_content=content, metadata=metadata)
            )

        # -------------------------------------------------
        # 2. Text sections — classify per heading-grouped block
        # -------------------------------------------------

        soup = BeautifulSoup(html_text, "html.parser")

        for table in soup.find_all("table"):
            table.decompose()

        body = soup.find("body") or soup

        current_heading = "Overview"
        current_text = []
        chunk_index = 0

        def flush():
            nonlocal current_text, chunk_index

            text = " ".join(current_text).strip()

            if not classifier.is_meaningful(text):
                current_text = []
                return

            category = classifier.classify(text, heading=current_heading)

            content = (
                f"City: {city}\n"
                f"Category: {category}\n"
                f"Section: {current_heading}\n"
                f"Source: {source_name}\n\n"
                f"{text}"
            )

            metadata = {
                "city": city.lower(),
                "category": category,
                "source_dataset": source_name,
                "document_id": f"{city}_{source_name}_text_{chunk_index}",
                "content_type": "text",
                "section": current_heading,
            }

            # NEW: link images to text chunks too — for map-type
            # PDFs where the map is an embedded image, not a table
            if category == "city_maps" and image_paths:
                metadata["image_path"] = image_paths[
                    chunk_index % len(image_paths)
                ]

            documents.append(
                Document(page_content=content, metadata=metadata)
            )

            chunk_index += 1
            current_text = []

        for el in body.find_all(["h1", "h2", "h3", "h4", "p"]):

            if el.name in ("h1", "h2", "h3", "h4"):
                flush()
                current_heading = el.get_text(strip=True) or current_heading

            else:
                txt = el.get_text(strip=True)
                if txt:
                    current_text.append(txt)

        flush()

        return documents