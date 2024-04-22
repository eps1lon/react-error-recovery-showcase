import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import * as ReactDOM from "react-dom";

const originalCreateElement = document.createElement.bind(document);

document.createElement = function createElementSpy(tagName, options) {
  console.log('createElement("%s")', tagName);

  return originalCreateElement(tagName, options);
};

const observer = new MutationObserver((mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      for (const addedNode of mutation.addedNodes) {
        console.log('added "%s" to the DOM', addedNode.tagName);
      }
    }
  }
});

// Start observing the target node for configured mutations
observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
});

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      console.log("ErrorBoundary caught");
      // We just need a unique tag to unique identify host instance creation from error boundaries
      return <article>did error</article>;
    }
    return this.props.children;
  }
}

function Thrower() {
  console.log("render Thrower");
  throw new Error("Boom");
}

function ThrowingApp() {
  return (
    <ErrorBoundary>
      <Thrower />
    </ErrorBoundary>
  );
}
const app = <ThrowingApp />;

document.getElementById("render-legacy-root").addEventListener("click", () => {
  const container = document.createElement("div");
  event.currentTarget.insertAdjacentElement("afterend", container);

  ReactDOM.render(app, container);
});

document
  .getElementById("render-sync-root")
  .addEventListener("click", (event) => {
    const container = document.createElement("div");
    event.currentTarget.insertAdjacentElement("afterend", container);

    const root = ReactDOMClient.createRoot(container);
    // default updates are sync in OSS (enableUnifiedSyncLane)
    root.render(app);
  });

document
  .getElementById("render-concurrent-root")
  .addEventListener("click", () => {
    const container = document.createElement("div");
    event.currentTarget.insertAdjacentElement("afterend", container);

    const root = ReactDOMClient.createRoot(container);
    React.startTransition(() => {
      root.render(app);
    });
  });
