import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }

  interface Future {
    unstable_middleware: false
  }
}

type Params = {
  "/": {};
  "/account/logout": {};
  "/account/signin": {};
  "/account/signup": {};
  "/admin": {};
  "/admin-setup": {};
  "/dashboard": {};
  "/import": {};
  "/prueba": {};
  "/reports": {};
  "/vehicles/:vin": {
    "vin": string;
  };
  "/*?": {};
};