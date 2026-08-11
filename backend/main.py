from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


OLLAMA_API_URL = "http://localhost:11434/api/chat"

DEFAULT_MODEL = "gemma3:270m"



class BotRequest(BaseModel):

    bot: str

    input: str

    temperature: float = 0.7

    assistant_type: str = "general"



def call_ollama(
    messages,
    temperature=0.7,
    model=DEFAULT_MODEL
):

    try:

        payload = {
            "model": model,

            "messages": messages,

            "stream": False,

            "options": {
                "temperature": temperature
            }
        }

        response = requests.post(
            OLLAMA_API_URL,
            json=payload,
            timeout=60
        )

        if response.status_code == 200:

            return response.json()["message"]["content"]

        else:

            return f"❌ Ollama Error: {response.status_code}"

    except requests.exceptions.ConnectionError:

        return "❌ Ollama is not running. Start Ollama first."

    except Exception as e:

        return f"❌ Error: {e}"



def qa_bot(
    question,
    temperature=0.7
):

    messages = [

        {
            "role": "system",

            "content":
            "You are a helpful assistant. "
            "Answer questions clearly and concisely."
        },

        {
            "role": "user",

            "content": question
        }

    ]

    return call_ollama(
        messages,
        temperature
    )



def summarize_text(
    text,
    temperature=0.5
):

    messages = [

        {
            "role": "system",

            "content":
            "You are a summarization expert. "
            "Summarize the given text while keeping "
            "the important points."
        },

        {
            "role": "user",

            "content":
            f"Summarize this text:\n\n{text}"
        }

    ]

    return call_ollama(
        messages,
        temperature
    )



def explain_code(
    code,
    temperature=0.3
):

    messages = [

        {
            "role": "system",

            "content":
            "You are an expert programmer. "
            "Explain code clearly and simply. "
            "Explain important parts step by step."
        },

        {
            "role": "user",

            "content":
            f"Explain this code:\n\n{code}"
        }

    ]

    return call_ollama(
        messages,
        temperature
    )



def smart_assistant(
    user_input,
    assistant_type="general",
    temperature=0.7
):

    system_prompts = {

        "general":
        "You are a helpful and friendly assistant. "
        "Answer questions clearly.",

        "creative":
        "You are a creative and imaginative assistant. "
        "Think outside the box and provide interesting ideas.",

        "technical":
        "You are a technical expert. "
        "Give accurate technical answers with examples.",

        "professional":
        "You are a professional business consultant. "
        "Give formal, structured and practical answers."
    }


    system_prompt = system_prompts.get(
        assistant_type,
        system_prompts["general"]
    )


    messages = [

        {
            "role": "system",

            "content": system_prompt
        },

        {
            "role": "user",

            "content": user_input
        }

    ]


    return call_ollama(
        messages,
        temperature
    )



@app.post("/chat")
def chat(request: BotRequest):



    if request.bot == "qa":

        result = qa_bot(
            request.input,
            request.temperature
        )



    elif request.bot == "summarizer":

        result = summarize_text(
            request.input,
            request.temperature
        )



    elif request.bot == "code":

        result = explain_code(
            request.input,
            request.temperature
        )


    elif request.bot == "smart":

        result = smart_assistant(
            request.input,
            request.assistant_type,
            request.temperature
        )


    else:

        return {
            "success": False,
            "error": "Invalid bot type"
        }




    return {

        "success": True,

        "bot": request.bot,

        "response": result

    }


@app.get("/")
def home():

    return {

        "message":
        "Ollama AI Assistant API is running",

        "model":
        DEFAULT_MODEL

    }