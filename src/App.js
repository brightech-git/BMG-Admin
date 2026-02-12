import './App.css';
import AppRoutes from './routes/appRoutes/appRoutes';

// React Query setup for data fetching and caching
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

// Global state/context providers for app-wide data
import { ProductProvider } from './admin/context/product/productContext';
import { MyContextProvider } from './admin/context/themeContext/themeContext';
import { PageTitleProvider } from './admin/context/pageTitle/PageTitleContext';
import { AuthProvider } from './admin/context/auth/authContext';

// Toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FilterProvider } from './admin/context/product/FilterContext';
import { NewOrderProvider } from './admin/context/snackbar/NewOrderContext';
import Snackbar from './admin/components/snackBar/Snackbar';

function App() {
  const queryClient = new QueryClient(); // Initializes React Query client

  //localStorage.clear(); // ⚠️ Debugging tool (commented out)

  return (
    <div className="App">
      {/* React Query Provider */}
      <QueryClientProvider client={queryClient}>
        {/* Theme / UI Context */}
        <MyContextProvider>
          {/* Product-related state */}
          <ProductProvider>
            {/* Page title context */}
            <PageTitleProvider>
              {/* Admin authentication context */}
              <AuthProvider>
                {/* Public user authentication context */}
           
                  <FilterProvider>
                    <NewOrderProvider>    
                        <Snackbar />           
                        <AppRoutes />
                    </NewOrderProvider>

                  </FilterProvider>
                  {/* Toast notifications */}
                  <ToastContainer position="top-center" autoClose={3000} />

       
              </AuthProvider>
            </PageTitleProvider>
          </ProductProvider>
        </MyContextProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
