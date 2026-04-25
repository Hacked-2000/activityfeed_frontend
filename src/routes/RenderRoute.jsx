import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-fox-toast";
import Loader from "../utils/Loader";
import ErrorBoundary from "../layout/ErrorBoundary";
import Layout from "../layout/index";

const FeedPage = lazy(() => import("../pages/FeedPage"));
const PostActivityPage = lazy(() => import("../pages/PostActivityPage"));
const AnswersPage = lazy(() => import("../pages/AnswersPage"));

function RenderRoute() {
  return (
    <>
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <ErrorBoundary>
        <Suspense fallback={<Loader fullPage />}>
          <Routes>
            <Route path="/" element={<Layout><FeedPage /></Layout>} />
            <Route path="/post" element={<Layout><PostActivityPage /></Layout>} />
            <Route path="/answers" element={<Layout><AnswersPage /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default RenderRoute;
