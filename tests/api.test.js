const request = require("supertest");
const app = require("../app");

const fs = require("fs");
const path = require("path");
const dbPath = path.join("db", "favorites.json");

describe("Test GET endpoint", () => {
  test("It should response the GET method with standard number of entries", async () => {
    const response = await request(app).get("/data");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(30);
  });

  test("It should process filtering by language", async () => {
    const LANG = "Python";
    const response = await request(app).get(`/data?language=${LANG}`);

    response.body.forEach((item) => {
      expect(item.language).toBe(LANG);
    });
  });

  test("It should process filtering by favorites flag", async () => {
    const response = await request(app).get(`/data?isFavorite=true`);

    response.body.forEach((item) => {
      expect(item.isFavorite).toBe(true);
    });
  });
});

describe("Test POST endpoint", () => {
  test("It should put a URL into local database", async () => {
    const randomString = Math.floor(10 ** 8 * Math.random()).toString();

    const response = await request(app).post("/fav").send({
      url: randomString,
    });

    const dbContent = fs.readFileSync(dbPath, "utf8");
    const favoritesArray = JSON.parse(dbContent);

    expect(response.statusCode).toBe(200);
    expect(favoritesArray.indexOf(randomString)).not.toBe(-1);
  });
});
