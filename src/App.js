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
import { UserAuthProvider } from './public/context/authContext/UserAuthContext';

// Toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FilterProvider } from './admin/context/product/FilterContext';
import { NewOrderProvider } from './admin/context/snackbar/NewOrderContext';

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
                <UserAuthProvider>
                  <FilterProvider>
                    <NewOrderProvider>               
                  <AppRoutes />
                    </NewOrderProvider>

                  </FilterProvider>
                  {/* Toast notifications */}
                  <ToastContainer position="top-center" autoClose={3000} />

                </UserAuthProvider>
              </AuthProvider>
            </PageTitleProvider>
          </ProductProvider>
        </MyContextProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
