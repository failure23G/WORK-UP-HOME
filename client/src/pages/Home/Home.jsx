import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const faqData = [
    {
      question: "এখানে কাজ করতে কি কোনো অভিজ্ঞতা লাগে?",
      answer:
        "না, এখানে কাজ করার জন্য আগে থেকে কোনো অভিজ্ঞতার প্রয়োজন নেই। প্রতিটি কাজ সহজভাবে বোঝানোর জন্য প্রয়োজনীয় নির্দেশনা দেওয়া থাকবে।",
    },
    {
      question: "টাকা কীভাবে উইথড্র করবো?",
      answer:
        "আপনার কাজ সম্পন্ন ও অনুমোদিত হওয়ার পর নির্ধারিত পেমেন্ট মেথডের মাধ্যমে আপনার আয় উত্তোলন করতে পারবেন।",
    },
    {
      question: "রেফার করে কি আয় করা সম্ভব?",
      answer:
        "হ্যাঁ। আপনার পরিচিতদের প্ল্যাটফর্মে আমন্ত্রণ জানিয়ে যোগ্য কাজের ভিত্তিতে রেফারেল সুবিধা পেতে পারেন।",
    },
  ];

  return (
    <div className="home-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <Link to="/" className="brand">
         <div className="brand-icon">
            <span className="brand-h">H</span>
              </div>

             <div className="brand-info">
             <div className="brand-name">WUH</div>

            <div className="brand-subtitle">Work Up Home</div>
          </div>
                </Link>

        <div className="desktop-nav">
          <Link to="/faq">FAQ</Link>
          <Link to="/referral">Referral</Link>
          <Link to="/messages">Support</Link>
        </div>

        <div className="menu-area">
          <button
  type="button"
  className={`menu-button ${menuOpen ? "menu-active" : ""}`}
  onClick={() => setMenuOpen(!menuOpen)}
  aria-label="Open menu"
>

            <span></span>
            <span></span>
            <span></span>
          </button>

          
           {menuOpen && (
  <div className="menu-dropdown">

    <Link
      to="/login"
      className="menu-item"
      onClick={() => setMenuOpen(false)}
    >
      Login
    </Link>

    <Link
      to="/register"
      className="menu-item"
      onClick={() => setMenuOpen(false)}
    >
       Registration
    </Link>


  </div>
         )}           
        </div>
      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}
      <main className="hero">

        {/* Earth */}
        <div className="earth-background">
          <img
            src="/earth.png"
            alt="Earth"
          />
        </div>

        {/* Space overlay */}
        <div className="space-overlay"></div>

        {/* Soft blue glow */}
        <div className="earth-glow"></div>

        {/* Stars */}
        <div className="stars-layer">
          <span className="tiny-star star-a"></span>
          <span className="tiny-star star-b"></span>
          <span className="tiny-star star-c"></span>
          <span className="tiny-star star-d"></span>
          <span className="tiny-star star-e"></span>
        </div>

        {/* One shooting star */}
        <div className="shooting-star">
          <span></span>
        </div>
 {/* Hero title */}
        <section className="hero-title">

          <h1>
            <span>Welcome to </span>
            <strong>Work Up Home</strong>
          </h1>

          <p className="hero-description">
            ঘরে বসে সহজভাবে কাজ করুন, দক্ষতা তৈরি করুন এবং আপনার
            আয়ের নতুন পথ তৈরি করুন।
          </p>

        </section>


        {/* =====================================================
            HERO SERVICE CARDS
        ===================================================== */}
        <section className="cards">

          <div className="service-card job-card">

            <div className="card-glow"></div>

            <div className="card-icon job-icon">
              💼
            </div>

            <h2>JOB</h2>

            <p>
              Find your perfect job
            </p>

            <button className="job-button">
              Find Job
            </button>

          </div>


          <div className="service-card earning-card">

            <div className="card-glow"></div>

            <div className="card-icon earning-icon">
              💰
            </div>

            <h2>Earning</h2>

            <p>
              Start earning with us
            </p>

            <button className="earning-button">
              Start Earning
            </button>

          </div>

        </section>

      </main>


      {/* =====================================================
          STATS
      ===================================================== */}
      <section className="home-stats-section">

        <div className="section-container">

          <div className="stats-grid">

            <div className="stat-card">
              <strong>24/6</strong>
              <span>LIVE SUPPORT</span>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PAYMENT METHODS
      ===================================================== */}
      <section className="payment-section">

        <div className="section-container">

          <p className="section-kicker">
            PAYMENT METHODS
          </p>

          <h2 className="small-section-title">
            সহজ ও সুবিধাজনক পেমেন্ট
          </h2>

          <div className="payment-list">

            <div className="payment-item">
              <span className="payment-symbol bkash">৳</span>
              <span>bKash</span>
            </div>

            <div className="payment-item">
              <span className="payment-symbol nagad">৳</span>
              <span>Nagad</span>
            </div>

            <div className="payment-item">
              <span className="payment-symbol binance">B</span>
              <span>Binance</span>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SERVICES
      ===================================================== */}
      <section className="premium-section">

        <div className="section-container">

          <div className="section-heading">

            <p className="section-kicker">
              WHAT WE OFFER
            </p>

            <h2>
              আমাদের জনপ্রিয় <span>Services</span>
            </h2>

            <p>
              Work Up Home-এ সহজ ও flexible কাজের মাধ্যমে
              নিজের সময় অনুযায়ী আয় করার সুযোগ তৈরি করুন।
            </p>

          </div>


          <div className="premium-grid">

            <div className="premium-card">
              <div className="premium-icon gmail-icon">G</div>
              <h3>Gmail Task</h3>
              <p>সহজ Gmail task সম্পন্ন করে আপনার অবসর সময়কে productive করে তুলুন।</p>
              <div className="card-arrow">→</div>
            </div>

            <div className="premium-card">
              <div className="premium-icon social-icon">Y</div>
              <h3>YouTube Task</h3>
              <p>YouTube-এর সহজ task সম্পন্ন করে earning করার সুযোগ নিন।</p>
              <div className="card-arrow">→</div>
            </div>

            <div className="premium-card">
              <div className="premium-icon social-icon">F</div>
              <h3>Facebook Task</h3>
              <p>Facebook-এর সহজ task complete করে নিয়মিত earning করুন।</p>
              <div className="card-arrow">→</div>
            </div>

            <div className="premium-card">
              <div className="premium-icon social-icon">T</div>
              <h3>Telegram Task</h3>
              <p>Telegram-এর সহজ online task সম্পন্ন করে আয় করার সুযোগ নিন।</p>
              <div className="card-arrow">→</div>
            </div>

            <div className="premium-card">
              <div className="premium-icon referral-icon">+</div>
              <h3>Add Other</h3>
              <p>নতুন ধরনের কাজ ও future task category এখানে যোগ করা যাবে।</p>
              <div className="card-arrow">→</div>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FAQ
      ===================================================== */}
      <section className="faq-section">

        <div className="faq-intro">

          <p className="section-kicker">
            FAQ
          </p>

          <h2>
            Frequently Asked <span>Questions</span>
          </h2>

          <p>
            আপনার মনে থাকা সাধারণ প্রশ্নগুলোর উত্তর এখানে
            দেওয়া হলো। আরও কিছু জানার থাকলে support-এর
            সাথে যোগাযোগ করতে পারেন।
          </p>

          <Link
            to="/messages"
            className="support-button"
          >
            Contact Support
          </Link>

        </div>


        <div className="faq-list">

          {faqData.map((item, index) => (

            <div
              className={`faq-item ${
                openFaq === index ? "active" : ""
              }`}
              key={item.question}
            >

              <button
                type="button"
                onClick={() =>
                  setOpenFaq(
                    openFaq === index ? -1 : index
                  )
                }
              >

                <span>
                  {item.question}
                </span>

                <b>
                  {openFaq === index ? "−" : "+"}
                </b>

              </button>


              {openFaq === index && (
                <div className="faq-answer">
                  {item.answer}
                </div>
              )}

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="cta-section">

        <div className="cta-box">

          <div className="cta-stars">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <p className="section-kicker">
            START YOUR JOURNEY
          </p>

          <h2>
            Ready to Start Earning?
          </h2>

          <p>
            আজই Work Up Home-এ যুক্ত হন এবং
            আপনার সময়কে নতুন earning opportunity-তে
            ব্যবহার করুন।
          </p>

          <Link
            to="/register"
            className="cta-button"
          >
            Join Now For Free
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="home-footer">

        <div className="footer-inner">

          <div className="footer-brand">

            <div className="brand-icon">
  <span className="brand-h">H</span>
                    </div>
              
            

            <div>

              <h3>
                WUH
              </h3>

              <p>
                Work Up Home
              </p>

            </div>

          </div>


          <div className="footer-description">

            <p>
              Work Up Home একটি সহজ online earning
              platform যেখানে নিজের সময় অনুযায়ী
              বিভিন্ন কাজের সুযোগ খুঁজে পাওয়া যাবে।
            </p>

          </div>


          <div className="footer-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Registration
            </Link>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 WUH — Work Up Home
          </span>

          <span>
            Built for a better earning experience.
          </span>

        </div>

      </footer>


      {/* =====================================================
          CSS
      ===================================================== */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background: #f7f9fc;
          color: #111827;
        }

        button,
        a {
          font-family: inherit;
        }


        /* =====================================================
           PAGE
        ===================================================== */

        .home-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f7f9fc;
        }


        /* =====================================================
           NAVBAR
        ===================================================== */

        .navbar {
          width: 100%;
          height: 86px;
          padding: 0 34px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: rgba(255, 255, 255, 0.96);

          position: sticky;
          top: 0;
          z-index: 1000;

          border-bottom: 1px solid rgba(226, 232, 240, 0.8);

          transition:
            box-shadow 0.3s ease,
            background 0.3s ease,
            height 0.3s ease;
        }

        .navbar-scrolled {
          height: 76px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(18px);
          box-shadow:
            0 10px 35px rgba(15, 23, 42, 0.08);
        }


        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
          text-decoration: none;
        }


        .brand-icon {
          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          font-size: 30px;

          background:
            linear-gradient(
              135deg,
              #5837ed,
              #2864e9
            );

          box-shadow:
            0 9px 24px
            rgba(67, 56, 202, 0.3);

          animation:
            brandFloat
            4s
            ease-in-out
            infinite;
        }


        @keyframes brandFloat {

          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }

        }


        .brand-name {
          font-size: 29px;
          font-weight: 950;
          line-height: 1;
          color: #172554;
        }


        .brand-subtitle {
          margin-top: 6px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }


        /* =====================================================
           MENU
        ===================================================== */
        .desktop-nav {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-left: 70px;
  margin-right: 30px;
}

.desktop-nav a {
  color: #172554;
  text-decoration: none;
  font-size: 24px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.desktop-nav a:hover {
  color: #5b3df5;
  transform: translateY(-2px);
}

.menu-area {
  position: relative;
  z-index: 99999;
}


        .menu-button {
          width: 58px;
          height: 58px;

          border: 0;
          border-radius: 16px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 5px;

          cursor: pointer;

          background:
            linear-gradient(
              135deg,
              #5035e8,
              #2563eb
            );

          box-shadow:
            0 9px 24px
            rgba(37, 99, 235, 0.32);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }


        .menu-button:hover {
          transform: translateY(-3px) scale(1.03);

          box-shadow:
            0 14px 30px
            rgba(37, 99, 235, 0.4);
        }


        .menu-button span {
          width: 27px;
          height: 3px;

          border-radius: 20px;

          background: #fff;

          transition:
            transform 0.25s ease,
            opacity 0.25s ease;
        }


        .menu-active span:nth-child(1) {
          transform:
            translateY(8px)
            rotate(45deg);
        }

        .menu-active span:nth-child(2) {
          opacity: 0;
        }

        .menu-active span:nth-child(3) {
          transform:
            translateY(-8px)
            rotate(-45deg);
        }


        .menu-dropdown {
          position: fixed;
          top: 96px;
          right: 30px;
          z-index: 9999999;

          width: 235px;

          padding: 10px;

          border-radius: 20px;

          background: rgba(255, 255, 255, 0.97);

          border: 1px solid #e5e7eb;

          box-shadow:
            0 25px 60px
            rgba(15, 23, 42, 0.2);

          backdrop-filter: blur(16px);

          animation:
            dropdownIn
            0.28s
            cubic-bezier(.2,.8,.2,1);
        }


        @keyframes dropdownIn {

          from {
            opacity: 0;
            transform:
              translateY(-12px)
              scale(0.94);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }


        .menu-item {
          display: block;

          padding: 15px 18px;
          margin: 5px 0;

          border-radius: 12px;

          text-align: center;

          text-decoration: none;

          color: #fff;

          font-size: 16px;
          font-weight: 850;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #3b82f6
            );

          box-shadow:
            0 7px 18px
            rgba(37, 99, 235, 0.25);

          transition:
            transform 0.2s ease,
            filter 0.2s ease;
        }


        .menu-item:hover {
          transform: translateX(-3px);
          filter: brightness(1.08);
        }


        /* =====================================================
           HERO
        ===================================================== */

        .hero {
          width: 100%;
          min-height: calc(100vh - 86px);

          position: relative;

          overflow: hidden;

          display: flex;
          flex-direction: column;
          align-items: center;

          padding:
            60px
            20px
            70px;

          background: #000814;
        }


        /* =====================================================
           EARTH
        ===================================================== */

        .earth-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

          background:
            radial-gradient(
              circle at center,
              #102a55 0%,
              #020617 52%,
              #000814 100%
            );
        }


        .earth-background::after {
          content: "";

          position: absolute;
          inset: -20%;

          background:
            radial-gradient(
              circle at center,
              transparent 45%,
              rgba(0, 8, 20, 0.2) 70%,
              rgba(0, 8, 20, 0.7) 100%
            );

          pointer-events: none;
        }


        .earth-background img {
          position: absolute;

          width: 125%;
          height: 125%;

          max-width: none;

          left: 50%;
          top: 50%;

          object-fit: cover;

          transform:
            translate(-50%, -50%)
            scale(1.04);

          transform-origin: center;

          animation:
            earthRotate
            150s
            linear
            infinite;

          filter:
            saturate(1.12)
            contrast(1.04)
            brightness(0.9);
        }


        @keyframes earthRotate {

          from {
            transform:
              translate(-50%, -50%)
              scale(1.04)
              rotate(0deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              scale(1.04)
              rotate(360deg);
          }

        }


        .earth-glow {
          position: absolute;

          width: 90%;
          height: 90%;

          left: 50%;
          top: 50%;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          box-shadow:
            0 0 120px
            rgba(56, 189, 248, 0.22);

          z-index: 1;

          pointer-events: none;
        }


        .space-overlay {
          position: absolute;
          inset: 0;

          z-index: 2;

          pointer-events: none;

          background:
            linear-gradient(
              to bottom,
              rgba(0, 8, 20, 0.1),
              rgba(0, 8, 20, 0.22)
            );
        }


        /* =====================================================
           STARS
        ===================================================== */

        .stars-layer {
          position: absolute;
          inset: 0;

          z-index: 3;

          pointer-events: none;
        }


        .tiny-star {
          position: absolute;

          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #fff;

          box-shadow:
            0 0 7px
            rgba(255,255,255,0.95);

          animation:
            starPulse
            3s
            ease-in-out
            infinite;
        }


        .star-a {
          top: 14%;
          left: 11%;
        }

        .star-b {
          top: 28%;
          right: 15%;
          animation-delay: .8s;
        }

        .star-c {
          top: 52%;
          left: 8%;
          animation-delay: 1.4s;
        }

        .star-d {
          top: 67%;
          right: 10%;
          animation-delay: 2s;
        }

        .star-e {
          top: 18%;
          right: 34%;
          animation-delay: 2.4s;
        }


        @keyframes starPulse {

          0%,
          100% {
            opacity: .25;
            transform: scale(.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.5);
          }

        }


        /* =====================================================
           SHOOTING STAR
        ===================================================== */

        .shooting-star {
          position: absolute;

          top: 5%;
          left: 16%;

          width: 180px;
          height: 3px;

          z-index: 4;

          pointer-events: none;

          transform: rotate(25deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.15),
              rgba(255,255,255,.8),
              #fff
            );

          border-radius: 20px;

          box-shadow:
            0 0 12px #fff,
            0 0 25px #38bdf8;

          animation:
            shootingStar
            6s
            linear
            infinite;
        }


        .shooting-star span {
          position: absolute;

          right: -6px;
          top: 50%;

          width: 10px;
          height: 10px;

          transform:
            translateY(-50%);

          border-radius: 50%;

          background: white;

          box-shadow:
            0 0 8px #fff,
            0 0 20px #7dd3fc,
            0 0 35px #38bdf8;
        }


        @keyframes shootingStar {

          0% {
            opacity: 0;

            transform:
              translate(-300px,-160px)
              rotate(25deg);
          }

          8% {
            opacity: 1;
          }

          25% {
            opacity: 1;

            transform:
              translate(500px,360px)
              rotate(25deg);
          }

          31% {
            opacity: 0;
          }

          100% {
            opacity: 0;

            transform:
              translate(900px,700px)
              rotate(25deg);
          }

        }


        /* =====================================================
           HERO TITLE
        ===================================================== */

        .hero-title {
          position: relative;

          z-index: 5;

          width: 100%;
          max-width: 1000px;

          text-align: center;

          animation:
            heroTitleIn
            1s
            cubic-bezier(.2,.8,.2,1);
        }


        @keyframes heroTitleIn {

          from {
            opacity: 0;
            transform:
              translateY(25px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }

        }


        .hero-badge {
          display: inline-flex;

          align-items: center;
          gap: 8px;

          padding: 7px 15px;

          border-radius: 999px;

          color: #ff6684;

          background:
            rgba(255,255,255,.08);

          border:
            1px solid
            rgba(255,255,255,.12);

          font-size: 14px;
          font-weight: 900;

          letter-spacing: 1px;

          box-shadow:
            0 0 25px
            rgba(255,80,120,.15);
        }


        .hero-badge span {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #ff5277;

          box-shadow:
            0 0 10px #ff5277;

          animation:
            livePulse
            1.5s
            ease-in-out
            infinite;
        }


        @keyframes livePulse {

          0%,
          100% {
            transform: scale(.8);
            opacity: .65;
          }

          50% {
            transform: scale(1.35);
            opacity: 1;
          }

        }


        .hero-title h1 {
          margin:
            18px
            0
            0;

          color: white;

          font-size:
            clamp(
              36px,
              5vw,
              64px
            );

          line-height: 1.06;

          font-weight: 950;

          letter-spacing: -2px;

          text-shadow:
            0 5px 25px
            rgba(0,0,0,.75);
        }


        .hero-title h1 strong {
          color: #a45cff;

          text-shadow:
            0 0 25px
            rgba(164,92,255,.4);
        }


        .hero-subtitle {
          margin:
            13px
            0
            0;

          color: white;

          font-size: 23px;

          font-weight: 600;

          text-shadow:
            0 4px 15px
            rgba(0,0,0,.8);
        }


        .hero-description {
          max-width: 600px;

          margin:
            17px
            auto
            0;

          color:
            rgba(255,255,255,.78);

          font-size: 16px;

          line-height: 1.7;

          text-shadow:
            0 3px 10px
            rgba(0,0,0,.7);
        }


        /* =====================================================
           HERO CARDS
        ===================================================== */

        .cards {
          position: relative;

          z-index: 5;

          width: 100%;
          max-width: 900px;

          display: flex;

          justify-content: center;

          align-items: stretch;

          gap: 34px;

          margin-top: 48px;
        }


        .service-card {
          position: relative;

          width: 360px;
          min-height: 285px;

          padding: 30px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;

          overflow: hidden;

          border-radius: 25px;

          background:
            rgba(255,255,255,.94);

          border:
            1px solid
            rgba(255,255,255,.9);

          box-shadow:
            0 25px 60px
            rgba(0,0,0,.24);

          backdrop-filter:
            blur(12px);

          animation:
            cardEntrance
            .8s
            cubic-bezier(.2,.8,.2,1)
            both;

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }


        .job-card {
          animation-delay: .15s;
        }

        .earning-card {
          animation-delay: .3s;
        }


        @keyframes cardEntrance {

          from {
            opacity: 0;

            transform:
              translateY(40px)
              scale(.94);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        .service-card:hover {
          transform:
            translateY(-10px);

          box-shadow:
            0 35px 75px
            rgba(0,0,0,.3);
        }


        .card-glow {
          position: absolute;

          width: 180px;
          height: 180px;

          top: -100px;
          right: -80px;

          border-radius: 50%;

          background:
            rgba(99,102,241,.12);

          filter: blur(15px);

          pointer-events: none;
        }


        .earning-card .card-glow {
          background:
            rgba(16,185,129,.12);
        }


        .card-icon {
          position: relative;

          width: 76px;
          height: 76px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 22px;

          font-size: 39px;

          margin-bottom: 15px;

          box-shadow:
            0 13px 30px
            rgba(15,23,42,.1);

          animation:
            iconFloat
            4s
            ease-in-out
            infinite;
        }


        @keyframes iconFloat {

          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }

        }


        .job-icon {
          background:
            linear-gradient(
              135deg,
              #e8e0ff,
              #d9d0ff
            );
        }


        .earning-icon {
          background:
            linear-gradient(
              135deg,
              #d8ffe9,
              #bff6d4
            );
        }


        .service-card h2 {
          margin:
            3px
            0
            4px;

          color: #172554;

          font-size: 30px;

          font-weight: 950;
        }


        .service-card p {
          margin:
            0
            0
            20px;

          color: #64748b;

          font-size: 16px;
        }


        .service-card button {
          border: 0;

          border-radius: 12px;

          padding:
            13px
            30px;

          color: white;

          font-size: 15px;

          font-weight: 900;

          cursor: pointer;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            filter .2s ease;
        }


        .service-card button:hover {
          transform:
            translateY(-3px);

          filter:
            brightness(1.08);
        }


        .job-button {
          background:
            linear-gradient(
              135deg,
              #6d35e9,
              #2563eb
            );

          box-shadow:
            0 10px 25px
            rgba(79,70,229,.35);
        }


        .earning-button {
          background:
            linear-gradient(
              135deg,
              #10b981,
              #059669
            );

          box-shadow:
            0 10px 25px
            rgba(16,185,129,.3);
        }


        /* =====================================================
           COMMON
        ===================================================== */

        .section-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }


        .section-kicker {
          margin: 0 0 12px;

          color: #5b55f6;

          font-size: 13px;

          font-weight: 950;

          letter-spacing: 1.7px;
        }


        .small-section-title {
          margin:
            0
            0
            25px;

          color: #172554;

          font-size: 27px;

          font-weight: 900;
        }


        /* =====================================================
           STATS
        ===================================================== */

        .home-stats-section {
          position: relative;

          padding:
            55px
            5%;

          background:
            linear-gradient(
              180deg,
              #f8faff,
              #f3f6fb
            );
        }


        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 22px;
        }


        .stat-card {
          padding:
            30px
            18px;

          text-align: center;

          background: white;

          border:
            1px solid
            #edf1f7;

          border-radius: 22px;

          box-shadow:
            0 10px 30px
            rgba(15,23,42,.06);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }


        .stat-card:hover {
          transform:
            translateY(-7px);

          box-shadow:
            0 18px 38px
            rgba(15,23,42,.1);
        }


        .stat-card strong {
          display: block;

          color: #4f46e5;

          font-size: 40px;

          line-height: 1;

          font-weight: 950;
        }


        .stat-card span {
          display: block;

          margin-top: 11px;

          color: #64748b;

          font-size: 13px;

          font-weight: 850;

          letter-spacing: .7px;
        }


        /* =====================================================
           PAYMENT
        ===================================================== */

        .payment-section {
          padding:
            55px
            20px
            60px;

          text-align: center;

          background: white;

          border-bottom:
            1px solid
            #edf1f7;
        }


        .payment-list {
          display: flex;

          justify-content: center;

          align-items: center;

          flex-wrap: wrap;

          gap: 22px;

          max-width: 800px;

          margin: 0 auto;
        }


        .payment-item {
          min-width: 150px;

          padding:
            15px
            20px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          color: #64748b;

          font-size: 19px;

          font-weight: 900;

          border-radius: 15px;

          background:
            #f8fafc;

          border:
            1px solid
            #eef2f7;

          transition:
            transform .25s ease;
        }


        .payment-item:hover {
          transform:
            translateY(-5px);
        }


        .payment-symbol {
          width: 31px;
          height: 31px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          font-weight: 950;
        }


        .bkash {
          color: #2563eb;
          background: #dbeafe;
        }

        .nagad {
          color: #f59e0b;
          background: #fef3c7;
        }

        .rocket {
          color: #7c3aed;
          background: #ede9fe;
        }

        .upay {
          color: #059669;
          background: #d1fae5;
        }


        /* =====================================================
           SERVICES
        ===================================================== */

        .premium-section {
          padding:
            100px
            5%;

          background:
            linear-gradient(
              180deg,
              #f7f9fc,
              #f3f6fb
            );
        }


        .section-heading {
          max-width: 760px;

          margin:
            0
            auto
            50px;

          text-align: center;
        }


        .section-heading h2 {
          margin: 0;

          color: #0f172a;

          font-size: 44px;

          line-height: 1.15;

          font-weight: 900;

          letter-spacing: -1.3px;
        }


        .section-heading h2 span {
          color: #8b4de8;
        }


        .section-heading > p:last-child {
          margin:
            16px
            auto
            0;

          color: #64748b;

          font-size: 16px;

          line-height: 1.75;
        }


        .premium-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 25px;
        }


        .premium-card {
          position: relative;

          overflow: hidden;

          min-height: 275px;

          padding: 35px 30px;

          background: white;

          border:
            1px solid
            #edf1f7;

          border-radius: 24px;

          box-shadow:
            0 9px 28px
            rgba(15,23,42,.055);

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }


        .premium-card::before {
          content: "";

          position: absolute;

          width: 120px;
          height: 120px;

          top: -70px;
          right: -55px;

          border-radius: 50%;

          background:
            rgba(99,102,241,.09);

          transition:
            transform .4s ease;
        }


        .premium-card:hover::before {
          transform:
            scale(2);
        }


        .premium-card:hover {
          transform:
            translateY(-9px);

          box-shadow:
            0 22px 45px
            rgba(15,23,42,.11);
        }


        .premium-icon {
          width: 62px;
          height: 62px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 18px;

          margin-bottom: 25px;

          font-size: 30px;

          font-weight: 950;
        }


        .gmail-icon {
          color: #4f46e5;
          background: #e2e8ff;
        }


        .social-icon {
          color: #ec4899;
          background: #ffe3f2;
        }


        .referral-icon {
          color: #059669;
          background: #dcfce7;
        }


        .premium-card h3 {
          margin:
            0
            0
            13px;

          color: #111827;

          font-size: 22px;

          font-weight: 950;
        }


        .premium-card p {
          margin: 0;

          color: #64748b;

          font-size: 15px;

          line-height: 1.75;
        }


        .card-arrow {
          position: absolute;

          right: 27px;
          bottom: 24px;

          color: #6366f1;

          font-size: 25px;

          font-weight: 900;

          transition:
            transform .25s ease;
        }


        .premium-card:hover .card-arrow {
          transform:
            translateX(6px);
        }


        /* =====================================================
           RELIABLE
        ===================================================== */

        .reliable-section {
          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 70px;

          align-items: center;

          padding:
            110px
            5%;

          background: white;
        }


        .reliable-copy {
          max-width: 610px;
          margin-left: auto;
        }


        .reliable-copy h2 {
          margin: 0;

          color: #0f172a;

          font-size: 43px;

          line-height: 1.13;

          font-weight: 950;
        }


        .reliable-copy h2 span {
          color: #8b4de8;
        }


        .reliable-text {
          margin:
            20px
            0
            30px;

          color: #64748b;

          font-size: 16px;

          line-height: 1.8;
        }


        .feature-grid {
          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 17px;
        }


        .feature-card {
          display: flex;

          align-items: flex-start;

          gap: 13px;

          padding: 18px;

          background: white;

          border:
            1px solid
            #edf0f5;

          border-radius: 18px;

          box-shadow:
            0 7px 20px
            rgba(15,23,42,.045);

          transition:
            transform .25s ease;
        }


        .feature-card:hover {
          transform:
            translateY(-5px);
        }


        .feature-icon {
          flex:
            0
            0
            48px;

          width: 48px;
          height: 48px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 14px;

          font-size: 21px;

          font-weight: 950;
        }


        .feature-icon.yellow {
          color: #f59e0b;
          background: #fff1bf;
        }

        .feature-icon.green {
          color: #10b981;
          background: #d1fae5;
        }

        .feature-icon.blue {
          color: #0ea5e9;
          background: #dbeafe;
        }

        .feature-icon.pink {
          color: #f43f5e;
          background: #ffe4e6;
        }


        .feature-card h4 {
          margin:
            2px
            0
            5px;

          color: #172554;

          font-size: 15px;

          font-weight: 900;
        }


        .feature-card p {
          margin: 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.5;
        }


        /* =====================================================
           PLATFORM VISUAL
        ===================================================== */

        .platform-visual {
          position: relative;

          max-width: 570px;

          margin-right: auto;

          padding: 30px;
        }


        .visual-window {
          position: relative;

          min-height: 420px;

          padding: 17px;

          overflow: hidden;

          border-radius: 28px;

          background:
            linear-gradient(
              145deg,
              #f8fbff,
              #eef3ff
            );

          border:
            1px solid
            #dbe4f3;

          box-shadow:
            0 30px 65px
            rgba(30,64,175,.13);
        }


        .visual-top {
          display: flex;

          gap: 7px;

          padding:
            2px
            0
            17px;
        }


        .visual-top span {
          width: 9px;
          height: 9px;

          border-radius: 50%;

          background: #cbd5e1;
        }


        .visual-top span:first-child {
          background: #93c5fd;
        }


        .visual-main {
          display: grid;

          grid-template-columns:
            78px
            1fr;

          gap: 17px;

          height: 345px;
        }


        .visual-sidebar {
          display: flex;

          flex-direction: column;

          gap: 15px;

          padding: 18px 12px;

          border-radius: 17px;

          background:
            linear-gradient(
              180deg,
              #dbeafe,
              #eef2ff
            );
        }


        .visual-sidebar i {
          height: 34px;

          border-radius: 10px;

          background:
            rgba(255,255,255,.8);
        }


        .visual-sidebar i:first-child {
          background: #818cf8;
        }


        .visual-content {
          padding: 22px;

          border-radius: 19px;

          background: white;

          box-shadow:
            inset
            0 0
            0 1px
            #eef2f7;
        }


        .visual-header {
          display: flex;

          justify-content: space-between;

          gap: 20px;
        }


        .visual-header div {
          height: 13px;

          border-radius: 10px;

          background: #c7d2fe;
        }


        .visual-header div:first-child {
          width: 55%;
        }


        .visual-header div:last-child {
          width: 20%;
          background: #dbeafe;
        }


        .visual-cards {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 10px;

          margin:
            28px
            0;
        }


        .visual-cards div {
          height: 78px;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #ede9fe
            );

          animation:
            visualPulse
            3s
            ease-in-out
            infinite;
        }


        .visual-cards div:nth-child(2) {
          animation-delay: .4s;
        }


        .visual-cards div:nth-child(3) {
          animation-delay: .8s;
        }


        @keyframes visualPulse {

          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }

        }


        .visual-chart {
          height: 135px;

          display: flex;

          align-items: flex-end;

          gap: 11px;

          padding: 18px;

          border-radius: 16px;

          background: #f8fafc;
        }


        .visual-chart b {
          display: block;

          width: 16%;

          border-radius:
            7px
            7px
            3px
            3px;

          background:
            linear-gradient(
              #818cf8,
              #4f46e5
            );

          animation:
            chartGrow
            2.5s
            ease-in-out
            infinite alternate;
        }


        .visual-chart b:nth-child(1) {
          height: 35%;
        }

        .visual-chart b:nth-child(2) {
          height: 60%;
          animation-delay: .2s;
        }

        .visual-chart b:nth-child(3) {
          height: 48%;
          animation-delay: .4s;
        }

        .visual-chart b:nth-child(4) {
          height: 82%;
          animation-delay: .6s;
        }

        .visual-chart b:nth-child(5) {
          height: 68%;
          animation-delay: .8s;
        }

        .visual-chart b:nth-child(6) {
          height: 91%;
          animation-delay: 1s;
        }


        @keyframes chartGrow {

          from {
            opacity: .65;
          }

          to {
            opacity: 1;
          }

        }


        .trusted-badge {
          position: absolute;

          left: 0;
          bottom: 0;

          display: flex;

          align-items: center;

          gap: 13px;

          padding:
            14px
            20px;

          border-radius: 20px;

          background: white;

          box-shadow:
            0 20px 40px
            rgba(15,23,42,.15);

          animation:
            badgeFloat
            4s
            ease-in-out
            infinite;
        }


        @keyframes badgeFloat {

          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }

        }


        .trusted-icon {
          width: 45px;
          height: 45px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: white;

          font-size: 21px;
          font-weight: 950;

          background:
            linear-gradient(
              135deg,
              #10b981,
              #059669
            );
        }


        .trusted-badge strong,
        .trusted-badge span {
          display: block;
        }


        .trusted-badge strong {
          color: #334155;
          font-size: 14px;
        }


        .trusted-badge span {
          margin-top: 3px;

          color: #64748b;

          font-size: 12px;
        }


        .visual-orbit {
          position: absolute;

          border:
            1px dashed
            rgba(99,102,241,.25);

          border-radius: 50%;

          pointer-events: none;

          animation:
            orbitSpin
            20s
            linear
            infinite;
        }


        .orbit-one {
          width: 420px;
          height: 220px;

          top: 75px;
          left: 70px;
        }


        .orbit-two {
          width: 350px;
          height: 170px;

          top: 105px;
          left: 105px;

          animation-direction: reverse;
          animation-duration: 14s;
        }


        @keyframes orbitSpin {

          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }

        }


        /* =====================================================
           PROCESS
        ===================================================== */

        .process-section {
          padding:
            105px
            5%;

          background:
            #f7f9fc;
        }


        .process-grid {
          max-width: 1120px;

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            repeat(7, 1fr);

          align-items: center;
        }


        .process-step {
          grid-column: span 1;

          text-align: center;

          transition:
            transform .25s ease;
        }


        .process-step:hover {
          transform:
            translateY(-6px);
        }


        .process-line {
          height: 2px;

          background:
            linear-gradient(
              90deg,
              #c7d2fe,
              #a5b4fc
            );
        }


        .step-number {
          width: 55px;
          height: 55px;

          margin:
            0
            auto
            17px;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            2px solid
            #635bff;

          border-radius: 50%;

          color: #4f46e5;

          background: white;

          font-size: 20px;

          font-weight: 950;

          box-shadow:
            0 8px 20px
            rgba(79,70,229,.12);

          animation:
            numberPulse
            3s
            ease-in-out
            infinite;
        }


        @keyframes numberPulse {

          0%,
          100% {
            box-shadow:
              0 8px 20px
              rgba(79,70,229,.12);
          }

          50% {
            box-shadow:
              0 8px 28px
              rgba(79,70,229,.28);
          }

        }


        .process-step h3 {
          margin:
            0
            0
            8px;

          color: #0f172a;

          font-size: 20px;

          font-weight: 900;
        }


        .process-step p {
          margin: 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.65;
        }


        /* =====================================================
           TESTIMONIAL
        ===================================================== */

        .testimonial-section {
          padding:
            105px
            5%;

          background: white;
        }


        .testimonial-grid {
          max-width: 1150px;

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 24px;
        }


        .testimonial-card {
          padding: 30px;

          background:
            linear-gradient(
              145deg,
              #ffffff,
              #fafbff
            );

          border:
            1px solid
            #edf0f5;

          border-radius: 23px;

          box-shadow:
            0 10px 28px
            rgba(15,23,42,.06);

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }


        .testimonial-card:hover {
          transform:
            translateY(-8px);

          box-shadow:
            0 22px 45px
            rgba(15,23,42,.11);
        }


        .stars {
          color: #fbbf24;

          letter-spacing: 2px;

          font-size: 20px;

          margin-bottom: 17px;
        }


        .testimonial-card > p {
          min-height: 110px;

          margin: 0;

          color: #64748b;

          font-size: 15px;

          line-height: 1.8;
        }


        .user-row {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-top: 22px;
        }


        .user-avatar {
          width: 48px;
          height: 48px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: #4f46e5;

          background:
            #e0e7ff;

          font-weight: 950;
        }


        .user-row b,
        .user-row span {
          display: block;
        }


        .user-row b {
          color: #172554;
          font-size: 14px;
        }


        .user-row span {
          margin-top: 3px;

          color: #64748b;

          font-size: 13px;
        }


        /* =====================================================
           FAQ
        ===================================================== */

        .faq-section {
          display: grid;

          grid-template-columns:
            .85fr
            1.15fr;

          gap: 70px;

          align-items: center;

          padding:
            100px
            5%;

          background:
            #f7f9fc;
        }


        .faq-intro {
          max-width: 500px;

          margin-left: auto;
        }


        .faq-intro h2 {
          margin: 0;

          color: #0f172a;

          font-size: 42px;

          line-height: 1.15;

          font-weight: 950;
        }


        .faq-intro h2 span {
          color: #8b4de8;
        }


        .faq-intro > p:not(.section-kicker) {
          margin:
            20px
            0
            27px;

          color: #64748b;

          font-size: 15px;

          line-height: 1.8;
        }


        .support-button {
          display: inline-flex;

          padding:
            13px
            25px;

          border-radius: 999px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #2563eb
            );

          text-decoration: none;

          font-weight: 900;

          box-shadow:
            0 10px 24px
            rgba(37,99,235,.2);

          transition:
            transform .25s ease;
        }


        .support-button:hover {
          transform:
            translateY(-3px);
        }


        .faq-list {
          max-width: 650px;

          width: 100%;

          margin-right: auto;
        }


        .faq-item {
          overflow: hidden;

          margin-bottom: 15px;

          border:
            1px solid
            #edf0f5;

          border-radius: 18px;

          background: white;

          box-shadow:
            0 8px 22px
            rgba(15,23,42,.055);

          transition:
            box-shadow .25s ease;
        }


        .faq-item.active {
          box-shadow:
            0 14px 32px
            rgba(79,70,229,.1);
        }


        .faq-item button {
          width: 100%;

          border: 0;

          padding:
            20px
            22px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          text-align: left;

          cursor: pointer;

          color: #172554;

          background: white;

          font-size: 15px;

          font-weight: 850;
        }


        .faq-item.active button {
          color: #4f46e5;

          background:
            #e9edff;
        }


        .faq-item button b {
          min-width: 27px;

          font-size: 23px;

          text-align: center;
        }


        .faq-answer {
          padding:
            0
            22px
            22px;

          color: #64748b;

          font-size: 14px;

          line-height: 1.8;

          background:
            #e9edff;

          animation:
            answerOpen
            .25s
            ease;
        }


        @keyframes answerOpen {

          from {
            opacity: 0;
            transform:
              translateY(-6px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }

        }


        /* =====================================================
           CTA
        ===================================================== */

        .cta-section {
          padding:
            30px
            3%
            85px;

          background: white;
        }


        .cta-box {
          position: relative;

          max-width: 1120px;

          margin: 0 auto;

          overflow: hidden;

          padding:
            80px
            25px;

          text-align: center;

          color: white;

          border-radius: 30px;

          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(99,102,241,.35),
              transparent 35%
            ),
            radial-gradient(
              circle at 85% 75%,
              rgba(236,72,153,.22),
              transparent 35%
            ),
            linear-gradient(
              120deg,
              #18245a,
              #111827
            );

          box-shadow:
            0 25px 65px
            rgba(15,23,42,.18);
        }


        .cta-box::before {
          content: "";

          position: absolute;

          width: 240px;
          height: 240px;

          top: -150px;
          left: -100px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.15);

          animation:
            ctaOrbit
            8s
            linear
            infinite;
        }


        @keyframes ctaOrbit {

          from {
            transform:
              rotate(0deg)
              scale(1);
          }

          to {
            transform:
              rotate(360deg)
              scale(1.15);
          }

        }


        .cta-stars {
          position: absolute;
          inset: 0;

          pointer-events: none;
        }


        .cta-stars span {
          position: absolute;

          width: 4px;
          height: 4px;

          border-radius: 50%;

          background: white;

          opacity: .65;

          animation:
            ctaStar
            3s
            ease-in-out
            infinite;
        }


        .cta-stars span:nth-child(1) {
          top: 25%;
          left: 20%;
        }


        .cta-stars span:nth-child(2) {
          top: 35%;
          right: 18%;

          animation-delay: 1s;
        }


        .cta-stars span:nth-child(3) {
          bottom: 22%;
          left: 72%;

          animation-delay: 1.7s;
        }


        @keyframes ctaStar {

          0%,
          100% {
            transform:
              scale(.5);

            opacity: .3;
          }

          50% {
            transform:
              scale(1.7);

            opacity: 1;
          }

        }


        .cta-box .section-kicker {
          position: relative;

          color: #a5b4fc;
        }


        .cta-box h2 {
          position: relative;

          margin: 0;

          font-size: 46px;

          font-weight: 950;
        }


        .cta-box > p:not(.section-kicker) {
          position: relative;

          max-width: 650px;

          margin:
            18px
            auto
            30px;

          color: #cbd5e1;

          font-size: 16px;

          line-height: 1.75;
        }


        .cta-button {
          position: relative;

          display: inline-flex;

          align-items: center;

          gap: 12px;

          padding:
            16px
            33px;

          border-radius: 999px;

          color: #2563eb;

          background: white;

          text-decoration: none;

          font-size: 17px;

          font-weight: 950;

          box-shadow:
            0 12px 30px
            rgba(0,0,0,.2);

          transition:
            transform .25s ease;
        }


        .cta-button:hover {
          transform:
            translateY(-4px)
            scale(1.02);
        }


        .cta-button span {
          font-size: 22px;

          transition:
            transform .2s ease;
        }


        .cta-button:hover span {
          transform:
            translateX(4px);
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .home-footer {
          padding:
            60px
            5%
            22px;

          background: white;

          border-top:
            1px solid
            #edf1f7;
        }


        .footer-inner {
          max-width: 1180px;

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            1fr
            1.5fr
            .8fr;

          gap: 50px;

          align-items: center;
        }


        .footer-brand {
          display: flex;

          align-items: center;

          gap: 13px;
        }


        .footer-logo {
          width: 53px;
          height: 53px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 15px;

          font-size: 27px;

          background:
            linear-gradient(
              135deg,
              #5930e8,
              #2d5bea
            );
        }


        .footer-brand h3 {
          margin: 0;

          color: #172554;

          font-size: 22px;

          font-weight: 950;
        }


        .footer-brand p {
          margin: 4px 0 0;

          color: #64748b;

          font-size: 13px;
        }


        .footer-description p {
          margin: 0;

          max-width: 460px;

          color: #64748b;

          font-size: 14px;

          line-height: 1.7;
        }


        .footer-links {
          display: flex;

          flex-direction: column;

          gap: 10px;
        }


        .footer-links a {
          color: #64748b;

          text-decoration: none;

          font-size: 14px;

          font-weight: 700;

          transition:
            color .2s ease,
            transform .2s ease;
        }


        .footer-links a:hover {
          color: #4f46e5;

          transform:
            translateX(4px);
        }


        .footer-bottom {
          max-width: 1180px;

          margin:
            45px
            auto
            0;

          padding-top: 22px;

          display: flex;

          justify-content: space-between;

          gap: 20px;

          border-top:
            1px solid
            #e5e7eb;

          color: #94a3b8;

          font-size: 12px;
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {

          .hero-title h1 {
            font-size: 47px;
          }

          .cards {
            max-width: 760px;
          }

          .service-card {
            width: 330px;
          }

          .premium-grid {
            grid-template-columns:
              1fr
              1fr;
          }

          .reliable-section {
            grid-template-columns:
              1fr;
          }

          .reliable-copy,
          .platform-visual {
            margin-left: auto;
            margin-right: auto;
          }

          .faq-section {
            grid-template-columns:
              1fr;
          }

          .faq-intro,
          .faq-list {
            margin-left: auto;
            margin-right: auto;
          }

          .process-grid {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 45px;
          }

          .process-line {
            display: none;
          }

          .testimonial-grid {
            grid-template-columns:
              1fr;
            max-width: 650px;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .navbar {
            height: 72px;
            padding:
              0
              15px;
          }

          .navbar-scrolled {
            height: 68px;
          }

          .brand-icon {
            width: 49px;
            height: 49px;

            border-radius: 13px;

            font-size: 25px;
          }

          .brand-name {
            font-size: 23px;
          }

          .brand-subtitle {
            font-size: 10px;
          }

          .menu-button {
            width: 49px;
            height: 49px;

            border-radius: 13px;
          }

          .menu-button span {
            width: 24px;
          }

          .menu-dropdown {
            top: 82px;
            right: 15px;
            width: 200px;
          }


          .hero {
            min-height: auto;

            padding:
              45px
              15px
              55px;
          }


      .earth-background img {
  position: absolute;
  width: 135%;
  height: auto;
  max-width: none;
  left: 50%;
  top: 30%;
  object-fit: contain;
  transform: translate(-50%, -50%);
  transform-origin: center;
}


          .hero-title h1 {
            font-size: 34px;

            letter-spacing:
              -1px;
          }


          .hero-subtitle {
            font-size: 18px;
          }


          .hero-description {
            font-size: 14px;
            padding: 0 10px;
          }


          .cards {
            flex-direction: column;

            gap: 22px;

            margin-top: 38px;
          }


          .service-card {
            width: min(92vw, 330px);

            min-height: 260px;

            padding: 25px;
          }


          .stats-grid {
            grid-template-columns:
              1fr
              1fr;

            gap: 12px;
          }


          .stat-card {
            padding:
              24px
              10px;
          }


          .stat-card strong {
            font-size: 31px;
          }


          .stat-card span {
            font-size: 10px;
          }


          .payment-section {
            padding:
              45px
              15px;
          }


          .payment-list {
            gap: 12px;
          }


          .payment-item {
            min-width: 130px;

            font-size: 16px;
          }


          .premium-section,
          .reliable-section,
          .process-section,
          .testimonial-section,
          .faq-section {
            padding:
              75px
              20px;
          }


          .section-heading {
            margin-bottom: 35px;
          }


          .section-heading h2,
          .reliable-copy h2,
          .faq-intro h2 {
            font-size: 32px;
          }


          .premium-grid {
            grid-template-columns:
              1fr;
          }


          .feature-grid {
            grid-template-columns:
              1fr;
          }


          .platform-visual {
            padding:
              20px
              0
              50px;
          }


          .visual-window {
            min-height: 330px;
          }


          .visual-main {
            height: 265px;

            grid-template-columns:
              55px
              1fr;
          }


          .visual-sidebar {
            padding:
              12px
              8px;
          }


          .visual-content {
            padding: 14px;
          }


          .visual-cards {
            margin:
              15px
              0;
          }


          .visual-cards div {
            height: 50px;
          }


          .visual-chart {
            height: 100px;
          }


          .trusted-badge {
            left: 0;

            padding:
              11px
              15px;
          }


          .trusted-icon {
            width: 38px;
            height: 38px;

            font-size: 18px;
          }


          .process-grid {
            grid-template-columns:
              1fr;

            gap: 32px;
          }


          .testimonial-card > p {
            min-height: auto;
          }


          .cta-section {
            padding:
              20px
              20px
              60px;
          }


          .cta-box {
            padding:
              60px
              18px;
          }


          .cta-box h2 {
            font-size: 34px;
          }


          .footer-inner {
            grid-template-columns:
              1fr;

            gap: 25px;
          }


          .footer-bottom {
            flex-direction:
              column;

            text-align: center;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 430px) {

          .hero-title h1 {
            font-size: 29px;
          }


          .hero-subtitle {
            font-size: 16px;
          }


          .service-card {
            width: 92vw;
          }


          .card-icon {
            width: 65px;
            height: 65px;

            font-size: 34px;
          }


          .service-card h2 {
            font-size: 27px;
          }


          .stats-grid {
            gap: 9px;
          }


          .stat-card strong {
            font-size: 27px;
          }


          .stat-card span {
            font-size: 9px;
          }


          .payment-list {
            display: grid;

            grid-template-columns:
              1fr
              1fr;
          }


          .payment-item {
            min-width: 0;
          }


          .menu-dropdown {
            top: 78px;
            right: 10px;
            width: 180px;
          }

        }


        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }

        }

      `}</style>

    </div>
  );
}

export default Home;