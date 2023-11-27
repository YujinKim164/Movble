import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MapPage from "./Page/MapPage";
import HomePage from "./Page/HomePage";
import ScrollToTop from "./ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext.js";
import { theme } from "./Style/theme";
import AppLoginPage from "./Components/App/App_Login_Components/AppLoigin";
import RoutePage from "./Page/RoutePage";
import AppOpenAI from "./Components/App/App_AI_Components/OpenAI.js";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* 기본 화면 설정 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/Map" element={<MapPage />} />
          <Route path="/Route" element={<RoutePage />} />
          <Route path="/Login" element={<AppLoginPage />} />
          <Route path="/AppOpenAI" element={<AppOpenAI />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
