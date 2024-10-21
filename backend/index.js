const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;
const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
    "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
    "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
    "the", "and", "but", "if", "or", "because", "as", "until", "while",
    "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from",
    "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "s", "t", "can", "will", "just", "don", "should", "now"
]);

// Route to summarize the article
app.post("/summarize", (req, res) => {
    const { article } = req.body;

    try {
        const summary = summarizeArticle(article);
        res.json({ summary });
    } catch (error) {
        console.error("Error summarizing article:", error);
        res.status(500).json({ error: "Summarization failed" });
    }
});

// Summarization function using TextRank
function summarizeArticle(article) {
    const sentences = article.split('. ').filter(sentence => sentence.length > 0);
    const wordFrequency = {};
    const summarySentences = [];

    // Calculate word frequencies
    sentences.forEach(sentence => {
        const words = sentence.split(' ').filter(word => word);
        words.forEach(word => {
            const lowerWord = word.toLowerCase().replace(/[.,!?]/g, '');
            wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
        });
    });

    // Score sentences based on word frequencies
    sentences.forEach((sentence, index) => {
        let sentenceScore = 0;
        const words = sentence.split(' ').filter(word => word);
        words.forEach(word => {
            const lowerWord = word.toLowerCase().replace(/[.,!?]/g, '');
            sentenceScore += wordFrequency[lowerWord] || 0;
        });

        // Increase weight for earlier sentences and longer sentences
        sentenceScore += (sentences.length - index) * 0.1; // Slight increase for earlier sentences
        sentenceScore += (words.length > 10 ? 1 : 0); // Bonus for longer sentences
        summarySentences.push({ sentence, score: sentenceScore });
    });

    // Sort sentences based on their scores
    summarySentences.sort((a, b) => b.score - a.score);

    // Select a broader range of sentences for summary
    const maxSummarySentences = Math.min(5, Math.ceil(sentences.length * 0.3)); // Allow up to 30%
    const selectedSentences = new Set(); // To avoid duplication

    // Choose sentences based on score but ensure diversity
    summarySentences.forEach(s => {
        if (selectedSentences.size < maxSummarySentences && !selectedSentences.has(s.sentence)) {
            selectedSentences.add(s.sentence);
        }
    });

    const summary = Array.from(selectedSentences).join('. '); // Join selected sentences
    return summary || "No summary available.";
}




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});