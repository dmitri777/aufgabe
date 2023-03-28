const express = require("express");
const path = require("path");
const moment = require("moment");

const { getFavorites, toggleFavorite } = require("./util/favorites");

const ONE_WEEK_AGO_DATE = moment().subtract(1, "weeks").format("YYYY-MM-DD");
const GITHUB_PROJECTS_URL = `https://api.github.com/search/repositories?q=created:%3E${ONE_WEEK_AGO_DATE}&sort=stars&order=desc`;

const app = express();

app.set("views", path.join(".", "view"));
app.set("view engine", "ejs");

/**
 * 1. Shows all repos using HTML template
 * 2. Allows to toggle favorites
 */
app.get("/", async function (req, res) {
  const data = await getAllData(req);

  if (data.error) {
    res.render("error", { message: data.error });
  } else {
    res.render("repos", {
      repos: data.repos,
      since: ONE_WEEK_AGO_DATE,
    });
  }
});

/**
 * 1. Shows only favorites repos using HTML template
 * 2. Allows to toggle favorites
 */
app.get("/fav", async function (req, res) {
  const data = await getAllData(req);

  if (data.error) {
    res.render("error", { message: data.error });
  } else {
    const favoriteRepos = data.repos.filter((item) => {
      return item.isFavorite;
    });
    res.render("repos", {
      repos: favoriteRepos,
      since: ONE_WEEK_AGO_DATE,
    });
  }
});

/**
 * 1. Shows repos as JSON data
 * 2. Allows to filter by language and by favorite flag
 */
app.get("/data", async function (req, res) {
  const data = await getAllData(req);

  if (data.error) {
    res.status(500).json({ error: data.error });
  } else {
    const query = req.query;
    const filteredByLanguage = data.repos.filter((item) => {
      if (query.language) {
        return item.language === query.language;
      } else {
        return true;
      }
    });

    const filteredByFavoriteFlag = filteredByLanguage.filter((item) => {
      if (query.isFavorite === "true") {
        return item.isFavorite;
      } else {
        return true;
      }
    });

    res.status(200).json(filteredByFavoriteFlag);
  }
});

/**
 * Allows to toggle favorite flag of particular repo, storing it in local database
 */
app.post("/fav", express.json(), function (req, res) {
  console.log(req);

  toggleFavorite(req.body.url);
  res.status(200).json({ status: "ok" });
});

/**
 * 1. Grabs all data from GitHub API
 * 2. Removes unnecessary fields
 * 3. Adds favorite flag from local database
 */
async function getAllData() {
  const response = await fetch(GITHUB_PROJECTS_URL);
  const fullData = await response.json();
  const favorites = getFavorites();

  if (fullData.items) {
    const summaryData = fullData.items.map((item) => {
      return {
        html_url: item.html_url,
        full_name: item.full_name,
        description: item.description,
        stargazers_count: item.stargazers_count,
        language: item.language,
        isFavorite: favorites.indexOf(item.html_url) > -1,
      };
    });

    return { repos: summaryData };
  } else {
    return { error: fullData.message };
  }
}

module.exports = app;
