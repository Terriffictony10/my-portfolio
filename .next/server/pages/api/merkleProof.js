"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/merkleProof";
exports.ids = ["pages/api/merkleProof"];
exports.modules = {

/***/ "keccak256":
/*!****************************!*\
  !*** external "keccak256" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("keccak256");

/***/ }),

/***/ "merkletreejs":
/*!*******************************!*\
  !*** external "merkletreejs" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("merkletreejs");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ }),

/***/ "(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2FmerkleProof&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2FmerkleProof.js&middlewareConfigBase64=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2FmerkleProof&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2FmerkleProof.js&middlewareConfigBase64=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/pages-api/module.compiled */ \"(api)/./node_modules/next/dist/server/future/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(api)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _src_pages_api_merkleProof_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/pages/api/merkleProof.js */ \"(api)/./src/pages/api/merkleProof.js\");\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_merkleProof_js__WEBPACK_IMPORTED_MODULE_3__, \"default\"));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_merkleProof_js__WEBPACK_IMPORTED_MODULE_3__, \"config\");\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/merkleProof\",\n        pathname: \"/api/merkleProof\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\"\n    },\n    userland: _src_pages_api_merkleProof_js__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LXJvdXRlLWxvYWRlci9pbmRleC5qcz9raW5kPVBBR0VTX0FQSSZwYWdlPSUyRmFwaSUyRm1lcmtsZVByb29mJnByZWZlcnJlZFJlZ2lvbj0mYWJzb2x1dGVQYWdlUGF0aD0uJTJGc3JjJTJGcGFnZXMlMkZhcGklMkZtZXJrbGVQcm9vZi5qcyZtaWRkbGV3YXJlQ29uZmlnQmFzZTY0PWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDTDtBQUMxRDtBQUMyRDtBQUMzRDtBQUNBLGlFQUFlLHdFQUFLLENBQUMsMERBQVEsWUFBWSxFQUFDO0FBQzFDO0FBQ08sZUFBZSx3RUFBSyxDQUFDLDBEQUFRO0FBQ3BDO0FBQ08sd0JBQXdCLGdIQUFtQjtBQUNsRDtBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZQUFZO0FBQ1osQ0FBQzs7QUFFRCIsInNvdXJjZXMiOlsid2VicGFjazovL215LXBvcnRmb2xpby8/OWYxNSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYWdlc0FQSVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvcGFnZXMtYXBpL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IGhvaXN0IH0gZnJvbSBcIm5leHQvZGlzdC9idWlsZC90ZW1wbGF0ZXMvaGVscGVyc1wiO1xuLy8gSW1wb3J0IHRoZSB1c2VybGFuZCBjb2RlLlxuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi4vc3JjL3BhZ2VzL2FwaS9tZXJrbGVQcm9vZi5qc1wiO1xuLy8gUmUtZXhwb3J0IHRoZSBoYW5kbGVyIChzaG91bGQgYmUgdGhlIGRlZmF1bHQgZXhwb3J0KS5cbmV4cG9ydCBkZWZhdWx0IGhvaXN0KHVzZXJsYW5kLCBcImRlZmF1bHRcIik7XG4vLyBSZS1leHBvcnQgY29uZmlnLlxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IGhvaXN0KHVzZXJsYW5kLCBcImNvbmZpZ1wiKTtcbi8vIENyZWF0ZSBhbmQgZXhwb3J0IHRoZSByb3V0ZSBtb2R1bGUgdGhhdCB3aWxsIGJlIGNvbnN1bWVkLlxuZXhwb3J0IGNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IFBhZ2VzQVBJUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLlBBR0VTX0FQSSxcbiAgICAgICAgcGFnZTogXCIvYXBpL21lcmtsZVByb29mXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvbWVya2xlUHJvb2ZcIixcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBhcmVuJ3QgdXNlZCBpbiBwcm9kdWN0aW9uLlxuICAgICAgICBidW5kbGVQYXRoOiBcIlwiLFxuICAgICAgICBmaWxlbmFtZTogXCJcIlxuICAgIH0sXG4gICAgdXNlcmxhbmRcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYWdlcy1hcGkuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2FmerkleProof&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2FmerkleProof.js&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api)/./src/pages/api/merkleProof.js":
/*!**************************************!*\
  !*** ./src/pages/api/merkleProof.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var merkletreejs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! merkletreejs */ \"merkletreejs\");\n/* harmony import */ var merkletreejs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(merkletreejs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var keccak256__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! keccak256 */ \"keccak256\");\n/* harmony import */ var keccak256__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(keccak256__WEBPACK_IMPORTED_MODULE_1__);\n\n\nlet whitelist = [];\nlet merkleTree = null;\nlet merkleRoot = null;\nfunction updateMerkleTree() {\n    const leaves = whitelist.map((addr)=>keccak256__WEBPACK_IMPORTED_MODULE_1___default()(addr));\n    merkleTree = new merkletreejs__WEBPACK_IMPORTED_MODULE_0__.MerkleTree(leaves, (keccak256__WEBPACK_IMPORTED_MODULE_1___default()), {\n        sortPairs: true\n    });\n    merkleRoot = merkleTree.getHexRoot();\n}\nfunction handler(req, res) {\n    const { address } = req.query;\n    if (!address) {\n        return res.status(400).json({\n            error: \"Address is required\"\n        });\n    }\n    const lowerCaseAddress = address.toLowerCase();\n    if (!whitelist.includes(lowerCaseAddress)) {\n        whitelist.push(lowerCaseAddress);\n        updateMerkleTree();\n    }\n    const leaf = keccak256__WEBPACK_IMPORTED_MODULE_1___default()(lowerCaseAddress);\n    const proof = merkleTree.getHexProof(leaf);\n    res.status(200).json({\n        proof,\n        merkleRoot\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvcGFnZXMvYXBpL21lcmtsZVByb29mLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQTBDO0FBQ1I7QUFFbEMsSUFBSUUsWUFBWSxFQUFFO0FBQ2xCLElBQUlDLGFBQWE7QUFDakIsSUFBSUMsYUFBYTtBQUVqQixTQUFTQztJQUNQLE1BQU1DLFNBQVNKLFVBQVVLLEdBQUcsQ0FBQyxDQUFDQyxPQUFTUCxnREFBU0EsQ0FBQ087SUFDakRMLGFBQWEsSUFBSUgsb0RBQVVBLENBQUNNLFFBQVFMLGtEQUFTQSxFQUFFO1FBQUVRLFdBQVc7SUFBSztJQUNqRUwsYUFBYUQsV0FBV08sVUFBVTtBQUNwQztBQUVlLFNBQVNDLFFBQVFDLEdBQUcsRUFBRUMsR0FBRztJQUN0QyxNQUFNLEVBQUVDLE9BQU8sRUFBRSxHQUFHRixJQUFJRyxLQUFLO0lBQzdCLElBQUksQ0FBQ0QsU0FBUztRQUNaLE9BQU9ELElBQUlHLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFzQjtJQUM3RDtJQUNBLE1BQU1DLG1CQUFtQkwsUUFBUU0sV0FBVztJQUM1QyxJQUFJLENBQUNsQixVQUFVbUIsUUFBUSxDQUFDRixtQkFBbUI7UUFDekNqQixVQUFVb0IsSUFBSSxDQUFDSDtRQUNmZDtJQUNGO0lBQ0EsTUFBTWtCLE9BQU90QixnREFBU0EsQ0FBQ2tCO0lBQ3ZCLE1BQU1LLFFBQVFyQixXQUFXc0IsV0FBVyxDQUFDRjtJQUNyQ1YsSUFBSUcsTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztRQUFFTztRQUFPcEI7SUFBVztBQUMzQyIsInNvdXJjZXMiOlsid2VicGFjazovL215LXBvcnRmb2xpby8uL3NyYy9wYWdlcy9hcGkvbWVya2xlUHJvb2YuanM/N2ZmMyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXJrbGVUcmVlIH0gZnJvbSAnbWVya2xldHJlZWpzJztcclxuaW1wb3J0IGtlY2NhazI1NiBmcm9tICdrZWNjYWsyNTYnO1xyXG5cclxubGV0IHdoaXRlbGlzdCA9IFtdO1xyXG5sZXQgbWVya2xlVHJlZSA9IG51bGw7XHJcbmxldCBtZXJrbGVSb290ID0gbnVsbDtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZU1lcmtsZVRyZWUoKSB7XHJcbiAgY29uc3QgbGVhdmVzID0gd2hpdGVsaXN0Lm1hcCgoYWRkcikgPT4ga2VjY2FrMjU2KGFkZHIpKTtcclxuICBtZXJrbGVUcmVlID0gbmV3IE1lcmtsZVRyZWUobGVhdmVzLCBrZWNjYWsyNTYsIHsgc29ydFBhaXJzOiB0cnVlIH0pO1xyXG4gIG1lcmtsZVJvb3QgPSBtZXJrbGVUcmVlLmdldEhleFJvb3QoKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xyXG4gIGNvbnN0IHsgYWRkcmVzcyB9ID0gcmVxLnF1ZXJ5O1xyXG4gIGlmICghYWRkcmVzcykge1xyXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdBZGRyZXNzIGlzIHJlcXVpcmVkJyB9KTtcclxuICB9XHJcbiAgY29uc3QgbG93ZXJDYXNlQWRkcmVzcyA9IGFkZHJlc3MudG9Mb3dlckNhc2UoKTtcclxuICBpZiAoIXdoaXRlbGlzdC5pbmNsdWRlcyhsb3dlckNhc2VBZGRyZXNzKSkge1xyXG4gICAgd2hpdGVsaXN0LnB1c2gobG93ZXJDYXNlQWRkcmVzcyk7XHJcbiAgICB1cGRhdGVNZXJrbGVUcmVlKCk7XHJcbiAgfVxyXG4gIGNvbnN0IGxlYWYgPSBrZWNjYWsyNTYobG93ZXJDYXNlQWRkcmVzcyk7XHJcbiAgY29uc3QgcHJvb2YgPSBtZXJrbGVUcmVlLmdldEhleFByb29mKGxlYWYpO1xyXG4gIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgcHJvb2YsIG1lcmtsZVJvb3QgfSk7XHJcbn1cclxuIl0sIm5hbWVzIjpbIk1lcmtsZVRyZWUiLCJrZWNjYWsyNTYiLCJ3aGl0ZWxpc3QiLCJtZXJrbGVUcmVlIiwibWVya2xlUm9vdCIsInVwZGF0ZU1lcmtsZVRyZWUiLCJsZWF2ZXMiLCJtYXAiLCJhZGRyIiwic29ydFBhaXJzIiwiZ2V0SGV4Um9vdCIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJhZGRyZXNzIiwicXVlcnkiLCJzdGF0dXMiLCJqc29uIiwiZXJyb3IiLCJsb3dlckNhc2VBZGRyZXNzIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsInB1c2giLCJsZWFmIiwicHJvb2YiLCJnZXRIZXhQcm9vZiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./src/pages/api/merkleProof.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2FmerkleProof&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2FmerkleProof.js&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();