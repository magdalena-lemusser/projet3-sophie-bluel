// Sélection de la galerie
const gallery = document.querySelector(".gallery");

// Fonction principale qui récupère les travaux et les affiche
const fetchAndDisplayWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    console.log(works); // Pour débugguer, garder pour l’instant

    // Nettoie la galerie (utile si on réutilise cette fonction plus tard)
    gallery.innerHTML = "";

    // Pour chaque travail, on crée une figure et on l’ajoute à la galerie
    works.forEach((work) => {
      const figure = createFigure(work);
      gallery.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
};

// Fonction utilitaire pour créer un élément figure
function createFigure({ imageUrl, title }) {
  const figure = document.createElement("figure");
  figure.innerHTML = `
    <img src="${imageUrl}" alt="${title}" />
    <figcaption>${title}</figcaption>
  `;
  return figure;
}

// Appel de la fonction principale
fetchAndDisplayWorks();
