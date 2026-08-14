import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const platforms = [
  {
    name: "GMAIL",
    icon: "📧",
    description: " Gmail jobs",
  },
  {
    name: "FACEBOOK",
    icon: "📘",
    description: " Facebook jobs",
  },
  {
    name: "TIKTOK",
    icon: "🎵",
    description: "TikTok jobs",
  },
  {
    name: "INSTAGRAM",
    icon: "📸",
    description: " Instagram jobs",
  },
  {
    name: "TELEGRAM",
    icon: "✈️",
    description: " Telegram jobs",
  },
  {
    name: "WEBSITE",
    icon: "🌐",
    description: " Website jobs",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const handleFindJob = (platform) => {
    navigate("/dashboard/jobs", {
      state: {
        platform,
      },
    });
  };

  return (
    <div className="dashboard-home">
      <div className="home-header">
        <div>
          <p className="home-small-title">WORK UP HOME</p>

          <h1>Find Your Job</h1>

          <p className="home-description">
            Choose a platform and find available jobs.
          </p>
        </div>
      </div>

      <div className="platform-grid">
        {platforms.map((platform) => (
          <div className="platform-card" key={platform.name}>
            <div className="platform-icon">
              {platform.icon}
            </div>

            <h2>{platform.name}</h2>

            <p>{platform.description}</p>

            <button
              type="button"
              onClick={() => handleFindJob(platform.name)}
            >
              Find Job
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;