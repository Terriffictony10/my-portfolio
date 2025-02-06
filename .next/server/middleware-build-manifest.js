self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/Dashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/Dashboard.js"
    ],
    "/EmployeeDashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/EmployeeDashboard.js"
    ],
    "/POSterminal": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/POSterminal.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/mainJobDashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/mainJobDashboard.js"
    ],
    "/mainRestaurantDashboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/mainRestaurantDashboard.js"
    ],
    "/micros": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/micros.js"
    ],
    "/pay": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/pay.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];