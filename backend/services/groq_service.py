from groq import Groq
from langfuse import observe, get_client
from backend.services.llm_service import LLMService

from config.settings import (
    GROQ_API_KEY,
    LLM_MODEL,
    LLM_TEMPERATURE,
    LLM_MAX_TOKENS,
)




class GroqService(LLMService):
    """
    Groq implementation of the LLM interface.

    Responsibilities
    ----------------
    • Connect to Groq API
    • Send prompts
    • Return generated response
    • Handle API failures gracefully
    """

    # -----------------------------------------------------

    def __init__(self):

        if not GROQ_API_KEY or not GROQ_API_KEY.strip():
            raise ValueError(
                "GROQ_API_KEY not found."
            )

        self.client = Groq(
            api_key=GROQ_API_KEY,
        )

    # -----------------------------------------------------
    @observe(as_type="generation")
    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
    ):
        """
        Returns
        -------
        tuple[str, dict]
            (generated_text, token_usage) where token_usage has
            keys "prompt_tokens", "completion_tokens", "total_tokens"
            (empty dict if usage info wasn't available).
        """

        system_prompt = (system_prompt or "").strip()
        user_prompt = (user_prompt or "").strip()

        if not user_prompt:
            return "No prompt was provided.", {}

        try:

            response = self.client.chat.completions.create(

                model=LLM_MODEL,

                temperature=LLM_TEMPERATURE,

                max_tokens=LLM_MAX_TOKENS,

                messages=[

                    {
                        "role": "system",
                        "content": system_prompt,
                    },

                    {
                        "role": "user",
                        "content": user_prompt,
                    },

                ],

            )

            token_usage = {}

            if response and response.usage:
                token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }


            # ------------------------------------------------
            # Enrich the Langfuse trace with model + token info
            # so the dashboard shows cost/usage, not just timing.
            # ------------------------------------------------

            langfuse = get_client()

            langfuse.update_current_generation(
                model=LLM_MODEL,
                usage_details=token_usage or None,
            )

            if (
                response
                and response.choices
                and response.choices[0].message
            ):

                text = (
                    response.choices[0]
                    .message.content
                    .strip()
                )

                return text, token_usage

            return "The model returned an empty response.", token_usage

        except Exception as error:

            raise RuntimeError(
                f"Groq generation failed: {error}"
            )


# ==========================================================
# Local Test
# ==========================================================

def main():

    llm = GroqService()

    response, token_usage = llm.generate(
        system_prompt="You are a helpful travel assistant.",
        user_prompt="""
Plan a one-day spiritual trip to Varanasi
for a family with a budget of ₹5000.
"""
    )

    print("\n")
    print("=" * 80)
    print("LLM RESPONSE")
    print("=" * 80)
    print(response)

    print("\n")
    print("=" * 80)
    print("TOKEN USAGE")
    print("=" * 80)
    print(f"Prompt Tokens     : {token_usage.get('prompt_tokens', 'N/A')}")
    print(f"Completion Tokens : {token_usage.get('completion_tokens', 'N/A')}")
    print(f"Total Tokens      : {token_usage.get('total_tokens', 'N/A')}")


if __name__ == "__main__":
    main()