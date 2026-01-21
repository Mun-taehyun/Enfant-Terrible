// server.cjs
const path = require("path");
const jsonServer = require("json-server");
const bodyParser = require("body-parser");

const common = require("./mock/common.cjs");


const registerSalesRoutes = require("./mock/sales.routes.cjs");
const registerUsersRoutes = require("./mock/users.routes.cjs");
const registerCategoriesRoutes = require("./mock/categories.routes.cjs");
const registerProductsRoutes = require("./mock/products.routes.cjs");
const registerQnaRoutes = require("./mock/qna.routes.cjs");
const registerPaymentsRoutes = require("./mock/payments.routes.cjs");
const registerDiscountRoutes = require("./mock/discounts.routes.cjs");
const registerPostsRoutes = require("./mock/posts.routes.cjs");
const registerPopupsRoutes = require("./mock/popups.routes.cjs");



const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);

// JSON strict 모드 해제
server.use(bodyParser.json({ strict: false }));
server.use(bodyParser.urlencoded({ extended: true }));

// 304 방지
server.disable("etag");

// 캐시 차단
server.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// 라우트 등록(반드시 server.use(router)보다 위)
registerSalesRoutes(server, router, common);
registerUsersRoutes(server, router, common);
registerCategoriesRoutes(server, router, common);
registerProductsRoutes(server, router, common);
registerQnaRoutes(server, router, common);
registerPaymentsRoutes(server, router, common);
registerDiscountRoutes(server, router, common);
registerPostsRoutes(server, router, common);
registerPopupsRoutes(server, router, common);


// 기본 router
server.use(router);

server.listen(8080, () => {
  console.log("Mock API running: http://localhost:8080");
});
