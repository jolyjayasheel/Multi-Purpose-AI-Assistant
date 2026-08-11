import { useState } from "react";
import "./App.css";

function App() {

  const [bot, setBot] = useState("qa");
  const [input, setInput] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [assistantType, setAssistantType] = useState("general");

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const botInfo = {

    qa: {
      title: "💬 Q&A Assistant",
      placeholder: "Ask any question..."
    },

    summarizer: {
      title: "📝 Summarizer",
      placeholder: "Paste the text you want to summarize..."
    },

    code: {
      title: "💻 Code Explainer",
      placeholder: "Paste your code here..."
    },

    smart: {
      title: "🤖 Smart Assistant",
      placeholder: "Tell me what you need..."
    }

  };


  const generateResponse = async () => {

    if (!input.trim()) {
      setError("Please enter something first.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");


    try {

      const result = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            bot: bot,

            input: input,

            temperature: Number(temperature),

            assistant_type: assistantType

          })
        }
      );


      const data = await result.json();


      if (!result.ok || !data.success) {

        throw new Error(
          data.error || "Something went wrong."
        );

      }


      setResponse(data.response);


    } catch (err) {

      setError(
        "Could not connect to FastAPI. Make sure your backend is running."
      );

      console.error(err);

    } finally {

      setLoading(false);

    }

  };


  const clearAll = () => {

    setInput("");
    setResponse("");
    setError("");

  };


  return (

    <div className="app">

      <div className="container">

        {/* HEADER */}

        <header>

          <h1>🤖 Ollama AI Assistant</h1>

          <p>
            One interface for Q&A, summarization,
            code explanation and smart assistance.
          </p>

        </header>


        {/* MAIN CARD */}

        <div className="card">


          {/* BOT SELECTOR */}

          <div className="section">

            <label>Choose AI Task</label>

            <select
              value={bot}
              onChange={(e) => {
                setBot(e.target.value);
                setResponse("");
                setError("");
              }}
            >

              <option value="qa">
                💬 Q&A Assistant
              </option>

              <option value="summarizer">
                📝 Summarizer
              </option>

              <option value="code">
                💻 Code Explainer
              </option>

              <option value="smart">
                🤖 Smart Assistant
              </option>

            </select>

          </div>


          {/* TEMPERATURE */}

          <div className="section">

            <div className="label-row">

              <label>
                Creativity
              </label>

              <span>
                {Number(temperature).toFixed(1)}
              </span>

            </div>


            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) =>
                setTemperature(e.target.value)
              }
            />


            <div className="range-labels">

              <span>Precise</span>

              <span>Balanced</span>

              <span>Creative</span>

            </div>

          </div>


          {/* ASSISTANT TYPE */}

          {bot === "smart" && (

            <div className="section">

              <label>
                Assistant Personality
              </label>

              <select
                value={assistantType}
                onChange={(e) =>
                  setAssistantType(e.target.value)
                }
              >

                <option value="general">
                  😊 General
                </option>

                <option value="creative">
                  🎨 Creative
                </option>

                <option value="technical">
                  🧑‍💻 Technical
                </option>

                <option value="professional">
                  💼 Professional
                </option>

              </select>

            </div>

          )}


          {/* INPUT */}

          <div className="section">

            <div className="label-row">

              <label>
                {botInfo[bot].title}
              </label>

              <span>
                {input.length} characters
              </span>

            </div>


            <textarea
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder={
                botInfo[bot].placeholder
              }
            />

          </div>


          {/* BUTTONS */}

          <div className="buttons">

            <button
              className="generate"
              onClick={generateResponse}
              disabled={loading}
            >

              {loading
                ? "⏳ Generating..."
                : "🚀 Generate Response"
              }

            </button>


            <button
              className="clear"
              onClick={clearAll}
            >

              Clear

            </button>

          </div>


          {/* ERROR */}

          {error && (

            <div className="error">
              ❌ {error}
            </div>

          )}


          {/* RESPONSE */}

          {response && (

            <div className="response-section">

              <div className="response-header">

                <h2>✨ Response</h2>

              </div>


              <div className="response">

                {response}

              </div>

            </div>

          )}

        </div>


        {/* FOOTER */}

        <footer>

          Powered by
          <strong> Ollama + Gemma 3:270M</strong>
          {" "}· FastAPI + React

        </footer>

      </div>

    </div>

  );

}

export default App;