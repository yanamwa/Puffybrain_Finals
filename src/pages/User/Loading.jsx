import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingState from "../../components/LoadingState.jsx";

function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Homepage"); 
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <LoadingState />
  );
}

export default Loading;
