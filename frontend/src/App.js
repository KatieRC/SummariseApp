import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
    const [article, setArticle] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSummarize = async (e) => {
        e.preventDefault();
        if (!article.trim()) {
            alert("Please enter an article to summarize.");
            return;
        }
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/summarize", { article });
            console.log("API Response:", response.data);
            setSummary(response.data.summary);
        } catch (error) {
            console.error("Error summarizing article:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <h1>Article Summarizer</h1>
            <form onSubmit={handleSummarize}>
                <textarea
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    placeholder="Paste your article here"
                    rows="10"
                    cols="50"
                />
                <button type="submit" disabled={loading}>Summarize</button>
            </form>
            {loading ? (
                <p>Summarizing...</p>
            ) : (
                <div>
                    <h2>Summary</h2>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
}

export default App;