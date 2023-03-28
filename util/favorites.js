const fs = require("fs");
const path = require("path");

const favPath = path.join("db", "favorites.json");

function getFavorites() {
  if (fs.existsSync(favPath)) {
    const favoritesArray = fs.readFileSync(favPath, "utf8");
    let data;

    try {
      data = JSON.parse(favoritesArray);
    } catch (e) {
      console.log("Error parsing favorites.json");
      data = [];
    }
    return data;
  } else {
    return [];
  }
}

function toggleFavorite(favoriteURL) {
  const arr = getFavorites();

  if (arr.indexOf(favoriteURL) > -1) {
    arr.splice(arr.indexOf(favoriteURL), 1);
  } else {
    arr.push(favoriteURL);
  }
  fs.writeFileSync(favPath, JSON.stringify(arr), "utf8");
}

module.exports = {
  getFavorites,
  toggleFavorite,
};
