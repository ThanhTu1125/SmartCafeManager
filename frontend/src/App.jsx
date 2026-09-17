import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRouter from "./routes/AppRoutes";
import SocketRealtimeBridge from "./components/SocketRealtimeBridge";

function App() {
  return (
    <>
      <AppRouter />
      <SocketRealtimeBridge />
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        limit={4}
      />
    </>
  );
}

export default App;
