import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Register from "./pages/Register.tsx";
// import ApplicationDetail from "./pages/ApplicationDetail.tsx";
import ApplicationForm from "./components/ApplicationForm.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/application/new",
    element: (
      <ProtectedRoute>
        <ApplicationForm />
      </ProtectedRoute>
    ),
  },
  // {
  //   path: "/application/:id",
  //   element: (
  //     <ProtectedRoute>
  //       <ApplicationDetail />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: "/application/:id/edit",
    element: (
      <ProtectedRoute>
        <ApplicationForm />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
