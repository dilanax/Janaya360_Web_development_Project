import { useEffect, useState } from "react";
import API from "../services/api";

export default function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await API.get("/news/Ranil");

        console.log("API Response:", data);

        if (data?.articles && Array.isArray(data.articles)) {
          setNews(data.articles);
        } else {
          setNews([]);
        }

      } catch (error) {
        console.error("Error fetching news:", error);
        setNews([]); // prevent crash
      }
    };

    fetchNews();
  }, []);

  return (
    <div>
      <h2>Political News</h2>

      {news.length === 0 && <p>No news available</p>}

      {news.map((item, index) => (
        <div key={index}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}