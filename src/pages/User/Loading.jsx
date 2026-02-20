import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  body: {
    margin: 0,
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#edd6fa",
    overflow: "hidden",
    position: "relative",
  },
  circle: {
    width: "150px",
    height: "150px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    animation: "zoomOut 1.5s ease-in-out forwards",
    boxShadow: "0 0 40px rgba(255, 255, 255, 0.4)",
  },
  loadingText: {
    position: "absolute",
    bottom: "100px",
    fontFamily: "'Jersey 15', sans-serif",
    fontSize: "1.8rem",
    color: "#ffffff",
    opacity: 0,
    animation: "fadeIn 1.5s ease-in forwards 0.5s",
  },
};

function Loading() {
  const navigate = useNavigate();
  const [key, setKey] = useState(0); 

  useEffect(() => {
    setKey(prev => prev + 1);

    const timer = setTimeout(() => {
      navigate("/Homepage"); 
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.body}>
      <div key={key} style={styles.circle}></div>
      <div style={styles.loadingText}>Loading...</div>

      <style>
        {`
          @keyframes zoomOut {
            0% { transform: scale(0.5); opacity: 1; }
            60% { transform: scale(15); opacity: 1; }
            100% { transform: scale(40); opacity: 0; }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default Loading;