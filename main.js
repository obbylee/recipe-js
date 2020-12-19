const mealsElement = document.querySelector('#meals');
const favContainer = document.querySelector('#fav-meals');
const mealPopup = document.querySelector("#meal-popup");
const mealInfoEl = document.querySelector("#meal-info");
const popupCloseBtn = document.querySelector("#close-popup");
const searchTerm = document.querySelector("#search-term");
const searchBtn = document.querySelector("#searchBtn");


getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const randomMeal = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respond = await randomMeal.json();
    const respondData = respond.meals[0];
    
    addMeal(respondData, true);
}

async function getMealById(id) {
    const respond = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+ id);
    const data = await respond.json();
    const meal = data.meals[0];
    return meal;
}

async function getMealBySearch(term) {
    const respond = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?f=' + term);
    const data = await respond.json();
    const meals = data.meals;
    return meals;
}

function addMeal(mealData, random = false) {
    // console.log(mealData);

    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? '<span class="random"> Random recipe</span>' : ""}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>

        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn"><i class="fas fa-heart"></i></button>
        </div>
    `;

    const btn = meal.querySelector('.meal-body .fav-btn');
    // console.log(btn);
    btn.addEventListener('click', () => {
        // console.log('current data',mealData.idMeal);
        if (btn.classList.contains('active')) {
            removeMealLS(mealData.idMeal);
            // console.log(removeMealLS(mealData.idMeal));
            btn.classList.remove('active');
        } else {
            addMealLS(mealData.idMeal);
            btn.classList.add('active');
        }
        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsElement.appendChild(meal);
}

function addMealLS(mealid) {
    const id = getMealsLS();
    // console.log('this from add meals',id);
    localStorage.setItem("mealIds", JSON.stringify([...id, mealid]));
}

function getMealsLS() {
    const mealId = JSON.parse(localStorage.getItem("mealIds"));
    return mealId === null ? [] : mealId;
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();
    // Not delete, but replace current storage w\ current mealid
    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    ); 
    console.log(mealIds);
    console.log(mealId);
    console.log(mealIds.filter((id) => id !== mealId));
}

async function fetchFavMeals() {
    favContainer.innerHTML= '';
    const mealIds = getMealsLS();
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealFav(meal);
    }
}

function addMealFav(data) {
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img src="${data.strMealThumb}" alt="${data.strMeal}" /> 
        <span>${data.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector('.clear');
    btn.addEventListener('click', () => {
        removeMealLS(data.idMeal);
        fetchFavMeals();
    });

    favContainer.appendChild(favMeal);
}

function showMealInfo(data) {
    // rest content
    mealInfoEl.innerHTML = '';

    const info = document.createElement('div');
    const ingredients = [];

    // get ingridients
    for (let i = 1; i <= 20; i++) {
        if (data["strIngredient" + i]) {
            ingredients.push(
                `${data["strIngredient" + i]} - ${
                    data["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    info.innerHTML = `
        <h1>${data.strMeal}</h1>
        <img
            src="${data.strMealThumb}"
            alt="${data.strMeal}"
        />
        <p>
        ${data.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    mealInfoEl.appendChild(info);

    // show the popup
    mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener('click', async () => {
    
    mealsElement.innerHTML= '';
    const search = searchTerm.value;
    const meals = await getMealBySearch(search);
    // console.log(meals);

    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener('click' ,() => {
    mealPopup.classList.add('hidden');
});
