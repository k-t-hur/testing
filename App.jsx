import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { HMR } from "@pwa/preset-react";
import { Provider as ReduxProvider } from "react-redux";
import store from "@utils/redux/store";
import { ParentRouterContext } from "@utils/ParentRouterContext";
import initializeApplication from "@utils/initialization";
import { trackGenericEvent } from "@utils/api/tracker";
import { PersistGate } from "redux-persist/integration/react";
import { NonIndexableHead } from "@heads/NonIndexable";
import { persistor } from "./utils/redux/store";

import ROUTES from "./routes";

import "./styles/global.less";

/**
 * Main application routing.
 *
 * This BrowserRouter is used to duplicate the paths that Django used to provide
 * and allows us to use a single SPA instead of multiple bundles. HashRouter is
 * used in the individual pages to maintain the existing routing structure.
 *
 * We pass the BrowserRouter's match object into our Page App components which use
 * HashRouter as the parentRouteMatch prop so we have access to the BrowserRouter's
 * match metadata.
 */
const App = () => {
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeApplication();

      // Finally allow application to render.
      setAppInitialized(true);

      // After user being on the buyflow for at least 30 seconds, trigger mixpanel tracking for GoodClick
      setTimeout(() => {
        trackGenericEvent("GoodClick");
      }, 30000);
    };
    init();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div />}>
        {appInitialized && (
          <Switch>
            {ROUTES.map((route) => (
              <Route
                key={`${route.path}`}
                path={route.path}
                exact={route.exact || false}
                render={({ history, match }) => (
                  <ReduxProvider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                      <ParentRouterContext.Provider
                        value={{
                          history,
                          match,
                        }}
                      >
                        <React.Fragment>
                          <NonIndexableHead />
                          <route.component />
                        </React.Fragment>
                      </ParentRouterContext.Provider>
                    </PersistGate>
                  </ReduxProvider>
                )}
              />
            ))}
          </Switch>
        )}
      </Suspense>
    </BrowserRouter>
  );
};

export default HMR(App, module);
