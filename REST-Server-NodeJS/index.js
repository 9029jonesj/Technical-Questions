var http = require("http"),
    routes = require("./routes");

http.createServer(routes.onRequest).listen(9000);
console.log("Server has started on port 9000.");
