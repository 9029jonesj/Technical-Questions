var url = require("url"),
  data = {
    authenticatedUser: null,
    configurations: []
  };
const methods = {
  delete: "DELETE",
  get: "GET",
  put: "PUT",
  post: "POST",
  patch: "PATCH"
};
const pagination = {
  elementsPerPage: 2
};

/**
 * Check if configuration exists
 * @param  {string} username  configuration username
 * @return {Object[]}         boolean, configuration index
 */
function checkExists(username) {
  for(let config in data.configurations) {
    if (data.configurations[config].username === username) return [true, config];
  }
  return [false, null];
}

/**
 * Delete configuration
 * @param  {string} username configuration username
 * @return {Object[]}        boolean, configuration
 */
function deleteConfiguration(username) {
  var exists = checkExists(username);
  var configuration = null;

  if (exists[0]) {
    configuration = data.configurations[exists[1]];
    data.configurations.splice(exists[1], 1);
    return [true, configuration];
  } else {
    return [false, null];
  }
}

/**
 * Write HTTP response
 * @param {Object} res        response object
 * @param {number} statusCode
 * @param {string} message
 */
function writeResponse(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html"
  });
  res.end(message);
}

/**
 * Sort configurations
 * @param {string} orderBy  order configurations by
 * @param {string} order    asc or desc
 */
function sortConfiguratons(orderBy, order, callback) {
  switch (order) {
    case "ASC":
      data.configurations.sort(function(a, b) {
        if (typeof a[orderBy] === "number") return a[orderBy] - b[orderBy];
        return a[orderBy].localeCompare(b[orderBy]);
      });
      paginate(() => {
        callback();
      });
      break;
    case "DESC":
      data.configurations.sort(function(a, b) {
        if (typeof a[orderBy] === "number") return b[orderBy] - a[orderBy];
        return b[orderBy].localeCompare(a[orderBy]);
      });
      paginate(() => {
        callback();
      });
      break;
    default:
  }
}

/**
 * Paginate configurations
 */
function paginate(callback) {
  var count = 0;
  var page = 1;
  for (let config in data.configurations) {
    data.configurations[config].page = page;
    if (++count % 2 === 0) page++;
  }
  callback();
}

/**
 * Get configurations
 * @param {Object} res        response object
 */
function getConfigurations(res, page) {
  if (page === undefined) {
    for (let config in data.configurations) {
      res.write(JSON.stringify(data.configurations[config]));
      res.write("</br>");
    }
    res.end("Above are all available configurations.");
  } else {
    let pageConfigurations = JSON.parse(JSON.stringify(data.configurations));
    new Promise((resolve, reject) => {
      resolve(pageConfigurations.splice((pagination.elementsPerPage * page) - 2, pagination.elementsPerPage));
    }).then((result) => {
      for (let config in result) {
        res.write(JSON.stringify(result[config]));
        res.write("</br>");
      }
      res.end("Above are all available configurations.");
    });
  }
}

module.exports = {
  onRequest: function(req, res) {
    var payload = [];
    var reqMethod = req.method;
    var reqUrl = req.url.split("?")[0];
    var query = url.parse(req.url, true).query;

    // Get payload data
    req.on('data', (chunk) => {
      payload.push(chunk);
    }).on('end', () => {
      if (payload.length > 0) payload = JSON.parse(Buffer.concat(payload).toString());
      switch (true) {
        // Login Page
        case reqUrl === "/Login" && reqMethod === methods.get:
          writeResponse(res, 200, "Welcome to the Login Page!");
          break;
        case reqUrl === "/Login" && reqMethod === methods.post:
          try {
            if (data.authenticatedUser === null && payload.username.length > 0) {
              data.authenticatedUser = payload.username;
              writeResponse(res, 200, "Login successful.");
            } else {
              throw new Error();
            }
          } catch (err) {
            writeResponse(res, 400, "Login error.");
          }
          break;
          // Logout Page
        case reqUrl === "/Logout" && reqMethod === methods.get:
          if (data.authenticatedUser !== null) {
            data.authenticatedUser = null;
            writeResponse(res, 200, "You have been logged out.");
          } else {
            writeResponse(res, 403, "You must be logged in to perform this action.");
          }
          break;
          // Get Configurations
        case reqUrl === "/configuration-management/retrieve-configurations" && reqMethod === methods.get:
          res.writeHead(200, {
            "Content-Type": "text/html"
          });
          if (query.orderby === undefined && query.order === undefined) {
            getConfigurations(res, query.page);
          } else {
            let orderBy = query.orderby;
            let order = query.order;
            sortConfiguratons(orderBy, order, () => {
              getConfigurations(res, query.page);
            });
          }
          break;
          // Delete configuration -- Has query param
        case reqUrl === "/configuration-management/manage-configuration" && reqMethod === methods.delete:
          let deleted = deleteConfiguration(query.username);
          if (data.authenticatedUser === "admin" || query.username === data.authenticatedUser) {
            res.writeHead(200, {
              "Content-Type": "text/html"
            });
            if (deleted[0]) {
              paginate(() => {
                res.write(JSON.stringify(deleted[1]));
                res.write("</br>");
                res.end("Deleted above configuration.");
              });
            } else {
              res.end("Configuration does not exist.");
            }
          } else if (query.username !== data.authenticatedUser) {
            writeResponse(res, 403, "Unable to delete another user's configuration.");
          } else {
            writeResponse(res, 401, "Please login to perform this action.");
          }
          break;
          // Create configuration
        case reqUrl === "/configuration-management/manage-configuration" && reqMethod === methods.post:
          let configurations = payload.configurations;
          res.writeHead(201, {
            "Content-Type": "text/html"
          });
          for (let config in configurations) {
            let configuration = {
              name: (configurations[config].name === null || configurations[config].name === null) ? "" : configurations[config].name,
              hostname: (configurations[config].hostname === null || configurations[config].hostname === null) ? "" : configurations[config].hostname,
              port: (configurations[config].port === null || configurations[config].port === null) ? "" : configurations[config].port,
              username: (configurations[config].username === null || configurations[config].username === null) ? "" : configurations[config].username,
              page: 0
            };

            if ((data.authenticatedUser === "admin" || configurations[config].username === data.authenticatedUser) && !checkExists(configuration.username)[0]) {
              data.configurations.push(configuration);
              paginate(() => {
                res.write(JSON.stringify(configuration));
                res.write("</br>");
                res.write("Above configuration added.");
                res.write("</br>");
              });
            } else {
              res.write(JSON.stringify(configuration));
              res.write("</br>");
              res.write("Configuration could not be added.");
              res.write("</br>");
            }
          }
          res.end();
          break;
          // Modify configuration -- Has query param
        case reqUrl === "/configuration-management/manage-configuration" && reqMethod === methods.put:
          if (data.authenticatedUser === "admin" || query.username === data.authenticatedUser) {
            let configuration = {
              name: (payload.name === undefined || payload.name === null) ? "" : payload.name,
              hostname: (payload.hostname === undefined || payload.hostname === null) ? "" : payload.hostname,
              port: (payload.port === undefined || payload.port === null) ? "" : payload.port,
              username: null,
              page: 0
            };
            let exists = checkExists(query.username);

            if (data.authenticatedUser === "admin" || query.username === data.authenticatedUser) {
              if (exists[0]) {
                configuration.username = data.configurations[exists[1]].username;
                configuration.page = data.configurations[exists[1]].page;
                data.configurations[exists[1]] = configuration;
              }
              res.writeHead(200, {
                "Content-Type": "text/html"
              });
              res.write("Updated configuration:");
              res.write("</br>");
              res.end(JSON.stringify(data.configurations[exists[1]]));
            } else if (query.username !== data.authenticatedUser) {
              writeResponse(res, 403, "Unable to modify another user's configuration.");
            } else {
              writeResponse(res, 401, "Please login to perform this action.");
            }
          } else if (query.username !== data.authenticatedUser) {
            writeResponse(res, 403, "Unable to modify another user's configuration.");
          } else {
            writeResponse(res, 401, "Please login to perform this action.");
          }
          break;
          // Modify configuration -- Has query param
        case reqUrl === "/configuration-management/manage-configuration" && reqMethod === methods.patch:
          if (data.authenticatedUser === "admin" || query.username === data.authenticatedUser) {
            let hostname = (payload.hostname === undefined || payload.hostname === null) ? "" : payload.hostname;
            let port = (payload.port === undefined || payload.port === null) ? "" : payload.port;
            let name = (payload.name === undefined || payload.name === null) ? "" : payload.name;
            let exists = checkExists(query.username);

            if (exists[0]) {
              if (hostname.length > 0) data.configurations[exists[1]].hostname = hostname;
              if (port.length > 0) data.configurations[exists[1]].port = port;
              if (name.length > 0) data.configurations[exists[1]].name = name;
              res.writeHead(200, {
                "Content-Type": "text/html"
              });
              res.write("Updated configuration:");
              res.write("</br>");
              res.end(JSON.stringify(data.configurations[exists[1]]));
            } else {
              writeResponse(res, 404, "Configuration does not exist.");
            }
          } else if (query.username !== data.authenticatedUser) {
            writeResponse(res, 403, "Unable to modify another user's configuration.");
          } else {
            writeResponse(res, 401, "Please login to perform this action.");
          }
          break;
        default:
          writeResponse(res, 404, "404 error! File not found.");
      }
    });
  }
};
