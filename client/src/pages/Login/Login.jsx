import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await loginUser(formData);

      console.log("Login Response:", data);

      if (!data.success) {
        alert(data.message || "Login Failed");
        return;
      }

      // Save Token
      localStorage.setItem("token", data.token);

      // Save User
      if (data.user) {
        setUser(data.user);
      }

      alert("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      console.log("Login Error:", error);
      console.log("Response:", error.response);
      console.log("Data:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }

          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }

        @keyframes starFall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          85% {
            opacity: 1;
          }

          100% {
            transform: translateY(100vh) rotate(180deg);
            opacity: 0;
          }
        }

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;

          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(99, 102, 241, 0.35),
              transparent 30%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(168, 85, 247, 0.35),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #eef2ff,
              #e0e7ff,
              #f5f3ff,
              #dbeafe
            );

          background-size: 200% 200%;
          animation: gradientMove 12s ease infinite;
        }

        .glow-one,
        .glow-two {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
          animation: glow 5s ease-in-out infinite;
        }

        .glow-one {
          width: 220px;
          height: 220px;
          background: rgba(79, 70, 229, 0.18);
          top: -70px;
          left: -70px;
        }

        .glow-two {
          width: 260px;
          height: 260px;
          background: rgba(147, 51, 234, 0.16);
          right: -90px;
          bottom: -90px;
          animation-delay: 2s;
        }

        .star {
          position: absolute;
          color: white;
          font-size: 8px;
          pointer-events: none;
          animation: starFall linear infinite;
          text-shadow: 0 0 10px white;
        }

        .star-one {
          left: 18%;
          top: -20px;
          animation-duration: 7s;
          animation-delay: 1s;
        }

        .star-two {
          left: 73%;
          top: -50px;
          font-size: 6px;
          animation-duration: 9s;
          animation-delay: 3s;
        }

        .login-card {
          width: 420px;
          max-width: calc(100% - 30px);
          position: relative;
          z-index: 5;

          background: rgba(255, 255, 255, 0.94);
          padding: 35px;
          border-radius: 22px;

          box-shadow:
            0 25px 60px rgba(37, 49, 120, 0.18),
            0 5px 20px rgba(0, 0, 0, 0.08);

          backdrop-filter: blur(12px);

          animation: floatCard 5s ease-in-out infinite;
        }

        .login-title {
          text-align: center;
          margin: 0 0 28px;
          font-size: 30px;
          font-weight: 800;
          color: #172554;
        }

        .login-title span {
          color: #6d28d9;
        }

        .input-box {
          width: 100%;
          padding: 14px 15px;
          margin-bottom: 16px;

          border: 1px solid #dbe3f0;
          border-radius: 10px;

          background: #f8faff;
          color: #172033;

          font-size: 16px;
          outline: none;

          transition: 0.25s ease;
        }

        .input-box:focus {
          border-color: #4f46e5;
          background: #ffffff;

          box-shadow:
            0 0 0 4px rgba(79, 70, 229, 0.10);
        }

        .login-button {
          width: 100%;
          padding: 14px;

          margin-top: 3px;

          border: none;
          border-radius: 10px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );

          color: white;
          font-size: 16px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 10px 25px rgba(37, 99, 235, 0.25);

          transition: 0.25s ease;
        }

        .login-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 14px 30px rgba(37, 99, 235, 0.35);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-register-text {
          text-align: center;
          margin-top: 22px;
          margin-bottom: 0;

          color: #64748b;
          font-size: 15px;
        }

        .login-register-text a {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }

        .login-register-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 500px) {
          .login-card {
            padding: 25px;
            border-radius: 18px;
          }

          .login-title {
            font-size: 26px;
          }
        }
          /* =========================================
   LOGIN - MOBILE FIX
========================================= */

@media (max-width: 500px) {

  .login-page {
    width: 100%;
    min-height: 100vh;
    padding: 20px 12px;
    box-sizing: border-box;

    overflow-x: hidden;
    overflow-y: auto;
  }

  .login-card {
    width: 100%;
    max-width: 100%;
    min-width: 0;

    padding: 24px 18px;
    margin: 0 auto;

    border-radius: 18px;
    box-sizing: border-box;
  }

  .login-title {
    font-size: 26px;
    line-height: 1.2;
    margin-bottom: 24px;
  }

  .input-box {
    width: 100%;
    height: 50px;
    padding: 12px 14px;

    font-size: 15px;
    box-sizing: border-box;
  }

  .login-button {
    width: 100%;
    min-height: 50px;

    font-size: 15px;
  }

  .login-register-text {
    font-size: 13px;
    line-height: 1.5;
  }

  .glow-one {
    width: 150px;
    height: 150px;
    top: -50px;
    left: -50px;
  }

  .glow-two {
    width: 170px;
    height: 170px;
    right: -60px;
    bottom: -60px;
  }

  .star-one {
    left: 12%;
  }

  .star-two {
    left: 78%;
  }
}
      `}</style>

      <div className="login-page">
        <div className="glow-one"></div>
        <div className="glow-two"></div>

        <div className="star star-one">✦</div>
        <div className="star star-two">✦</div>

        <form
          onSubmit={handleSubmit}
          className="login-card"
        >
          <h2 className="login-title">
            Welcome <span>Back</span>
          </h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-box"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-box"
          />

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="login-register-text">
            Don't have an account?{" "}
            <Link to="/register">
              Register
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;