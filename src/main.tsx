import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '@/App';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DedicatedDeliveryPage } from '@/components/admin/DedicatedDeliveryPage';
import { ChatPage } from '@/components/admin/ChatPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#F5F7FB]">
      <p className="text-gray-400 text-lg font-sans">{title} — Coming soon</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Campaign Builder (original app) */}
          <Route path="/" element={<App />} />

          {/* Admin Portal — expanded sidebar with labels */}
          <Route path="/admin" element={<AdminLayout variant="admin" />}>
            <Route index element={<Navigate to="chat" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="dedicated-delivery" element={<DedicatedDeliveryPage />} />
            <Route path="routes" element={<PlaceholderPage title="Routes" />} />
            <Route path="schedule" element={<PlaceholderPage title="Schedule" />} />
            <Route path="matching" element={<PlaceholderPage title="Matching" />} />
            <Route path="projects" element={<PlaceholderPage title="Projects" />} />
            <Route path="quotations" element={<PlaceholderPage title="Quotations" />} />
            <Route path="acquisition" element={<PlaceholderPage title="Acquisition" />} />
            <Route path="affiliations" element={<PlaceholderPage title="Affiliations" />} />
            <Route path="customers" element={<PlaceholderPage title="Customers" />} />
            <Route path="accounting" element={<PlaceholderPage title="Accounting" />} />
            <Route path="update-password" element={<PlaceholderPage title="Update Password" />} />
            <Route path="faqs" element={<PlaceholderPage title="FAQs" />} />
            <Route path="profile" element={<PlaceholderPage title="Personal Profile" />} />
          </Route>

          {/* Customer Portal — expanded sidebar with labels */}
          <Route path="/customer" element={<AdminLayout variant="customer" />}>
            <Route index element={<Navigate to="dedicated-delivery" replace />} />
            <Route path="dedicated-delivery" element={<DedicatedDeliveryPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="request-delivery" element={<PlaceholderPage title="Request Delivery" />} />
            <Route path="previous-delivery" element={<PlaceholderPage title="Previous Delivery" />} />
            <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="saved-address" element={<PlaceholderPage title="Saved Address" />} />
            <Route path="wallet" element={<PlaceholderPage title="Wallet" />} />
            <Route path="invoice" element={<PlaceholderPage title="Invoice" />} />
            <Route path="branch-details" element={<PlaceholderPage title="Branch Details" />} />
            <Route path="refer-contact" element={<PlaceholderPage title="Refer Contact" />} />
            <Route path="admin" element={<PlaceholderPage title="Admin" />} />
            <Route path="faqs" element={<PlaceholderPage title="FAQs" />} />
            <Route path="profile" element={<PlaceholderPage title="Personal Profile" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
