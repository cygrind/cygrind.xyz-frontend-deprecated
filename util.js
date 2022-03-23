const aero = require("@aero/http");

module.exports = {
    apiReq:
        async (body, endpoint, query, private, method = "GET") => {
            let headers;
            let json = null;

            if (private) {
                headers = { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.CYGRIND_API_TOKEN };
            } else {
                headers = { "Content-Type": "application/json" };
            }

            if (method !== "GET") {
                json = JSON.stringify(body);
            }

            let apiRes = await aero(`http://127.0.0.1:8080/${endpoint}${query ? query : ""}`)
                .method(method)
                .header(headers)
                .body(json)
                .send();

            let out = await apiRes.body.json();

            return [apiRes.statusCode, out];
        }
}