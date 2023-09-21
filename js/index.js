const filterLink = document.querySelectorAll('[data-filter]');
const active = 'active';
const searchBox = document.querySelector('#search');
const main = document.getElementById('main');
const favs = document.getElementById('favorites');
const toggleButton = document.getElementById('toggleButton');
const categories = document.getElementById('categories');
const mainCollection = document.getElementById('main-collection');
const options = document.querySelectorAll('[id*="-options-"]');
const resetButton = document.querySelector('#reset');
const foodAbbreviations = {
    b: "beef",
    sp: "house specialties",
    nf: "mei fan",
    ds: "desserts"
};


window.addEventListener('load', async function () {

    const collection = await fetchData();
    const flattenedFoods = Object.values(collection).reduce(
        (acc, categoryFoods) => [...acc, ...categoryFoods]
        , []);
    const mainSort = document.getElementById('sort-options-main').value;
    const mainOrder = document.getElementById('order-options-main').value;
    sortCollection(flattenedFoods, mainSort, mainOrder, false);
    flattenedFoods.forEach(food => main.appendChild(createDiv(food)));

    const foods = document.querySelectorAll('.dynamic-div');
    foods.forEach((food) => {
        food.addEventListener('click', function () {
            const itemId = this.id;
            const direction = this.parentNode.id === 'favorites' ? 'toMain' : 'toFavs';
            updateCollections(itemId, direction);
        });
    });
    updateResults('main', true);
})

function removeDigits(inputString) {
    return inputString.replace(/\d/g, '');
}

function getCategory(inputString) {
    return removeDigits(inputString.slice(0, 2));
}


async function fetchData() {
    try {
        const response = await fetch('https://www.davidchuschinabistro.com/menu_items.json');
        const data = await response.json();
        const collection = {
            B: [],
            SP: [],
            NF: [],
            DS: []
        }
        data.menu_items.forEach(item => {
            const abbreviation = getCategory(item.short_name);
            if (collection[abbreviation]) {
                collection[abbreviation].push(item);
            }
        });
        return collection;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateResults(id, showHidden) {
    const resultParagraph = document.getElementById(`${id}-results`);
    const foodsDiv = document.querySelectorAll(`#${id} .dynamic-div`);
    const count = showHidden ? foodsDiv.length : Array.from(foodsDiv).filter(div => getComputedStyle(div).display !== 'none').length;
    resultParagraph.textContent = `Showing ${count} results`;
}


function createDiv(food) {

    const newDiv = document.createElement('div');
    const shortName = food["short_name"];
    const category = getCategory(shortName);
    newDiv.className = 'dynamic-div';
    newDiv.setAttribute('data-item', category.toLowerCase());
    newDiv.id = food.id;

    const leftDiv = document.createElement('div');
    leftDiv.className = 'left-div';

    const id = document.createElement('h5');
    id.textContent = `#${food.id}`;
    const name = document.createElement('h4');
    name.textContent = food.name;
    name.className = "truncate-text";

    const description = document.createElement('p');
    description.textContent = food.description;
    description.className = "truncate-text truncate-description";

    leftDiv.appendChild(id);
    leftDiv.appendChild(name);
    leftDiv.appendChild(description);

    const rightDiv = document.createElement('div');
    rightDiv.className = 'right-div';

    const topPart = document.createElement('top-part');
    topPart.className = 'top-part';
    const button = document.createElement('button');
    button.innerHTML = '<i class="fa-solid fa-star"></i>';
    button.className = "btn";

    const info = document.createElement('div');
    info.className = 'info';

    const price = document.createElement('p');
    price.textContent = `\$${food.price_large}`;
    price.className = 'price-tag';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'image-div';
    const image = document.createElement('img');
    image.src = `./assets/menu/${category}/${shortName}.jpg`;
    image.alt = `${food.name}`;

    const foodId = document.createElement('p');
    foodId.textContent = shortName;
    foodId.className = 'id-tag';

    topPart.appendChild(button);
    topPart.appendChild(price);
    imageDiv.appendChild(image);
    imageDiv.appendChild(foodId);
    info.appendChild(imageDiv);

    rightDiv.appendChild(topPart);
    rightDiv.appendChild(info);

    newDiv.appendChild(leftDiv);
    newDiv.appendChild(rightDiv);
    return newDiv;
}


toggleButton.addEventListener('click', () => {
    if (categories.classList.contains('hidden')) {
        const foodsDiv = Array.from(main.querySelectorAll('.dynamic-div'));
        const collection = {};
        foodsDiv.forEach(food => {
            const category = food.dataset.item;
            if (collection[category]) {
                collection[category].push(food);
            }
            else {
                collection[category] = [food];
            }
        });
        for (const [key, value] of Object.entries(collection)) {
            const sortOption = document.getElementById(`sort-options-${key}`).value;
            const orderOption = document.getElementById(`order-options-${key}`).value;
            sortCollection(value, sortOption, orderOption, true);
            const categoryDiv = document.getElementById(key);
            value.forEach(foodDiv => {
                foodDiv.style.display = 'grid';
                categoryDiv.appendChild(foodDiv);
            });
            updateResults(key, true);
        }
    }
    else {
        const foodsDiv = Array.from(categories.querySelectorAll('.category .dynamic-div'));
        const mainSort = document.getElementById('sort-options-main').value;
        const mainOrder = document.getElementById('order-options-main').value;
        sortCollection(foodsDiv, mainSort, mainOrder, true);
        foodsDiv.forEach(food => main.appendChild(food));
        const activeFilter = document.querySelector('.filter-link.active');
        mainFilter.call(activeFilter);
    }
    categories.classList.toggle('hidden');
    mainCollection.classList.toggle('hidden');
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    links.forEach(l => l.classList.toggle('hidden'));
});

function sortCollection(collection, sortOption, orderOption, isElements) {
    collection.sort((a, b) => {
        const aValue = sortOption === 'id' ? +a.id : isElements ? a.querySelector('.left-div h4').textContent : a.name;
        const bValue = sortOption === 'id' ? +b.id : isElements ? b.querySelector('.left-div h4').textContent : b.name;
        const ascComparisonValue = aValue > bValue ? 1 : -1;
        return orderOption === 'asc' ? ascComparisonValue : -1 * ascComparisonValue;
    });
}

function sortData(id, sortOption, orderOption) {
    const collectionDiv = document.getElementById(id);
    const items = Array.from(collectionDiv.children);
    items.sort((a, b) => {
        const aValue = sortOption === 'id' ? +a.id : a.querySelector('.left-div h4').textContent;
        const bValue = sortOption === 'id' ? +b.id : b.querySelector('.left-div h4').textContent;
        const ascComparisonValue = aValue > bValue ? 1 : -1;
        return orderOption === 'asc' ? ascComparisonValue : -1 * ascComparisonValue;
    });
    collectionDiv.innerHTML = '';
    items.forEach(item => collectionDiv.appendChild(item));
}

function optionOnChangeHandler(event) {
    const id = event.target.id;
    const collectionId = id.slice(id.lastIndexOf('-') + 1);
    const sortOption = document.getElementById(`sort-options-${collectionId}`).value;
    const orderOption = document.getElementById(`order-options-${collectionId}`).value;
    sortData(collectionId, sortOption, orderOption);
}

for (const option of options) {
    option.addEventListener('change', optionOnChangeHandler);
}


searchBox.addEventListener('keyup', function (e) {
    const searchInput = e.target.value.toLowerCase().trim();
    const activeFilter = Array.from(filterLink).find(node => node.classList.contains('active')).dataset.filter;
    main.querySelectorAll('.dynamic-div').forEach((food) => {
        const name = food.querySelector('.left-div h4').textContent.toLowerCase();
        const category = food.dataset.item;
        if (activeFilter != 'all' && category != activeFilter) {
            food.style.display = 'none';
            return;
        }
        else if (name.includes(searchInput) || foodAbbreviations[category].includes(searchInput)) {
            food.style.display = 'grid';
        } else {
            food.style.display = 'none';
        }
    })
    updateResults('main', false);
});

const setActive = (elm, selector) => {
    if (document.querySelector(`${selector}.${active}`) !== null) {
        document.querySelector(`${selector}.${active}`).classList.remove(active);
    }
    elm.classList.add(active);
};


function mainFilter() {
    searchBox.value = '';
    setActive(this, '.filter-link');
    const filter = this.dataset.filter;
    main.querySelectorAll('.dynamic-div').forEach((food) => {
        if (filter === 'all') {
            food.style.display = 'grid';
        } else if (food.dataset.item === filter) {
            food.style.display = 'grid';
        } else {
            food.style.display = 'none';
        }
    });
    updateResults('main', false);
}

for (const link of filterLink) {
    link.addEventListener('click', mainFilter);
}

function updateCollections(id, direction) {
    const isToFavs = direction === 'toFavs';
    if (isToFavs) {
        const count = favs.querySelectorAll('.dynamic-div').length;
        if (count == 3) {
            alert('You may select up to 3 favorites food.');
            return;
        }
    }
    const divWithId = document.getElementById(id);
    const currentParId = divWithId.parentElement.id;
    const nextDiv = isToFavs ? favs : main.parentNode.classList.contains('hidden') ? categories.querySelector(`#${divWithId.dataset.item}`) : main;
    const iElement = divWithId.querySelector('i');
    const category = divWithId.dataset.item;
    if (isToFavs) {
        iElement.classList.add('active');
        nextDiv.appendChild(divWithId);
        updateResults(currentParId, false);
    }
    else {
        iElement.classList.remove('active');
        const sortOption = document.getElementById(`sort-options-${nextDiv.id}`).value;
        const orderOption = document.getElementById(`order-options-${nextDiv.id}`).value;
        const elementsList = Array.from(nextDiv.querySelectorAll('.dynamic-div'));
        const elementValue = sortOption === 'id' ? +id : divWithId.querySelector('.left-div h4').textContent;
        const elementsValue = elementsList.map(e => {
            return sortOption === 'id' ? +e.id : e.querySelector('.left-div h4').textContent;
        });
        const proceedingIndex = orderOption == 'asc' ? findMaxValueLessThanA(elementsValue, elementValue) : findMinValueGreaterThanA(elementsValue, elementValue);
        if (proceedingIndex != undefined) {
            elementsList[proceedingIndex].insertAdjacentElement('afterend', divWithId);
        } else {

            nextDiv.insertAdjacentElement('afterbegin', divWithId);
        }
        console.log(nextDiv.id);
        updateResults(nextDiv.id, false);
    }
}


function findMaxValueLessThanA(arr, a) {
    let left = 0;
    let right = arr.length - 1;
    let result = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] < a) {
            result = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    if (result !== -1) {
        return result;
    } else {
        return undefined;
    }
}

function findMinValueGreaterThanA(arr, a) {
    let left = 0;
    let right = arr.length - 1;
    let result = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] > a) {
            result = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (result !== -1) {
        return result;
    } else {
        return undefined;
    }
}

const navButton = document.querySelector('button[aria-expanded]');
var spanElement = document.querySelector(".navbar-toggler span");
navButton.addEventListener('click', function toggleNav() {
    const expanded = navButton.getAttribute('aria-expanded') === 'true';
    navButton.setAttribute('aria-expanded', !expanded);
    spanElement.textContent = !expanded ? "\u2716" : "\u2630";
});

document.querySelectorAll('.nav-link a').forEach(l => l.addEventListener('click', () => {
    navButton.setAttribute('aria-expanded', false);
}))