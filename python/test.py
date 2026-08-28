import os 
from dotenv import load_dotenv
from google import genai


load_dotenv()
my_var = os.getenv("GEMINI_API_KEY")

client = genai.Client()


interaction = client.interactions.create(
    model="gemini-3.6-flash",
    input="Explain how AI works in a few words"
)
print(interaction.output_text)