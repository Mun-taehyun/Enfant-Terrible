// server.cjs
const path = require("path");
const jsonServer = require("json-server");

const common = require("./mock/common.cjs");
const registerSalesRoutes = require("./mock/sales.routes.cjs");
const registerUsersRoutes = require("./mock/users.routes.cjs");
const registerCategoriesRoutes = require("./mock/categories.routes.cjs");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// 304 방지
server.disable("etag");

// 캐시 차단
server.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ✅ 라우트 등록(반드시 server.use(router)보다 위)
registerSalesRoutes(server, router, common);
registerUsersRoutes(server, router, common);
registerCategoriesRoutes(server, router, common);

// 기본 router (리소스 기본 CRUD가 필요하면 유지)
server.use(router);

server.listen(8080, () => {
  console.log("Mock API running: http://localhost:8080");
});
