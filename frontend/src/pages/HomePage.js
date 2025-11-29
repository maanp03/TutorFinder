import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import './HomePage.css';
import Footer from "../components/Footer"; 
import CalculateIcon from '@mui/icons-material/Calculate';
import BiotechIcon from '@mui/icons-material/Biotech';
import BookIcon from '@mui/icons-material/Book';
import SearchIcon from "@mui/icons-material/Search";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ReviewsIcon from '@mui/icons-material/Reviews';
import LaptopIcon from '@mui/icons-material/Laptop';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from "@mui/icons-material/School";
import GradeIcon from '@mui/icons-material/Grade';
import { AuthContext } from '../context/AuthContext';

//HOME PAGE
const HomePage = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useContext(AuthContext);

  const [showSignup, setShowSignup] = useState(false);

  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('client');


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailTrim = loginEmail.trim().toLowerCase();
      let res;


      if (emailTrim === 'admin@exmail.com') {
        res = await axios.post('/admin/login', {
          email: emailTrim,
          password: loginPassword,
        });
        const { token, role, userId, name } = res.data;
        contextLogin(token, role || 'admin', userId || 'admin', name || 'Administrator');
        navigate('/admin');
      } else {
        res = await axios.post('/auth/login', {
          email: emailTrim,
          password: loginPassword,
        });
        const { token, role, userId, name } = res.data;

        console.log('[Debug] Tutor/Client 로그인 응답 =>', token, role, userId, name);

        contextLogin(token, role, userId, name);

        if (role === 'tutor') {
          navigate('/tutor');
        } else {
          navigate('/client');
        }
      }
    } catch (err) {
      console.error('[Debug] 로그인 요청 실패:', err);
      if (err.response) {
        console.log('[Debug] err.response.data:', err.response.data);
        console.log('[Debug] err.response.status:', err.response.status);
      }
      alert('Login failed');
    }
  };


  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailTrim = signupEmail.trim().toLowerCase();
      const res = await axios.post('/auth/register', {
        name: signupName,
        email: emailTrim,
        password: signupPassword,
        role: signupRole,
      });

      const { token, role, userId, name } = res.data;
      const finalName = name || signupName;


      contextLogin(token, role, userId, finalName);

      if (role === 'tutor') {
        navigate('/tutor');
      } else {
        navigate('/client');
      }
    } catch (err) {
      console.error('[Debug] 회원가입 요청 실패:', err);
      if (err.response) {
        console.log('[Debug] err.response.data:', err.response.data);
        console.log('[Debug] err.response.status:', err.response.status);
      }
      alert('Signup failed');
    }
  };

  // LANDING PAGE 
  return (
    <>
    <div className="container">
      <div className="left"
      style={{
        marginLeft:"10px"
      }}>
        <div className="leftOverlay">
          <h1 className="tagline"
          style={{
            fontWeight:"700",
            paddingTop:"30px"
          }}>Empower Your Learning with TutorFinder </h1>
          <p className="description"
          style={{
            paddingBottom:"20px",
          }}>
            Find the right tutor for personalized 1-to-1 academic success.
          </p>

          <button type="submit" 
          className="button"
          style={{
            padding: "15px",
            borderRadius: "10px",
            width: "50%",
            fontWeight: "400",
            fontFamily: "Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            transition: "background-color 0.2s ease, transform 0.15s ease",
          }}
          
          >
          Get started
          
          </button>
        </div>

        <img 
  src="/images/tutorimage.jpg"
  alt="Tutor Finder Pic"
  className="image"
  style={{
    width: "100vw",    
    height: "auto",  
    display: "block",
    objectFit: "cover",   
    marginLeft: "calc(50% - 50vw)", 
    filter: "brightness(0.7)",   
  }}
/>
  </div>

  {/* RIGHT SIDE */}
      <div className="right">
        <div className="box">
          {!showSignup ? (
            <>
              <h2 className="boxTitle">Login</h2>
              <form onSubmit={handleLoginSubmit} className="form">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input"
                  required
                />
                <button type="submit" className="button">Login</button>
              </form>
              <p className="toggleText">Don't have an account?</p>
              <button
                onClick={() => setShowSignup(true)}
                className="toggleButton"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <h2 className="boxTitle">Sign Up</h2>
              <form onSubmit={handleSignupSubmit} className="form">
                <input
                  type="text"
                  placeholder="Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="input"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="input"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="input"
                  required
                />
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="input"
                >
                  <option value="tutor">Tutor</option>
                  <option value="client">Client</option>
                </select>
                <button type="submit" className="button">Sign Up</button>
              </form>
              <p className="toggleText">Already have an account?</p>
              <button
                onClick={() => setShowSignup(false)}
                className="toggleButton"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
</div>

{/* TESTIMONIALS */}
<div className="container-icons">

  {/* TUTORS */}
  <div className="icons">
     <SchoolIcon style={{ 
      fontSize: "34",
      marginBottom:"10px" 
      }} />
    <p className="i-heading">Expert Tutors</p>
    <p className="i-text">Experienced Tutors</p>
  </div>

  {/* SESSIONS */}
  <div className="icons">
     <LaptopIcon style={{ 
      fontSize: "34",
      marginBottom:"10px" 
      }} />
    <p className="i-heading">Online Sessions</p>
    <p className="i-text"> 1-to-1 tutoring</p>
  </div>

  {/* TESTIMONY */}
  <div className="icons">
     <PersonIcon style={{ 
      fontSize: "34",
      marginBottom:"10px" 
      }} />
    <p className="i-heading">50+ Students</p>
    <p className="i-text">Helping Improve grades</p>
  </div>

  {/* AVG RATING */}
  <div className="icons">
     <GradeIcon style={{ 
      fontSize: "34",
      marginBottom:"5px" 
      }} />
    <p className="i-heading">95% Average Rating </p>
    <p className="i-text">Steady Improvements </p>
  </div>

</div>

 {/* HERO SECTION WITH CTA  */}
<div className='hero-section'>
  <div className='left-vector'>
    <img 
    src="/images/vector-art.png"
    alt="Tutor Finder Pic"
    style={{
      marginLeft:"150px",
      width:"500px",
      height: "auto",
      maxWidth:"100%"
      
    }}
    />
   </div>

  {/* HERO DESCRIPTION  */}
   <div className='hero-description'>
    <h3> At TutorFinder we provide exceptional <br></br> services to our students </h3>
    <p style={{
      fontWeight: "300",
      fontSize :"14px",
      marginTop: "10px",
      marginBottom: "20px"
    }}> 
    We match students with tutors who fit their goals and schedule.<br></br>
    Get the support with you need with <b>TutorFinder  </b>to stay confident and on track. </p>

    <button type="submit" className="button"> Get Started Now </button>
   </div>
</div>

<div
  className="student-subjects"
  style={{
    marginTop:"-60px",
    textAlign: "center",
    padding: "40px 0"
  }}
>
  <h3>Subjects at TutorFinder</h3>

  <p
    style={{
      fontWeight: "300",
      fontSize: "14px",
      marginTop: "10px",
      marginBottom: "30px",
      maxWidth: "520px",
      marginLeft: "auto",
      marginRight: "auto",
      lineHeight: "20px"
    }}
  >
    Explore a range of subjects tailored to every learning need. 
    <br /> Here are a few examples to help you get started.
  </p>

  <div
    className="subjext-boxes"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
      gap: "25px",
      maxWidth: "900px",
      margin: "0 auto"
    }}
  >
    {/* SUBJECT ONE - MATH */}
    <div
      style={{
        backgroundColor: "#fff",
        padding: "30px 20px",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        textAlign: "center"
      }}
    >

      <div
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          backgroundColor: "#efc03fff",
          margin: "0 auto 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "600",
          color: "#fff"
        }}
      >
        <CalculateIcon 
    className="calculate-icon"
    style={{ 
      color: "white", 
      fontSize: "32px" }}
  />
      </div>

      <h4 style={{ 
        marginBottom: "8px" 
        }}>Math</h4>
      <p style={{ 
        fontSize: "13px", 
        color: "#555", 
        fontWeight: "300" 
        }}>
        Learn concepts with subject matter experts.
      </p>
    </div>

    {/* SUBJECT TWO - CHEM */}
    <div
      style={{
        backgroundColor: "#fff",
        padding: "30px 20px",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          backgroundColor: "#6f97e7ff",
          margin: "0 auto 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: "#fff"
        }}
      >
      <BiotechIcon 
    className="biotech-icon"
    style={{ color: "white", fontSize: "36px" }}
  />
      </div>

      <h4 style={{ marginBottom: "8px" }}>Chemistry</h4>
      <p style={{ fontSize: "13px", color: "#555", fontWeight: "300" }}>
        Comprehend complex topics with simplified explanations.
      </p>
    </div>

    {/* SUBJECT THREE - ENGLISH */}
    <div
      style={{
        backgroundColor: "#fff",
        padding: "30px 20px",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          backgroundColor: "#d854dcff",
          margin: "0 auto 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: "#fff"
        }}
      >
      <BookIcon 
    className="book-icon"
    style={{ 
      color: "white", 
      fontSize: "32px" 
    }}
  />
      </div>

      <h4 style={{ 
        marginBottom: "8px" 
        }}>English</h4>
      <p style={{ 
        fontSize: "13px", 
        color: "#555", 
        fontWeight: "300" }}>
        Improve writing, reading, and comprehension.
      </p>
    </div>
  </div>
</div>

  {/* TUTORFINDER PROCESS  */}
<div
  className="process-tutor"
  style={{
    marginTop: "25px",
    textAlign: "center",
    padding: "40px 0",
  }}
>
  <h3>How to Match with a Tutor</h3>

  <p
    style={{
      fontWeight: "300",
      fontSize: "14px",
      marginTop: "10px",
      marginBottom: "30px",
      maxWidth: "520px",
      marginLeft: "auto",
      marginRight: "auto",
      lineHeight: "20px",
    }}
  >
    Explore different subjects for every learning curve.
    <i> <b> Find  </b></i> a tutor with us and start improving your skills <b> today </b> with TutorFinder.
  </p>

  {/* HOW TO USE TUTORFINDER */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "60px",
      maxWidth: "1100px",
      margin: "0 auto",
      marginTop: "20px",
    }}
  >
      {/* HOW TO USE TUTORFINDER - STEP 1 */}
    <div style={{ flex: 1, textAlign: "left" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 22px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#8ce172ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "18px",
            color: "#fff",
          }}
        >
          <SearchIcon style={{ fontSize: 28 }} />
        </div>
        <div>
          <h4
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Choose Subjects
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 300,
              color: "#4b5563",
            }}
          >
            Browse our list of tutors by subject and availability.
          </p>
        </div>
      </div>


      {/* HOW TO USE TUTORFINDER - STEP 2 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 22px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#f15757ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "18px",
            color: "#fff",
          }}
        >
          <AssignmentTurnedInIcon style={{ fontSize: 28 }} />
        </div>
        <div>
          <h4
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Share Your Learning Needs
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 300,
              color: "#4b5563",
            }}
          >
            Input your schedule and goals.
          </p>
        </div>
      </div>

      {/* HOW TO USE TUTORFINDER - STEP 3 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 22px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#9ca3af",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "18px",
            color: "#fff",
          }}
        >
          <ReviewsIcon style={{ fontSize: 28 }} />
        </div>
        <div>
          <h4
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Review Your Matches
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 300,
              color: "#4b5563",
            }}
          >
            Compare tutors then choose.
          </p>
        </div>
      </div>

      {/* HOW TO USE TUTORFINDER - STEP 4 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 22px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#4371d5ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "18px",
            color: "#fff",
          }}
        >
          <SchoolIcon style={{ fontSize: 28 }} />
        </div>
        <div>
          <h4
            style={{
              margin: 0,
              marginBottom: "4px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Book Sessions with Us
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 300,
              color: "#4b5563",
            }}
          >
            Schedule your first session and improve grades.
          </p>
        </div>
      </div>
    </div>

    {/* IMAGE ON THE RIGHT */}
    <div style={{ flex: 1, textAlign: "center" }}>
      <img
        src="/images/teacher-art.png"
        alt="Tutor"
        style={{ width: "90%", maxWidth: "480px" }}
      />

    </div>

  </div>
</div>

    <div className='button-cta'
    style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",  
    marginTop: "10px"
    }}>
         <button type="submit" className="button"> Get Started Now </button>

    </div>


<Footer/>

</>
  );
};

export default HomePage;