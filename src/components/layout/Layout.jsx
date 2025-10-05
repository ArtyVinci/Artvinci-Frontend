import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../hooks/useTheme';

const Layout = ({ children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className="flex flex-col min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode ? '#1a1816' : '#fafaf9',
        color: isDarkMode ? '#fafaf9' : '#2d2a27'
      }}
    >
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
