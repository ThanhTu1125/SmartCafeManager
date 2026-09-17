import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientMenu from "../pages/client-menu/client-menu";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Otp from "../pages/auth/Otp";
import NewPassword from "../pages/auth/NewPassword";
import Header from "../components/header";
import Body from "../components/body";
import Footer from "../components/footer";
import Profile from "../pages/profile/Profile";
import EditProfile from "../pages/profile/EditProfile";
import ChangePassword from "../pages/profile/ChangePassword";
import PaymentSuccess from "../pages/PaymentSuccess/paymentSuccess";
import NewsList from "../pages/news/NewsList";
import NewsDetail from "../pages/news/NewsDetail";
import AdminNewsList from "../pages/news/AdminNewsList";
import AdminNewsForm from "../pages/news/AdminNewsForm";
import AdminNewsDetail from "../pages/news/AdminNewsDetail";
import AdminItemList from "../pages/admin-items/AdminItemList";
import AdminItemForm from "../pages/admin-items/AdminItemForm";
import AdminEmployeeList from "../pages/admin-employees/AdminEmployeeList";
import AdminCustomerList from "../pages/admin-customers/AdminCustomerList";
import InvoiceManagement from "../pages/InvoiceManagement/InvoiceManagement";
import RevenueDashboard from "../pages/RevenueDashboard/RevenueDashboard";
import RequireRole from "../components/RequireRole";
import SaleManager from "../pages/sale-manager/saleManager";
import FeedbackManager from "../pages/feedback-manager/feedbackManager";
import StaffNewsManager from "../pages/staff-news/staffNews";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/new-password" element={<NewPassword />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route
          path="/home"
          element={
            <>
              <Header />
              <Body />
              <Footer />
            </>
          }
        />

        <Route path="/news" element={<NewsList />} />
        <Route path="/news/:id" element={<NewsDetail />} />

        <Route
          path="/admin/news"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminNewsList />
            </RequireRole>
          }
        />
        <Route
          path="/admin/news/new"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminNewsForm />
            </RequireRole>
          }
        />
        <Route
          path="/admin/news/:id/edit"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminNewsForm />
            </RequireRole>
          }
        />
        <Route
          path="/admin/news/:id"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminNewsDetail />
            </RequireRole>
          }
        />

        <Route
          path="/admin/items"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminItemList />
            </RequireRole>
          }
        />
        <Route
          path="/admin/items/new"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminItemForm />
            </RequireRole>
          }
        />
        <Route
          path="/admin/items/:id/edit"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminItemForm />
            </RequireRole>
          }
        />

        <Route
          path="/admin/employees"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminEmployeeList />
            </RequireRole>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <RequireRole roles={["ADMIN"]}>
              <AdminCustomerList />
            </RequireRole>
          }
        />

        <Route
          path="/admin/invoices"
          element={
            <RequireRole roles={["ADMIN", "STAFF"]}>
              <InvoiceManagement />
            </RequireRole>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <RequireRole roles={["ADMIN"]}>
              <RevenueDashboard />
            </RequireRole>
          }
        />

        <Route path="/menu" element={<ClientMenu />} />
        <Route path="/menu/table/:tableId" element={<ClientMenu />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route
          path="/sale-manager"
          element={
            <RequireRole roles={["ADMIN", "STAFF"]}>
              <SaleManager />
            </RequireRole>
          }
        />
        <Route
          path="/feedback-manager"
          element={
            <RequireRole roles={["ADMIN", "STAFF"]}>
              <FeedbackManager />
            </RequireRole>
          }
        />
        <Route
          path="/staff-news"
          element={
            <RequireRole roles={["STAFF", "ADMIN"]}>
              <StaffNewsManager />
            </RequireRole>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
