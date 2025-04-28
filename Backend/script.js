//0. Girl, don't forget to declare the gallery!!

let gallery = document.querySelector(".gallery");

//declaring the buttons!
let sectionFiltres = document.querySelector(".section-filtres");

// 1.declare WORKS as a global variable (filled ulteriourly inside the FETCH function)
let works = [];

//1.1 declare CATEGORIES as a global variable (filled ulteriourly insite the FETCH function)
let categories = [];

// 2. Fonction FETCH - I get the WORKS from the API!
const fetchWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    works = await response.json(); //HERE IM FILLING MY GLOBAL WORKS VARIABLE!!!!
    displayWorks(works); // Display everything
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
};

// 2. Fonction FETCH - I get the CATEGORIES from the API!
const fetchCategories = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    categories = await response.json(); //HERE IM FILLING MY GLOBAL CATEGORIES VARIABLE!!!!
    console.log(categories);
    appendButtons(categories); // Add this here!
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

// 4. Fonction DISPLAY - adds the figures to the DOM

function displayWorks(worksToDisplay) {
  gallery.innerHTML = ""; // clear previous items
  worksToDisplay.forEach((work) => {
    const figure = createFigure(work);
    gallery.appendChild(figure);
  });
}

//CREATING THE BUTTONS

function createButtons(btn) {
  const button = document.createElement("button");
  button.innerText = btn.name;
  button.id = `category-${btn.id}`;

  // Add the event listener dynamically:
  button.addEventListener("click", () => {
    if (btn.id === 0) {
      // If it's the "All" button (id 0), display everything
      displayWorks(works);
    } else {
      // Otherwise, filter by category id
      const filteredWorks = works.filter((work) => work.category.id === btn.id); //we check if work.category.id === btn.id — matching work to category!
      displayWorks(filteredWorks);
    }
  });

  return button;
}

//APPENDING THE BUTTONS

function appendButtons(dynamicButtons) {
  sectionFiltres.innerHTML = ""; // clear previous buttons
  dynamicButtons.forEach((btn) => {
    const button = createButtons(btn);
    sectionFiltres.appendChild(button);
  });
}

fetchCategories();

fetchWorks();
