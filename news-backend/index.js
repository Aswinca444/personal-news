const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const parser = new Parser();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// List of RSS feed URLs (you can add more!)
const feeds = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://feeds.bbci.co.uk/news/rss.xml'
];

app.get('/top-news', async (req, res) => {
  try {
    // Accept feeds from query parameters, or use default feeds
    let feeds = req.query.feed;
    if (!feeds) {
      feeds = [
        'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
        'https://feeds.bbci.co.uk/news/rss.xml'
      ];
    } else if (!Array.isArray(feeds)) {
      feeds = [feeds];
    }

    // Get keywords from query parameters
    let keywords = req.query.keyword || [];
    if (typeof keywords === "string") keywords = [keywords];
    keywords = keywords.map(k => k.trim().toLowerCase()).filter(Boolean);

    let allArticles = [];
    for (let url of feeds) {
      try {
        const feed = await parser.parseURL(url);
        const today = new Date().toDateString();
        const todaysArticles = feed.items.filter(item =>
          new Date(item.pubDate).toDateString() === today
        );
        allArticles.push(...todaysArticles);
      } catch (err) {
        // Ignore feeds that fail to parse
      }
    }

    // Score articles by keyword match (title + summary/description)
    const scoreArticle = (article) => {
      if (keywords.length === 0) return 0;
      const text = ((article.title || "") + " " + (article.contentSnippet || article.summary || article.description || "")).toLowerCase();
      return keywords.reduce((score, kw) => score + (text.includes(kw) ? 1 : 0), 0);
    };

    allArticles.forEach(article => {
      article._score = scoreArticle(article);
    });

    // Sort: highest score first, then by date
    allArticles.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    const top5 = allArticles.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.source || item.creator || "",
      score: item._score
    }));
    res.json(top5);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
