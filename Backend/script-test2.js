// 1.declare WORKS as a global variable (filled inside the FETCH function)
let works = [];

// 2. Fonction FETCH - I get the stuff from the API!
const fetchWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    works = await response.json(); //HERE IM FILLING MY GLOBAL WORKS VARIABLE!!!!
    displayWorks(works); // Display everything
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
};

// 3. Fonction CREATEFIGURE - handles the HTML for each figure

function createFigure({ imageUrl, title }) {
  const figure = document.createElement("figure");
  figure.innerHTML = `
      <img src="${imageUrl}" alt="${title}" />
      <figcaption>${title}</figcaption>
    `;
  return figure;
}

// 3. Fonction DISPLAY - adds the figures to the DOM

function displayWorks(worksToDisplay) {
  gallery.innerHTML = ""; // clear previous items
  worksToDisplay.forEach((work) => {
    const figure = createFigure(work);
    gallery.appendChild(figure);
  });
}

//5 .0 making the "all" filter button
const btnTous = document.querySelector("#tous");
btnTous.addEventListener("click", () => {
  displayWorks(works);
});

//5.1 making the "objets" filter button, baby!

const btnObjets = document.querySelector("#objets");
btnObjets.addEventListener("click", () => {
  const worksFiltres = works.filter((work) => work.category.name === "Objets");
  displayWorks(worksFiltres);
});

//5.2 making the "appartments" filter button, baby!

const btnAppartements = document.querySelector("#appartements");
btnAppartements.addEventListener("click", () => {
  const worksFiltres = works.filter(
    (work) => work.category.name === "Appartements"
  );
  displayWorks(worksFiltres);
});

//5.3 making the "hotels" filter button, baby!

const btnHotels = document.querySelector("#hotels");
btnHotels.addEventListener("click", () => {
  const worksFiltres = works.filter(
    (work) => work.category.name === "Hotels & restaurants"
  );
  displayWorks(worksFiltres);
});

// 6. Initializing my code - keep this at the end!
fetchWorks();

// 5. Initializing my code - keep this at the end!
fetchWorks();
