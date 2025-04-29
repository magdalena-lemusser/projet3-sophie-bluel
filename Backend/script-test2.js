const fetchCategories = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    categories = await response.json(); //HERE IM FILLING MY GLOBAL CATEGORIES VARIABLE!!!!
    console.log(categories);
    // Add the "All" category manually first so it appears first!)
    const allCategory = { id: 0, name: "Tous" };
    const allCategories = [allCategory, ...categories]; // Using spread syntax to combine both arrays
    appendButtons(allCategories);
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
};
