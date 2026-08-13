import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      return alert(
        "Name, email and password are required"
      );
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);

      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      console.log("Register Data:", userData);

      const data = await registerUser(userData);

      console.log("Register Response:", data);

      if (!data.success) {
        alert(
          data.message ||
            "Registration Failed"
        );
        return;
      }

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      alert("Registration Successful");

      navigate("/dashboard");
    } catch (error) {
      console.log(
        "Registration Error:",
        error
      );

      console.log(
        "Response:",
        error.response
      );

      console.log(
        "Data:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Registration Failed"
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

        .register-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;

          display: flex;
          justify-content: center;
          align-items: center;

          padding: 30px 15px;

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

        .register-glow-one,
        .register-glow-two {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: glow 5s ease-in-out infinite;
        }

        .register-glow-one {
          width: 220px;
          height: 220px;

          background: rgba(79, 70, 229, 0.18);

          top: -70px;
          left: -70px;
        }

        .register-glow-two {
          width: 260px;
          height: 260px;

          background: rgba(147, 51, 234, 0.16);

          right: -90px;
          bottom: -90px;

          animation-delay: 2s;
        }

        .register-star {
          position: absolute;
          color: white;
          font-size: 8px;

          pointer-events: none;

          text-shadow:
            0 0 10px white;

          animation:
            starFall
            linear
            infinite;
        }

        .register-star-one {
          left: 20%;
          top: -20px;

          animation-duration: 7s;
          animation-delay: 1s;
        }

        .register-star-two {
          left: 76%;
          top: -50px;

          font-size: 6px;

          animation-duration: 9s;
          animation-delay: 3s;
        }

        .register-card {
          width: 430px;
          max-width: 100%;

          position: relative;
          z-index: 5;

          background:
            rgba(255, 255, 255, 0.95);

          padding: 30px;

          border-radius: 22px;

          box-shadow:
            0 25px 60px rgba(37, 49, 120, 0.18),
            0 5px 20px rgba(0, 0, 0, 0.08);

          backdrop-filter: blur(12px);

          animation:
            floatCard
            5s
            ease-in-out
            infinite;
        }

        .register-title {
          text-align: center;

          margin: 0 0 25px;

          font-size: 30px;
          font-weight: 800;

          color: #172554;
        }

        .register-title span {
          color: #6d28d9;
        }

        .register-input {
          width: 100%;

          padding: 14px 15px;

          margin-bottom: 15px;

          border:
            1px solid #dbe3f0;

          border-radius: 10px;

          background: #f8faff;

          color: #172033;

          font-size: 16px;

          outline: none;

          transition: 0.25s ease;
        }

        .register-input:focus {
          border-color: #4f46e5;

          background: #ffffff;

          box-shadow:
            0 0 0 4px
            rgba(79, 70, 229, 0.10);
        }

        .register-button {
          width: 100%;

          padding: 14px;

          margin-top: 5px;

          border: none;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          font-size: 16px;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 10px 25px
            rgba(37, 99, 235, 0.25);

          transition: 0.25s ease;
        }

        .register-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 14px 30px
            rgba(37, 99, 235, 0.35);
        }

        .register-button:disabled {
          opacity: 0.7;

          cursor: not-allowed;

          transform: none;
        }

        .register-login-text {
          text-align: center;

          margin-top: 20px;
          margin-bottom: 0;

          color: #64748b;

          font-size: 15px;
        }

        .register-login-text a {
          color: #2563eb;

          font-weight: 700;

          text-decoration: none;
        }

        .register-login-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 500px) {
          .register-page {
            padding: 20px 12px;
          }

          .register-card {
            padding: 25px;

            border-radius: 18px;
          }

          .register-title {
            font-size: 26px;
          }
        }
      `}</style>

      <div className="register-page">
        <div className="register-glow-one"></div>
        <div className="register-glow-two"></div>

        <div className="register-star register-star-one">
          ✦
        </div>

        <div className="register-star register-star-two">
          ✦
        </div>

        <form
          onSubmit={handleSubmit}
          className="register-card"
        >
          <h2 className="register-title">
            Create <span>Account</span>
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="register-input"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="register-input"
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="register-input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="register-input"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="register-input"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>

          <p className="register-login-text">
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;