import { Component, ErrorInfo, ReactNode } from "react";

type RouteErrorBoundaryProps = { children: ReactNode };
type RouteErrorBoundaryState = { error: Error | null };

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("FoodOnlines route failed to render", error, errorInfo);
    }
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <section className="mx-auto min-h-[55vh] max-w-3xl px-4 pb-20 pt-40 text-center sm:px-6 sm:pt-44">
        <h1 className="text-3xl font-black text-neutral-950">This page could not finish loading.</h1>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          Your browser may have an older site file cached. Reload to fetch the current production version.
        </p>
        <button
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-leaf-600 px-6 font-bold text-white transition hover:bg-leaf-700"
          onClick={this.reload}
          type="button"
        >
          Reload page
        </button>
      </section>
    );
  }
}
