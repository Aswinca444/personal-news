import React, { useState, useEffect } from "react";

// --- Preloaded popular feeds ---
const POPULAR_FEEDS = [
  { name: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
  { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
  { name: "Daily Mail", url: "https://www.dailymail.co.uk/articles.rss" },
  { name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms" },
  { name: "Mint", url: "https://www.livemint.com/rss/news" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
  { name: "NDTV", url: "https://feeds.feedburner.com/NDTV-LatestNews" },
  { name: "Indian Express", url: "https://indianexpress.com/feed" },
];

// --- LocalStorage keys ---
const FEEDS_KEY = "custom_rss_feeds";
const KEYWORDS_KEY = "custom_keywords";

// --- Helpers for localStorage ---
const getSavedFeeds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FEEDS_KEY));
    return Array.isArray(saved) && saved.length > 0 ? saved : [""];
  } catch {
    return [""];
  }
};
const getSavedKeywords = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEYWORDS_KEY));
    return Array.isArray(saved) ? saved : [""];
  } catch {
    return [""];
  }
};

function App() {
  // --- State ---
  const [feeds, setFeeds] = useState(getSavedFeeds());
  const [keywords, setKeywords] = useState(getSavedKeywords());
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showArticles, setShowArticles] = useState(false);
  const [error, setError] = useState("");

  // --- Save feeds/keywords to localStorage whenever they change ---
  useEffect(() => {
    localStorage.setItem(FEEDS_KEY, JSON.stringify(feeds.filter(f => f.trim() !== "")));
  }, [feeds]);
  useEffect(() => {
    localStorage.setItem(KEYWORDS_KEY, JSON.stringify(keywords.filter(k => k.trim() !== "")));
  }, [keywords]);

  // --- Popular feeds handler ---
  const addPopularFeed = (url) => {
    if (!feeds.includes(url)) setFeeds([...feeds, url]);
  };

  // --- Custom feeds handlers ---
  const addFeedInput = () => setFeeds([...feeds, ""]);
  const handleFeedChange = (idx, value) => {
    const newFeeds = [...feeds];
    newFeeds[idx] = value;
    setFeeds(newFeeds);
  };
  const removeFeedInput = (idx) => {
    if (feeds.length === 1) return;
    setFeeds(feeds.filter((_, i) => i !== idx));
  };

  // --- Keywords handlers ---
  const addKeywordInput = () => setKeywords([...keywords, ""]);
  const handleKeywordChange = (idx, value) => {
    const newKeywords = [...keywords];
    newKeywords[idx] = value;
    setKeywords(newKeywords);
  };
  const removeKeywordInput = (idx) => {
    if (keywords.length === 1) return;
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  // --- Fetch articles ---
  const fetchArticles = async () => {
    setLoading(true);
    setError("");
    setArticles([]);
    setShowArticles(false);

    // Build query params
    const params = new URLSearchParams();
    feeds.filter(f => f.trim() !== "").forEach(feed => params.append("feed", feed.trim()));
    keywords.filter(k => k.trim() !== "").forEach(keyword => params.append("keyword", keyword.trim()));

    // Use your deployed backend URL!
    try {
      const res = await fetch("https://personal-news.onrender.com/top-news?" + params.toString());
      if (!res.ok) throw new Error("Failed to fetch articles");
      const data = await res.json();
      setArticles(data);
      setShowArticles(true);
    } catch (err) {
      setError("Could not fetch articles. Please check your feeds and try again.");
    }
    setLoading(false);
  };

  // --- UI ---
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5d6e6 0%, #c3cfe2 100%)",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: 1100,
          width: "100%",
          background: "#fff",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        {/* --- Left: Welcome Message --- */}
        <div
          style={{
            flex: 1.2,
            background: "linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)",
            color: "#fff",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", fontWeight: 800 }}>
            Stay Informed, Effortlessly.
          </h1>
          <p style={{ fontSize: "1.2rem", lineHeight: 1.6 }}>
            Imagine having all the news you care about, delivered exactly how you want it.
            Our app puts you in control of your information flow. From trending topics to niche interests, build a news experience that fits your life.
          </p>
        </div>

        {/* --- Right: RSS Feed Input, Keywords, & Articles --- */}
        <div style={{ flex: 1.5, padding: "2.5rem 2rem", background: "#f8faff" }}>
          {!showArticles ? (
            <>
              <h2 style={{ color: "#636e72", marginBottom: "1rem" }}>Your RSS Feeds</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchArticles();
                }}
              >
                {/* --- Popular feeds dropdown --- */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontWeight: "bold" }}>Add from popular sources:</label>
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        addPopularFeed(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    style={{ marginLeft: "1rem", padding: "0.5rem", borderRadius: "6px" }}
                  >
                    <option value="">Select a source</option>
                    {POPULAR_FEEDS.map(feed => (
                      <option key={feed.url} value={feed.url}>{feed.name}</option>
                    ))}
                  </select>
                </div>

                {/* --- Custom feed input boxes --- */}
                {feeds.map((feed, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      value={feed}
                      onChange={(e) => handleFeedChange(idx, e.target.value)}
                      placeholder="Enter RSS feed URL"
                      style={{
                        flex: 1,
                        padding: "0.7rem",
                        borderRadius: "8px",
                        border: "1px solid #b2bec3",
                        fontSize: "1rem",
                        marginRight: "0.5rem",
                      }}
                      required
                    />
                    {feeds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeedInput(idx)}
                        style={{
                          background: "#d63031",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "2rem",
                          height: "2rem",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                        title="Remove"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeedInput}
                  style={{
                    background: "#00b894",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.6rem 1.2rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginRight: "1rem",
                  }}
                >
                  + Add Another Feed
                </button>
                <hr style={{ margin: "2rem 0 1rem 0", border: "none", borderTop: "1px solid #dfe6e9" }} />
                <h2 style={{ color: "#636e72", marginBottom: "1rem" }}>Your Keywords</h2>
                {/* --- Keyword input boxes --- */}
                {keywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => handleKeywordChange(idx, e.target.value)}
                      placeholder="Enter keyword (e.g. AI, climate, sports)"
                      style={{
                        flex: 1,
                        padding: "0.7rem",
                        borderRadius: "8px",
                        border: "1px solid #b2bec3",
                        fontSize: "1rem",
                        marginRight: "0.5rem",
                      }}
                    />
                    {keywords.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeywordInput(idx)}
                        style={{
                          background: "#d63031",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "2rem",
                          height: "2rem",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                        title="Remove"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addKeywordInput}
                  style={{
                    background: "#00b894",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.6rem 1.2rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginRight: "1rem",
                  }}
                >
                  + Add Another Keyword
                </button>
                <br /><br />
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(90deg, #6c5ce7 0%, #00b894 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.6rem 1.5rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  Show Me Top Articles
                </button>
              </form>
              {error && (
                <div style={{ color: "#d63031", marginTop: "1rem" }}>{error}</div>
              )}
              {loading && (
                <div style={{ color: "#636e72", marginTop: "1rem" }}>Loading...</div>
              )}
            </>
          ) : (
            // --- Articles Section ---
            <div>
              <h2 style={{ color: "#636e72", marginBottom: "1.2rem" }}>
                Top 5 Articles
              </h2>
              {articles.length === 0 ? (
                <p>No articles found for today.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {articles.map((article, idx) => (
                    <li
                      key={idx}
                      style={{
                        marginBottom: "1.5rem",
                        padding: "1rem",
                        borderRadius: "10px",
                        background: "#fff",
                        transition: "background 0.2s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          color: "#0984e3",
                          textDecoration: "none",
                        }}
                      >
                        {article.title}
                      </a>
                      <div style={{ marginTop: "0.5rem", color: "#636e72", fontSize: "0.95rem" }}>
                        {article.source && <span>{article.source} &nbsp;|&nbsp; </span>}
                        {new Date(article.pubDate).toLocaleString()}
                        {typeof article.score === "number" && article.score > 0 && (
                          <span style={{ color: "#00b894", marginLeft: "1rem" }}>
                            {article.score} keyword match{article.score > 1 ? "es" : ""}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                style={{
                  background: "#fdcb6e",
                  color: "#2d3436",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.6rem 1.2rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginTop: "1rem",
                }}
                onClick={() => setShowArticles(false)}
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;